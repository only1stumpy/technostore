# TechnoStore Project Instructions

## Project Overview
This is a Next.js 15 e-commerce application for electronics (TechnoStore) built with:
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Zustand
- **Backend**: Next.js API Routes / Server Actions
- **Database**: Vercel Postgres + Prisma ORM
- **Cache**: Upstash Redis
- **Runtime**: Bun
- **Deploy**: Vercel

## Autonomous Tool Usage

You MUST use the following skills and agents **proactively** without waiting for explicit user requests:

### Design & UI (Lazyweb)

**ALWAYS use Lazyweb when:**
- Building any new UI component or page
- User mentions "design", "UI", "layout", "how should this look"
- Starting work on frontend features (catalog, product detail, cart, checkout, etc.)
- User asks "what's the best way to show X"

**Which skill to use:**
- `/lazyweb-design-research` — For new features (e.g., "building product catalog page")
- `/lazyweb-quick-references` — For quick inspiration on specific components (e.g., "need a filter sidebar")
- `/lazyweb-design-improve` — When reviewing existing UI code or screenshots

**Example triggers:**
- "Create the product catalog page" → Run `/lazyweb-design-research` for catalog patterns
- "Add a filter sidebar" → Run `/lazyweb-quick-references` for filter UI examples
- "Is this checkout flow good?" → Run `/lazyweb-design-improve` with screenshot

### Code Quality

**ALWAYS use after completing implementation:**
- `/simplify` — After writing any non-trivial code (>50 lines, multiple functions, complex logic)
- `/review` — Before creating a PR or when user says "ready to commit"
- `/security-review` — When touching auth, payments, user data, or API routes

**Auto-trigger conditions:**
- Just finished implementing a feature → Run `/simplify`
- User says "commit this" or "create PR" → Run `/review` first
- Working with sensitive data (auth, payments) → Run `/security-review`

### Configuration & Setup

**Use proactively when:**
- User mentions permission prompts are annoying → Run `/fewer-permission-prompts`
- User asks to change settings, add permissions, configure hooks → Run `/update-config`
- User wants to customize keybindings → Run `/keybindings-help`

### Development Workflow

**Use `/loop` when:**
- User asks to "watch", "monitor", "keep checking", "run every X minutes"
- Examples: "watch the build", "check tests every 5 minutes", "monitor the dev server"

## Project-Specific Patterns

### Authentication
- Phone number + SMS code (no email, no password recovery)
- Mock SMS in development (log to console)
- JWT stored in HTTP-only cookies

### Cart & Checkout
- Cart only for authenticated users (no guest cart)
- Single-page checkout with order summary sidebar
- Payment: "Cash on delivery" only (no online payment integration)

### Product Catalog
- 4-column grid on desktop, 2-3 on tablet, 1-2 on mobile
- Left sidebar filters: category, brand, price range, specs, stock
- Product cards: image, brand, price, rating, stock status, "Add to Cart" button

### Admin Panel
- Simplified: no statistics/graphs, no user blocking
- CRUD for products, categories, brands
- Order management (view, change status)
- User list (view only)

## Code Style

- **No comments by default** — Only add when WHY is non-obvious
- **No premature abstractions** — Three similar lines > one abstraction
- **No defensive code** — Trust internal code, validate only at boundaries
- **Prefer editing existing files** over creating new ones
- **Match existing patterns** in the codebase

## File Structure

```
/app
  /(auth)          # Login, register
  /(shop)          # Public pages: home, catalog, product detail
  /admin           # Admin panel
  /api             # API routes
/components        # Reusable UI components
/lib               # Utilities, Prisma client, helpers
/services          # Business logic (SmsService, etc.)
/types             # TypeScript types
/prisma            # Database schema
```

## When to Use Agents

**backend-architect** — Use for:
- Designing new API endpoints or services
- Planning database schema changes
- Deciding on architecture patterns (e.g., "how should we structure the cart service?")

**frontend-developer** — Use for:
- Building complete pages or complex components
- Multi-file frontend work
- State management decisions

**debugger** — Use for:
- Production errors with stack traces
- Memory leaks or performance issues
- Race conditions or intermittent bugs

**code-reviewer** — Use for:
- Pre-deployment reviews
- Security-sensitive code changes
- Quality gates before merging

## Remember

1. **Always check Lazyweb** before building UI — don't guess patterns
2. **Run `/simplify`** after implementing features — catch issues early
3. **Use `/review`** before commits — ensure quality
4. **Proactive, not reactive** — use tools without being asked
5. **Design research is mandatory** for all UI work

@AGENTS.md
