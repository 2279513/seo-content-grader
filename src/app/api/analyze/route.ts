import { analyzeSEOContent, getImprovements } from '@/lib/seo-analyzer';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// 简单的内存存储（生产环境用数据库）
const results = new Map<string, any>();

// 演示模式的模拟SEO数据
const MOCK_SEO_RESULT = {
  title: { score: 72, current: 'Example Domain', suggestion: '标题长度适中，建议添加核心关键词' },
  metaDescription: { score: 58, current: '', suggestion: '添加Meta描述，建议120-160字符' },
  keywords: { score: 65, current: '首页关键词未设置', suggestion: '建议在内容中融入目标关键词3-5次' },
  readability: { score: 88, current: '内容简洁易读', suggestion: '继续保持当前的段落长度' },
  structuredData: { score: 45, current: '缺少结构化数据', suggestion: '建议添加Organization或WebSite的JSON-LD结构化数据' },
  overall: 65,
};

export async function POST(request: NextRequest) {
  try {
    const { url, email } = await request.json();

    if (!url || !email) {
      return NextResponse.json(
        { error: 'URL and email are required' },
        { status: 400 }
      );
    }

    let html = '';
    let useMock = false;

    // 尝试抓取页面内容
    try {
      const pageResponse = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SEO-Grader-Bot/1.0)',
        },
        signal: AbortSignal.timeout(5000),
      });

      if (pageResponse.ok) {
        html = await pageResponse.text();
      } else {
        useMock = true;
      }
    } catch {
      // 抓取失败，使用演示模式
      useMock = true;
    }

    let scores, improvements;

    if (useMock || !html) {
      // 演示模式
      scores = { ...MOCK_SEO_RESULT };
      improvements = getImprovements(scores);
    } else {
      // 提取页面内容
      const content = extractTextFromHTML(html);

      // 调用AI分析
      scores = await analyzeSEOContent(url, content);
      improvements = getImprovements(scores);
    }

    // 保存结果
    const id = uuidv4();
    const result = {
      id,
      url,
      email,
      scores,
      improvements,
      createdAt: new Date(),
      demo: useMock,
    };
    results.set(id, result);

    // TODO: 发送邮件报告

    return NextResponse.json({ id, scores, improvements, demo: useMock });
  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const result = results.get(id);

  if (!result) {
    return NextResponse.json({ error: 'Result not found' }, { status: 404 });
  }

  return NextResponse.json(result);
}

function extractTextFromHTML(html: string): string {
  // 移除script和style标签
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // 提取title
  const titleMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1] : '';

  // 提取meta描述
  const descMatch = text.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  const description = descMatch ? descMatch[1] : '';

  // 提取meta关键词
  const keywordsMatch = text.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i);
  const keywords = keywordsMatch ? keywordsMatch[1] : '';

  // 提取H1
  const h1Match = text.match(/<h1[^>]*>([^<]+)<\/h1>/gi);
  const h1s = h1Match ? h1Match.map(h => h.replace(/<[^>]+>/g, '')).join(', ') : '';

  // 移除所有HTML标签
  text = text.replace(/<[^>]+>/g, ' ');

  // 清理多余空白
  text = text.replace(/\s+/g, ' ').trim();

  return `${title}\n\n${description}\n\n关键词: ${keywords}\n\nH1: ${h1s}\n\n正文: ${text.slice(0, 3000)}`;
}
