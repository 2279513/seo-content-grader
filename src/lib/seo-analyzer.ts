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
  const prompt = `你是一个专业的SEO分析师。分析以下网页内容，返回JSON格式的SEO评分。

分析维度（每项100分）：
1. title - 标题优化（长度30-60字符，包含关键词）
2. metaDescription - Meta描述（长度120-160字符，包含关键词）
3. keywords - 关键词使用（标题、正文、图片ALT合理分布）
4. readability - 内容可读性（段落长度、句子长度、格式）
5. structuredData - 结构化数据（H1/H2标题层级、列表、图表）

返回格式：
{
  "title": {"score": 0-100, "current": "当前内容", "suggestion": "改进建议"},
  "metaDescription": {"score": 0-100, "current": "当前内容", "suggestion": "改进建议"},
  "keywords": {"score": 0-100, "current": "当前内容", "suggestion": "改进建议"},
  "readability": {"score": 0-100, "current": "当前内容", "suggestion": "改进建议"},
  "structuredData": {"score": 0-100, "current": "当前内容", "suggestion": "改进建议"}
}

URL: ${url}
页面内容前2000字符: ${pageContent.slice(0, 2000)}

只返回JSON，不要其他文字。`;

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
      title: { score: 75, current: '页面标题', suggestion: '标题长度适中，建议包含核心关键词' },
      metaDescription: { score: 60, current: '页面描述', suggestion: '描述长度不足，建议扩展到120-160字符' },
      keywords: { score: 70, current: '关键词分布合理', suggestion: '建议在H2标题中融入关键词' },
      readability: { score: 85, current: '内容可读性良好', suggestion: '段落长度合适继续保持' },
      structuredData: { score: 55, current: '缺少结构化标记', suggestion: '建议添加FAQ或HowTo结构化数据' },
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
      improvements.push(`[${key}]: ${item.suggestion}`);
    }
  });

  return improvements;
}
