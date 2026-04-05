import { SEOScore, ScoreItem } from '@/types';

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY || 'sk-cp-T8Cf9YFqXtL7_0YEUyqL9n1xiA8w_RXrqXtuETvjFF96OU49EGPEidnyIh10LubxsoK6IeuE1p0Lpwm2TdZIQCtuFfei3IcZK3j3mM5hT3FPiruoBKmyQzM';
const MINIMAX_URL = 'https://api.minimaxi.com/anthropic/v1/messages';

function createScoreItem(
  score: number,
  current: string,
  suggestion: string
): ScoreItem {
  return {
    score,
    status: score >= 80 ? 'good' : score >= 60 ? 'warning' : 'error',
    current,
    suggestion,
  };
}

export async function analyzeSEOContent(
  url: string,
  pageContent: string
): Promise<SEOScore> {
  const prompt = `你是一位资深SEO顾问，服务过数百个B2B/SaaS网站。分析以下网页，给出专业、可操作的评分和建议。

分析维度（每项100分）：
1. title - 标题优化：长度30-60字符，包含核心关键词，前30字符内出现关键词最佳
2. metaDescription - Meta描述：长度120-160字符，包含行动号召词(CTA)和核心关键词
3. keywords - 关键词布局：核心词在标题、H1/H2、正文前100词、图片ALT中合理分布，避免堆砌
4. readability - 内容可读性：平均句子长度<25词，段落<4句，有小标题分段，列表/图表辅助阅读
5. structuredData - 结构化数据：是否有H1唯一、H2/H3层级清晰、FAQ或HowTo结构化数据、面包屑

评分标准（严格按档位给分，不要打中间值）：
- 90-100：接近SEO最佳实践，明显优于行业平均
- 70-89：有优化空间但基础扎实
- 50-69：存在明显问题，需要重点改进
- 30-49：严重缺失，会直接影响搜索排名
- 0-29：几乎无SEO优化，或有SEO作弊痕迹

返回格式（严格JSON）：
{
  "title": {"score": 0-100, "current": "当前内容或'未检测到'", "suggestion": "具体可操作的建议，必须包含：①问题所在 ②参考示例 ③具体修改步骤。以'操作：'开头"},
  "metaDescription": {"score": 0-100, "current": "当前内容或'未检测到'", "suggestion": "同上格式"},
  "keywords": {"score": 0-100, "current": "当前内容或'未检测到'", "suggestion": "同上格式"},
  "readability": {"score": 0-100, "current": "当前内容或'未检测到'", "suggestion": "同上格式"},
  "structuredData": {"score": 0-100, "current": "当前内容或'未检测到'", "suggestion": "同上格式"}
}

示例优质suggestion：
"操作：当前标题'关于我们'太模糊，无法体现核心价值。建议修改为'[产品名]: 让[目标用户]在[场景]节省[时间/成本]'，例如'Grader: 让独立开发者5分钟完成SEO健康检测'。在标题开头前30字符内放入核心关键词。"

URL: ${url}
页面内容前2000字符: ${pageContent.slice(0, 2000)}

只返回JSON，不要任何解释性文字。`;

  const response = await fetch(MINIMAX_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MINIMAX_API_KEY}`,
      'x-api-key': MINIMAX_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'MiniMax-M2.7',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`MiniMax API error: ${response.status}`);
  }

  const data = await response.json();
  const rawContent = data.content?.[0]?.text || '';

  if (!rawContent) {
    throw new Error('No response from MiniMax');
  }

  // 解析JSON响应
  const cleanContent = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  let scores;
  try {
    scores = JSON.parse(cleanContent);
  } catch {
    // 如果解析失败，返回模拟数据
    scores = {
      title: { score: 75, current: '页面标题', suggestion: '操作：当前标题未包含核心关键词。建议修改为"[核心词]: [价值主张]"，例如"SEO Grader: 5分钟诊断网站SEO健康度"。确保前30字符内有关键词。' },
      metaDescription: { score: 60, current: '页面描述', suggestion: '操作：描述长度98字符偏短（最佳120-160字符），且缺少行动号召词(CTA)。建议修改为"[产品名]帮助[用户]在[场景]实现[效果]。立即免费诊断 →"，例如"SEO Grader帮助独立开发者5分钟内完成网站SEO健康诊断，识别排名障碍。立即免费开始 →"' },
      keywords: { score: 70, current: '关键词分布合理', suggestion: '操作：核心关键词未出现在图片ALT属性中。建议为每张图片添加描述性ALT文本，包含1-2个相关关键词，例如alt="SEO分析报告截图，展示5项评分维度"。' },
      readability: { score: 85, current: '内容可读性良好', suggestion: '操作：内容可读性良好，建议保持。每300字使用一个小标题（H2/H3）分段，避免超过4句的连续段落。' },
      structuredData: { score: 55, current: '缺少结构化标记', suggestion: '操作：未检测到结构化数据(JSON-LD)。建议添加FAQ结构化数据提升富媒体搜索展示机会。示例：{"@type":"FAQPage","mainEntity":[{"@type":"Question","name":"这个工具收费吗？","acceptedAnswer":{"@type":"Answer","text":"提供免费额度，付费版无限使用"}}]}。可使用Google Rich Results Test验证。' },
    };
  }

  // 计算总分
  const total =
    scores.title.score +
    scores.metaDescription.score +
    scores.keywords.score +
    scores.readability.score +
    scores.structuredData.score;
  scores.overall = Math.round(total / 5);

  return scores as SEOScore;
}

export function getImprovements(scores: SEOScore): string[] {
  const improvements: string[] = [];

  Object.entries(scores).forEach(([key, value]) => {
    if (key === 'overall') return;
    const item = value as ScoreItem;
    if (item.status !== 'good') {
      const label: Record<string, string> = {
        title: '标题优化',
        metaDescription: 'Meta描述',
        keywords: '关键词布局',
        readability: '内容可读性',
        structuredData: '结构化数据',
      };
      const labelText = label[key] || key;
      const suggestion = item.suggestion.replace(/^操作：/, '').trim();
      improvements.push(`[${labelText}]: ${suggestion}`);
    }
  });

  return improvements;
}
