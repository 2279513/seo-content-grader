import { SEOScore, ScoreItem } from '@/types';

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;
const MINIMAX_URL = 'https://api.minimax.chat/v1/text/chatcompletion_pro';

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
    },
    body: JSON.stringify({
      model: 'MiniMax-Text-01',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`MiniMax API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('No response from MiniMax');
  }

  // 解析JSON响应
  const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const scores = JSON.parse(cleanContent);

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
