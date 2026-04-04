'use client';

import { useState } from 'react';
import { SEOScore, ScoreItem } from '@/types';

function ScoreCard({
  title,
  item,
  icon,
}: {
  title: string;
  item: ScoreItem;
  icon: string;
}) {
  const colorMap = {
    good: 'text-green-500 bg-green-50 border-green-200',
    warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    error: 'text-red-500 bg-red-50 border-red-200',
  };

  const statusIcon = {
    good: '✓',
    warning: '⚠',
    error: '✗',
  };

  return (
    <div
      className={`p-6 rounded-xl border-2 transition-all ${colorMap[item.status]}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{icon}</span>
        <span className="font-semibold">{title}</span>
      </div>
      <div className="text-4xl font-bold mb-2">{item.score}/100</div>
      <div className="text-sm opacity-80 mb-3">
        当前: {item.current || '未检测到'}
      </div>
      <div className="text-sm bg-white/50 p-2 rounded">
        💡 {item.suggestion}
      </div>
    </div>
  );
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ scores: SEOScore; improvements: string[] } | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '分析失败');
      }

      setResult({ scores: data.scores, improvements: data.improvements });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
          🚀 5秒知道页面SEO健康度
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          AI SEO Content Grader
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          输入URL，AI自动分析页面SEO评分。标题、Meta、关键词、可读性、结构化数据
          — 竞品一半价格，5秒出结果。
        </p>
        <div className="flex gap-4 justify-center text-sm text-gray-500">
          <span>✓ 免费分析5次/月</span>
          <span>✓ 详细改进建议</span>
          <span>✓ 邮箱接收报告</span>
        </div>
      </div>

      {/* Analyze Form */}
      <div className="max-w-2xl mx-auto px-4 mb-16">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                网页 URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                邮箱地址（接收报告）
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  AI 分析中...
                </span>
              ) : (
                '🔍 开始分析'
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="max-w-5xl mx-auto px-4 pb-16">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">📊 SEO 分析报告</h2>
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-600">
                  {result.scores.overall}
                </div>
                <div className="text-sm text-gray-500">综合评分</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <ScoreCard title="标题 Title" item={result.scores.title} icon="📝" />
              <ScoreCard title="Meta描述" item={result.scores.metaDescription} icon="📄" />
              <ScoreCard title="关键词" item={result.scores.keywords} icon="🔑" />
              <ScoreCard title="可读性" item={result.scores.readability} icon="📖" />
              <ScoreCard title="结构化数据" item={result.scores.structuredData} icon="🏗️" />
            </div>

            {result.improvements.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <h3 className="font-semibold text-amber-800 mb-3">
                  📋 优先改进项
                </h3>
                <ul className="space-y-2">
                  {result.improvements.map((item, i) => (
                    <li key={i} className="text-amber-700 flex gap-2">
                      <span className="font-semibold">#{i + 1}</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pricing */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <h2 className="text-3xl font-bold text-center mb-8">💰 定价方案</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              name: 'Free',
              price: '$0',
              features: ['5次分析/月', '基础SEO评分', '邮箱报告'],
              highlight: false,
            },
            {
              name: 'Pro',
              price: '$19',
              features: ['50次分析/月', 'PDF报告导出', '竞品对比', '优先队列'],
              highlight: true,
            },
            {
              name: 'Business',
              price: '$49',
              features: ['无限次分析', 'API访问', '团队协作', '专属支持'],
              highlight: false,
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`p-6 rounded-2xl border-2 ${
                plan.highlight
                  ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {plan.highlight && (
                <div className="text-blue-600 text-sm font-semibold mb-2">
                  最受欢迎
                </div>
              )}
              <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
              <div className="text-4xl font-bold mb-4">
                {plan.price}
                <span className="text-sm font-normal text-gray-500">/月</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="text-sm flex gap-2">
                    <span className="text-green-500">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-xl font-semibold transition ${
                  plan.highlight
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
              >
                {plan.name === 'Free' ? '免费开始' : '升级'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-500 text-sm">
        © 2026 AI SEO Content Grader. All rights reserved.
      </footer>
    </main>
  );
}
