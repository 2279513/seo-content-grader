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
    good: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', dot: 'bg-emerald-500' },
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', dot: 'bg-amber-500' },
    error: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-600', dot: 'bg-rose-500' },
  };
  const c = colorMap[item.status];

  return (
    <div className={`${c.bg} border ${c.border} rounded-2xl p-6 transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <span className="font-semibold text-gray-800">{title}</span>
        </div>
        <div className={`w-3 h-3 rounded-full ${c.dot}`} />
      </div>
      <div className="flex items-end gap-2 mb-4">
        <span className={`text-5xl font-bold ${c.text}`}>{item.score}</span>
        <span className="text-gray-400 mb-2">/100</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${item.score >= 80 ? 'bg-emerald-500' : item.score >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
          style={{ width: `${item.score}%` }}
        />
      </div>
      <div className="text-sm text-gray-500 mb-2">当前: <span className="text-gray-700">{item.current || '未检测到'}</span></div>
      <div className="text-sm bg-white/60 p-3 rounded-lg">
        <span className="text-gray-600">💡 {item.suggestion}</span>
      </div>
    </div>
  );
}

function CircularScore({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-gray-800">{score}</span>
        <span className="text-xs text-gray-400">综合评分</span>
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
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SE</span>
            </div>
            <span className="font-bold text-lg text-slate-800">SEO Grader</span>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <a href="#features" className="text-slate-600 hover:text-slate-900 transition">功能</a>
            <a href="#pricing" className="text-slate-600 hover:text-slate-900 transition">定价</a>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition text-sm">
              开始使用
            </button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            5秒完成SEO健康度检测
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
            让你的网页 SEO
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              超越竞争对手
            </span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            输入任意网页URL，AI在5秒内分析标题、Meta描述、关键词、可读性等5大维度，
            给出专业改进建议。竞品一半价格，却更快速精准。
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              无需注册即可试用
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              100% 数据隐私保护
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              永久免费额度
            </div>
          </div>
        </div>
      </section>

      {/* Analyze Form */}
      <section id="features" className="py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
              🔍 输入网页地址开始分析
            </h2>
            <form onSubmit={handleAnalyze} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  网页 URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://yoursite.com"
                  required
                  className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  邮箱地址（接收完整报告）
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-lg"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-4 rounded-xl transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-blue-500/25 text-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    AI 分析中，请稍候...
                  </span>
                ) : (
                  '🚀 立即分析 SEO 健康度'
                )}
              </button>
            </form>

            {error && (
              <div className="mt-5 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600">
                ❌ {error}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Results */}
      {result && (
        <section className="py-12 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
              <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">📊 SEO 分析报告</h2>
                  <p className="text-slate-500 text-sm">{url}</p>
                </div>
                <CircularScore score={result.scores.overall} />
              </div>

              <div className="grid md:grid-cols-2 gap-5 mb-8">
                <ScoreCard title="标题 Title" item={result.scores.title} icon="📝" />
                <ScoreCard title="Meta 描述" item={result.scores.metaDescription} icon="📄" />
                <ScoreCard title="关键词布局" item={result.scores.keywords} icon="🔑" />
                <ScoreCard title="内容可读性" item={result.scores.readability} icon="📖" />
              </div>

              <div className="md:col-span-2">
                <ScoreCard title="结构化数据" item={result.scores.structuredData} icon="🏗️" />
              </div>

              {result.improvements.length > 0 && (
                <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
                  <h3 className="font-bold text-amber-800 mb-4 flex items-center gap-2">
                    <span className="text-xl">🎯</span> 优先改进建议
                  </h3>
                  <div className="space-y-3">
                    {result.improvements.map((item, i) => (
                      <div key={i} className="flex gap-3 bg-white/60 p-3 rounded-xl">
                        <span className="flex-shrink-0 w-6 h-6 bg-amber-500 text-white text-sm font-bold rounded-full flex items-center justify-center">{i + 1}</span>
                        <span className="text-amber-900">{item.replace(/^\[\w+\]:\s*/, '')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">简单透明的定价</h2>
            <p className="text-lg text-slate-600">选择适合你的方案，无需隐藏费用</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Free',
                price: '$0',
                desc: '适合尝鲜体验',
                features: ['5次 SEO 分析/月', '基础 5 维度评分', 'Email 报告', '24小时报告保存'],
                highlight: false,
              },
              {
                name: 'Pro',
                price: '$19',
                desc: '适合个人博主',
                features: ['50次 SEO 分析/月', 'PDF 报告导出', '竞品对比分析', '优先 AI 处理队列', '90天报告保存'],
                highlight: true,
              },
              {
                name: 'Business',
                price: '$49',
                desc: '适合团队/代理',
                features: ['无限次 SEO 分析', 'API 接口访问', '团队协作功能', '自定义品牌报告', '专属客户支持'],
                highlight: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-3xl p-8 transition-all hover:-translate-y-1 ${
                  plan.highlight
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-2xl shadow-blue-500/30 scale-105'
                    : 'bg-white border border-slate-200 hover:shadow-xl'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-500 text-white text-sm font-bold rounded-full">
                    ⭐ 最受欢迎
                  </div>
                )}
                <h3 className={`text-xl font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-slate-800'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-4 ${plan.highlight ? 'text-blue-100' : 'text-slate-500'}`}>
                  {plan.desc}
                </p>
                <div className="mb-6">
                  <span className={`text-5xl font-bold ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>
                    {plan.price}
                  </span>
                  <span className={`${plan.highlight ? 'text-blue-200' : 'text-slate-400'}`}>/月</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-center gap-3 text-sm ${plan.highlight ? 'text-blue-100' : 'text-slate-600'}`}>
                      <svg className={`w-5 h-5 flex-shrink-0 ${plan.highlight ? 'text-emerald-400' : 'text-emerald-500'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    plan.highlight
                      ? 'bg-white text-blue-600 hover:bg-blue-50'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  {plan.name === 'Free' ? '免费开始' : '升级到 ' + plan.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SE</span>
            </div>
            <span className="font-bold text-white">SEO Grader</span>
          </div>
          <p className="text-sm">© 2026 AI SEO Content Grader. All rights reserved.</p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white transition">Privacy</a>
            <a href="#" className="hover:text-white transition">Terms</a>
            <a href="#" className="hover:text-white transition">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
