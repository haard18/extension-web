# Replier Web Frontend

A production-ready Next.js 14+ frontend with Clerk authentication, Supabase integration, and Chrome extension token sharing.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Clerk account (https://clerk.com)
- A Supabase account (https://supabase.com)
- The Replier Chrome extension installed

### Installation

1. **Install dependencies:**

```bash
npm install
```

2. **Configure environment variables** (`.env.local`):

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Backend API
NEXT_PUBLIC_API_ENDPOINT=http://localhost:3000
```

3. **Run the development server:**

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

## 📁 Project Structure

```
web/
├── app/
│   ├── (auth)/                 # Authentication routes (protected layout)
│   │   ├── sign-in/[[...index]]/page.tsx
│   │   └── sign-up/[[...index]]/page.tsx
│   ├── api/
│   │   └── token/route.ts      # API route for fetching Clerk token
│   ├── dashboard/
│   │   └── page.tsx            # Main dashboard (protected)
│   ├── globals.css             # Global Tailwind styles
│   ├── layout.tsx              # Root layout with Clerk provider
│   └── page.tsx                # Home page
├── lib/
│   └── supabase.ts             # Supabase client and helpers
├── middleware.ts               # Clerk middleware for auth
├── .env.local                  # Environment variables
├── .env.example                # Environment template
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── postcss.config.js
```

## 🔑 Key Features

### 1. Clerk Authentication

The app uses Clerk (`@clerk/nextjs`) for authentication:

- **Sign-in page**: `/sign-in` - User login
- **Sign-up page**: `/sign-up` - New user registration
- **Session management**: Automatic token refresh and session validation
- **Protected routes**: Dashboard requires authentication via middleware

**Example - Accessing user info:**

```tsx
import { useAuth, useUser } from '@clerk/nextjs'

export function MyComponent() {
  const { userId } = useAuth()
  const { user } = useUser()

  return <div>Hello {user?.firstName}!</div>
}
```

### 2. Supabase Integration

The `lib/supabase.ts` module provides:

- **Client-side operations**: Anonymous or authenticated requests
- **Server-side operations**: Privileged admin operations
- **User profile management**: Create, update, and fetch user data
- **Usage tracking**: Increment usage counters

**Example - Fetching user profile:**

```ts
import { getUserProfile } from '@/lib/supabase'

const profile = await getUserProfile(clerkUserId)
console.log(profile.plan, profile.usage_count)
```

**Database schema (create in Supabase):**

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free',
  usage_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own profile
CREATE POLICY "Users can read their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid()::TEXT = clerk_user_id);
```

### 3. Token API Endpoint (`/api/token`)

This endpoint returns the user's Clerk session token for use in the Chrome extension:

**Request:**
```bash
GET /api/token
Authorization: Bearer <clerk_token>
```

**Response:**
```json
{
  "token": "eyJhbGciOiJSUzI1NiIsImlzcyI6Imh0dHBzOi8v...",
  "userId": "user_123",
  "expiresAt": "2024-11-04T22:48:00Z"
}
```

### 4. Chrome Extension Token Sharing

The dashboard includes a button to send the Clerk token to the Chrome extension:

1. User clicks "Send Token to Extension"
2. Frontend fetches token from `/api/token`
3. Token is stored in `chrome.storage.local` with key `clerkToken`
4. Extension can access token and use it for backend requests

**In the extension, access the token:**

```js
// content.js or background.js
chrome.storage.local.get('clerkToken', (result) => {
  const token = result.clerkToken
  
  // Use token in backend requests
  fetch('http://localhost:3000/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: 'your post text' })
  })
})
```

### 5. Dashboard Features

The dashboard (`/dashboard`) displays:

- **Current plan info**: Plan name, price, features
- **Usage statistics**: Replies used vs limit with progress bar
- **Upgrade button**: Placeholder for Stripe checkout integration
- **Extension connection**: Button to send token to extension
- **Account information**: Name, email, plan, total usage

## 🔧 Setup Guide

### 1. Set Up Clerk

1. Go to https://dashboard.clerk.com
2. Create a new application
3. Copy `Publishable Key` and `Secret Key`
4. Add to `.env.local`:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```
5. Configure redirect URLs in Clerk dashboard:
   - Sign-in: `http://localhost:3000/sign-in`
   - Sign-up: `http://localhost:3000/sign-up`
   - After sign-in: `http://localhost:3000/dashboard`

### 2. Set Up Supabase

1. Go to https://supabase.com and create a new project
2. Go to "Settings" → "API Keys"
3. Copy `Project URL` and `Anon Key`
4. Create the user profile table (see schema above)
5. Add to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
   SUPABASE_SERVICE_ROLE_KEY=eyJhb...
   ```

### 3. Deploy to Vercel

1. Push code to GitHub
2. Go to https://vercel.com
3. Import your repository
4. Add environment variables (same as `.env.local`)
5. Click "Deploy"

**Environment variables needed on Vercel:**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 📝 API Reference

### GET /api/token

Returns the Clerk session token for the authenticated user.

**Response:**
```json
{
  "token": "eyJhbGciOiJSUzI1NiI...",
  "userId": "user_123",
  "expiresAt": "2024-11-04T22:48:00Z"
}
```

**Error (401 Unauthorized):**
```json
{
  "error": "Unauthorized"
}
```

## 🎨 Styling

The app uses Tailwind CSS with a modern, minimal design:

- **Color scheme**: Blue and purple gradients
- **Components**: Cards, buttons, progress bars
- **Responsive**: Mobile-first design with breakpoints

### Customizing Colors

Edit `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      primary: '#667eea',      // Change primary color
      'primary-dark': '#764ba2', // Change dark variant
    },
  },
}
```

## 🧪 Development

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Run Linter

```bash
npm run lint
```

## 🔐 Security Notes

1. **Never expose `SUPABASE_SERVICE_ROLE_KEY`** in client-side code - it's only for server operations
2. **Token expiration**: Tokens are valid for 24 hours; extension should refresh periodically
3. **CORS**: Backend should only accept requests from your domain
4. **Rate limiting**: Implement rate limiting on the backend for API routes

## 🚀 Production Checklist

- [ ] Set production Clerk and Supabase keys
- [ ] Enable HTTPS
- [ ] Configure Clerk webhook for user creation
- [ ] Set up Supabase RLS policies
- [ ] Add error logging (Sentry, LogRocket, etc.)
- [ ] Test token flow with extension
- [ ] Set up CI/CD pipeline
- [ ] Configure domain in Clerk
- [ ] Enable email verification in Clerk
- [ ] Set up analytics

## 📚 Resources

- **Clerk Docs**: https://clerk.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

## 🐛 Troubleshooting

### "Unauthorized" Error

- Check Clerk keys in `.env.local`
- Ensure you're signed in (visit `/sign-in`)
- Check browser console for error messages

### Token Not Sent to Extension

- Make sure `chrome.storage` API is available
- Check browser console for errors
- Ensure extension is properly installed and running

### Supabase Connection Issues

- Verify `NEXT_PUBLIC_SUPABASE_URL` and keys
- Check network tab for failed requests
- Ensure RLS policies allow access

## 📄 License

MIT License - Feel free to use and modify!

---

Built with ❤️ using Next.js 14, Clerk, and Supabase
