# AI SEO Content Grader - 开发指南

## 产品概述
- 用户输入URL或上传截图，AI自动分析页面SEO健康度
- 输出5项评分：标题、Meta描述、关键词、内容可读性、结构化数据
- 附带改进建议，支持邮箱发送报告

## 技术栈
- Next.js 14 + TypeScript + Tailwind CSS
- AI: MiniMax M2.7 API
- 数据库: Neon PostgreSQL
- 支付: Stripe
- 邮件: Resend

## 项目结构
```
src/
├── app/
│   ├── page.tsx           # 首页 - URL输入/截图上传
│   ├── api/
│   │   ├── analyze/
│   │   │   └── route.ts   # SEO分析API
│   │   └── credit/
│   │       └── route.ts   # 次数限制API
│   └── result/
│       └── [id]/
│           └── page.tsx   # 分析结果页
├── components/
│   ├── Hero.tsx           # 主Hero区
│   ├── AnalyzeForm.tsx    # URL/截图输入表单
│   ├── SEOScoreCard.tsx   # 评分卡片
│   └── Pricing.tsx        # 定价区
├── lib/
│   ├── minimax.ts         # MiniMax API调用
│   ├── seo-analyzer.ts    # SEO分析逻辑
│   └── stripe.ts          # Stripe配置
└── types/
    └── index.ts           # 类型定义
```

## 开发优先级
1. 首页 + URL输入表单
2. SEO分析API (MiniMax)
3. 结果展示页面
4. 邮箱报告发送
5. Stripe支付集成

## 环境变量
```
MINIMAX_API_KEY=xxx
RESEND_API_KEY=xxx
DATABASE_URL=xxx
STRIPE_SECRET_KEY=xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=xxx
```

## 参考竞品
- Ahrefs Webmaster Tools (免费)
- SEMrush (付费)
- SEOptimer (中等价位)
