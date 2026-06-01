# NakshatraChat — Frontend

Production-ready Next.js 15 frontend for the NakshatraChat astrology consultation platform.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | Shadcn UI (Radix primitives) |
| Server State | TanStack Query v5 |
| Client State | Zustand |
| Real-time | Socket.IO Client |
| Forms | React Hook Form + Zod |
| HTTP | Axios (with interceptors + auto-refresh) |

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Homepage
│   ├── login/page.tsx            # Login (user / astrologer / admin tabs)
│   ├── register/page.tsx         # User registration
│   ├── register/astrologer/      # 3-step astrologer registration wizard
│   ├── astrologers/page.tsx      # Browse astrologers + chat request flow
│   ├── dashboard/                # User dashboard
│   │   └── chat/[chatId]/        # User chat window
│   ├── astrologer/               # Astrologer dashboard
│   │   ├── application/          # Application status tracker
│   │   ├── profile/              # 7-section profile completion wizard
│   │   └── chats/[chatId]/       # Astrologer chat window
│   └── admin/                    # Admin panel
│       ├── applications/         # Review astrologer applications
│       ├── users/                # User management
│       ├── astrologers/          # Astrologer management
│       └── chats/                # Chat monitoring
├── components/
│   ├── ui/                       # Shadcn UI primitives
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── chat/
│   │   ├── ChatWindow.tsx        # Active chat with session timer + end button
│   │   ├── ChatList.tsx          # Chat list sidebar
│   │   ├── MessageBubble.tsx
│   │   ├── ChatRequestModal.tsx  # 60s countdown waiting modal (user)
│   │   ├── IncomingChatRequest.tsx # Accept/decline popup (astrologer)
│   │   └── SessionTimer.tsx      # Elapsed time display
│   ├── astrologer/
│   │   ├── AstrologerCard.tsx    # Card with busy/online status
│   │   └── AstrologerDetailModal.tsx # Full detail slide-up
│   └── common/
│       ├── ProtectedRoute.tsx    # Auth + role guard
│       └── LoadingSpinner.tsx
├── hooks/
│   ├── useAuth.ts                # Auth mutations + routing
│   ├── useSocket.ts              # Socket.IO — all chat events
│   └── useChat.ts                # Message queries + typing
├── services/
│   ├── auth.service.ts
│   ├── astrologer.service.ts
│   ├── chat.service.ts
│   └── admin.service.ts
├── store/
│   ├── authStore.ts              # Zustand auth state (persisted)
│   └── chatStore.ts              # Chat state: pending, session, incoming requests, busy astrologers
├── types/
│   └── index.ts                  # All TypeScript interfaces
└── lib/
    ├── axios.ts                   # Axios instance + interceptors
    ├── queryClient.ts             # TanStack Query config
    └── utils.ts                   # cn(), formatDate(), timeAgo(), etc.
```

## Prerequisites

- Node.js 20+
- npm
- Backend API running (see [astroapp-backend](https://github.com/rishu-ops/astroapp-backend))

## Setup

### 1. Clone and install

```bash
git clone https://github.com/rishu-ops/astroapp-frontend.git
cd astroapp-frontend
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### 3. Start development server

```bash
npm run dev
```

App runs at **http://localhost:3000**

### 4. Build for production

```bash
npm run build
npm start
```

## Pages

### Public

| Route | Description |
|-------|-------------|
| `/` | Homepage with hero, stats, categories, testimonials |
| `/astrologers` | Browse live astrologers with filters + chat flow |
| `/login` | Login for user / astrologer / admin |
| `/register` | User registration |
| `/register/astrologer` | 3-step astrologer registration wizard |

### User (requires login)

| Route | Description |
|-------|-------------|
| `/dashboard` | Stats + quick actions + recent chats |
| `/dashboard/chat` | All conversations |
| `/dashboard/chat/[chatId]` | Active chat with session timer |

### Astrologer (requires login)

| Route | Description |
|-------|-------------|
| `/astrologer` | Dashboard + online toggle + incoming requests |
| `/astrologer/application` | Application status tracker + timeline |
| `/astrologer/profile` | 7-section profile completion wizard |
| `/astrologer/chats` | All conversations |
| `/astrologer/chats/[chatId]` | Active chat window |

### Admin (requires login)

| Route | Description |
|-------|-------------|
| `/admin` | Analytics dashboard |
| `/admin/applications` | Review + approve/reject astrologer applications |
| `/admin/users` | Block/unblock users |
| `/admin/astrologers` | View all astrologers |
| `/admin/chats` | Monitor conversations |

## Real-time Chat Flow

### User initiates chat

1. Browse `/astrologers` → sees **green (available)** / **amber (in session)** / **grey (offline)** status
2. Click card → **AstrologerDetailModal** (photo, about, expertise, pricing)
3. Click "Chat" → **ChatRequestModal** opens with **60-second SVG countdown**
4. Server notifies astrologer in real-time
5. If accepted → redirect to chat room + session timer starts
6. If declined / timeout → feedback shown in modal

### Active session

- Green **"Session Active"** bar with elapsed MM:SS timer
- **End Chat** button (user only) → inline confirm → session ends
- Either party disconnecting auto-ends the session
- Chat history preserved after session ends

### Astrologer receives request

- Floating **IncomingChatRequest** notification (top-right)
- Shows user name + 60-second countdown ring
- Accept → auto-navigate to chat room
- Decline → notification dismisses, user notified

## Astrologer Onboarding

### Phase 1 — Application (`/register/astrologer`)

3-step wizard:
1. **Personal Info** — name, email, phone, password
2. **Professional** — display name, expertise, experience, languages, bio
3. **Verification** — government ID upload, optional certificates

After submission → tracked at `/astrologer/application`

### Phase 2 — Profile Completion (`/astrologer/profile`)

7-section wizard (sidebar navigation with progress):

| Section | Required to go live |
|---------|-------------------|
| Profile Photo | ✅ |
| About Me | ✅ |
| Pricing | ✅ |
| Professional (expertise, categories, skills) | Optional |
| Availability (weekly schedule) | Optional |
| KYC (PAN, Aadhaar) | Optional |
| Payout (bank details) | Optional |

Once all 3 required sections are done → **Go Live!** button unlocks → profile appears in public listing.

## State Management

### `authStore` (Zustand, persisted)
- `user`, `accessToken`, `isAuthenticated`
- `setAuth()`, `clearAuth()`

### `chatStore` (Zustand)
- `pendingChatId` / `pendingExpiresAt` — active chat request (user)
- `incomingRequest` — incoming request notification (astrologer)
- `sessionChatId` / `sessionStartedAt` — active session timing
- `chatEndedInfo` — reason + duration when session ends
- `busyAstrologerIds` — real-time set of astrologers in sessions
- `messages` — messages per chatId

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.IO server URL |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | TypeScript check (no emit) |
