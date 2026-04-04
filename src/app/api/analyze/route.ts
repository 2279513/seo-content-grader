import { analyzeSEOContent, getImprovements } from '@/lib/seo-analyzer';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// 简单的内存存储（生产环境用数据库）
const results = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const { url, email } = await request.json();

    if (!url || !email) {
      return NextResponse.json(
        { error: 'URL and email are required' },
        { status: 400 }
      );
    }

    // 抓取页面内容
    const pageResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEO-Grader-Bot/1.0)',
      },
    });

    if (!pageResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch the URL' },
        { status: 400 }
      );
    }

    const html = await pageResponse.text();

    // 提取页面内容（简化版）
    const content = extractTextFromHTML(html);

    // 调用AI分析
    const scores = await analyzeSEOContent(url, content);
    const improvements = getImprovements(scores);

    // 保存结果
    const id = uuidv4();
    const result = {
      id,
      url,
      email,
      scores,
      improvements,
      createdAt: new Date(),
    };
    results.set(id, result);

    // TODO: 发送邮件报告

    return NextResponse.json({ id, scores, improvements });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed' },
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
