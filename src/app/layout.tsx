import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI SEO Content Grader - 5秒分析页面SEO',
  description: '输入URL，AI自动分析页面SEO评分。标题、Meta、关键词、可读性、结构化数据 — 竞品一半价格，5秒出结果。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}
