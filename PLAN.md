# MaDe Market — Implementation Plan

## Tech Stack
- **Framework:** Next.js 15 (App Router, TypeScript)
- **Database:** Neon PostgreSQL + Drizzle ORM
- **Auth:** Auth.js (NextAuth v5) — Google + Credentials
- **UI:** shadcn/ui + Tailwind CSS
- **Real-time:** Convex (dashboard only)
- **Storage:** Cloudflare R2 (images/files)
- **Deploy:** Vercel (free tier)

## Project Structure
```
made-market/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (main)/
│   │   │   ├── page.tsx                    # Home / Browse
│   │   │   ├── products/page.tsx           # Product listing
│   │   │   ├── compare/page.tsx            # Comparison engine
│   │   │   ├── cart/page.tsx               # Smart cart
│   │   │   └── store/[id]/page.tsx         # Store profile
│   │   ├── dashboard/
│   │   │   ├── layout.tsx                  # Dashboard layout
│   │   │   ├── page.tsx                    # Dashboard home
│   │   │   ├── products/page.tsx           # Manage products
│   │   │   ├── upload/page.tsx             # Excel bulk upload
│   │   │   ├── analytics/page.tsx          # Store analytics
│   │   │   └── sponsored/page.tsx          # Sponsored listings
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                    # Admin overview
│   │   │   ├── stores/page.tsx             # Approve stores
│   │   │   ├── categories/page.tsx         # Manage categories
│   │   │   ├── sponsored/page.tsx          # Manage sponsored
│   │   │   └── analytics/page.tsx          # Platform analytics
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── products/route.ts
│   │   │   ├── stores/route.ts
│   │   │   ├── cart/calculate/route.ts     # Smart cart engine
│   │   │   ├── compare/route.ts            # Comparison engine
│   │   │   ├── upload/route.ts             # Excel upload
│   │   │   ├── upload/image/route.ts       # R2 image upload
│   │   │   └── price-history/route.ts
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                             # shadcn components
│   │   ├── layout/
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── mobile-nav.tsx
│   │   ├── products/
│   │   │   ├── product-card.tsx
│   │   │   ├── product-grid.tsx
│   │   │   └── product-filters.tsx
│   │   ├── cart/
│   │   │   ├── cart-summary.tsx
│   │   │   ├── cart-store-breakdown.tsx
│   │   │   └── savings-highlight.tsx
│   │   ├── compare/
│   │   │   ├── compare-table.tsx
│   │   │   └── store-selector.tsx
│   │   └── dashboard/
│   │       ├── stats-cards.tsx
│   │       ├── price-chart.tsx
│   │       └── upload-form.tsx
│   ├── db/
│   │   ├── index.ts                        # Drizzle client
│   │   ├── schema.ts                       # All table schemas
│   │   └── migrations/                     # Generated migrations
│   ├── lib/
│   │   ├── auth.ts                         # Auth.js config
│   │   ├── utils.ts                        # Utility functions
│   │   ├── r2.ts                           # Cloudflare R2 client
│   │   └── whatsapp.ts                     # WhatsApp link gen
│   ├── hooks/
│   │   ├── use-cart.ts
│   │   └── use-compare.ts
│   └── types/
│       └── index.ts
├── convex/
│   ├── schema.ts                           # Convex schema
│   ├── dashboard.ts                        # Live stats
│   └── notifications.ts
├── drizzle.config.ts
├── next.config.ts
├── tailwind.config.ts
├── package.json
├── .env.local.example
└── tsconfig.json
```

## Build Phases

### Phase 1: Foundation (Auth, Stores, Products, Filtering)
1. Initialize Next.js 15 + TypeScript
2. Setup Drizzle + Neon connection + schema + migrations
3. Setup Auth.js with roles
4. shadcn/ui components setup
5. Store registration + approval
6. Product CRUD + categories
7. Basic product listing with filters
8. Image upload to R2

### Phase 2: Core Engines (Cart, Compare, Checkout)
9. Smart cart engine (optimized SQL)
10. Comparison engine
11. WhatsApp integration
12. Redirect checkout flow

### Phase 3: Analytics & Monetization
13. Price history tracking
14. Analytics dashboard
15. Sponsored listings
16. Excel bulk upload

### Phase 4: Real-Time & Polish
17. Convex real-time integration
18. Performance optimization
19. Final UI polish + mobile
