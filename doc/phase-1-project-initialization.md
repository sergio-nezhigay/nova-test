# Phase 1: Project Initialization

**PR Title:** Initialize Next.js 14+ project with TypeScript, Tailwind CSS, and foundational structure

**Description:** Set up a new Next.js 14+ application using App Router with TypeScript and Tailwind CSS. Create the foundational directory structure for components, API routes, library functions, and type definitions.

---

## Steps to Execute

### 1. Initialize Next.js Project

```bash
npx create-next-app@latest nova-poshta-app --typescript --tailwind --app --no-src-dir --import-alias "@/*"
cd nova-poshta-app
```

When prompted, select:

- TypeScript: **Yes**
- ESLint: **Yes**
- Tailwind CSS: **Yes**
- App Router: **Yes**
- Customize default import alias: **No** (use @/\*)

### 2. Create Directory Structure

```bash
mkdir -p app/api/nova-poshta
mkdir -p components/ui
mkdir -p lib/nova-poshta
mkdir -p types
```

### 3. Install Additional Dependencies

```bash
npm install clsx tailwind-merge
npm install -D @types/node
```

### 4. Create Files

#### `types/nova-poshta.ts`

```typescript
/**
 * Nova Poshta API Types
 * Base types for API requests and responses
 */

export interface NovaPoshtaApiRequest {
  apiKey: string;
  modelName: string;
  calledMethod: string;
  methodProperties: Record<string, any>;
}

export interface NovaPoshtaApiResponse<T> {
  success: boolean;
  data: T[];
  errors: string[];
  warnings: string[];
  info: string[];
  messageCodes: string[];
  errorCodes: string[];
  warningCodes: string[];
  infoCodes: string[];
}

export interface City {
  Ref: string;
  Description: string;
  DescriptionRu: string;
  Area: string;
  AreaDescription: string;
  Region: string;
  RegionDescription: string;
}

export interface Settlement {
  Ref: string;
  MainDescription: string;
  Area: string;
  AreaDescription: string;
  Region: string;
  RegionDescription: string;
  ParentRegionTypes: string;
  ParentRegionCode: string;
}

export interface Warehouse {
  Ref: string;
  Description: string;
  DescriptionRu: string;
  ShortAddress: string;
  ShortAddressRu: string;
  Phone: string;
  TypeOfWarehouse: string;
  Number: string;
  CityRef: string;
  CityDescription: string;
  SettlementRef: string;
  SettlementDescription: string;
}
```

#### `lib/utils.ts`

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

#### `.env.local`

```env
# Nova Poshta API Key
# Get your API key from https://new.novaposhta.ua/
NOVA_POSHTA_API_KEY=your_api_key_here
```

#### `.env.example`

```env
# Nova Poshta API Key
# Get your API key from https://new.novaposhta.ua/
NOVA_POSHTA_API_KEY=
```

#### `.gitignore` (append if not present)

Ensure `.env.local` is in `.gitignore`:

```
# local env files
.env*.local
```

#### `app/layout.tsx` (update)

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'Nova Poshta - Створення Декларації',
  description: 'Додаток для створення декларацій відправлення Nova Poshta',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='uk'>
      <body className={inter.className}>
        <main className='min-h-screen bg-gray-50'>{children}</main>
      </body>
    </html>
  );
}
```

#### `app/page.tsx` (update)

```typescript
export default function Home() {
  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-2xl mx-auto'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>Nova Poshta</h1>
        <p className='text-gray-600 mb-8'>Створення декларації відправлення</p>
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <p className='text-gray-700'>
            Додаток готовий до розробки. Наступні фази додадуть функціонал для
            пошуку міст, вибору відділень та створення декларацій.
          </p>
        </div>
      </div>
    </div>
  );
}
```

#### `tailwind.config.ts` (verify/update)

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
    },
  },
  plugins: [],
};
export default config;
```

#### `README.md`

````markdown
# Nova Poshta Parcel Sending App

A Next.js 14+ application with TypeScript for creating shipping declarations via Nova Poshta API.

## Features

- 🇺🇦 Ukrainian language interface
- 🔍 City autocomplete search
- 📦 Warehouse selection by city
- 📝 Declaration form with validation
- 🔐 Secure API key handling via server-side routes

## Getting Started

### Prerequisites

- Node.js 18+
- Nova Poshta API key (get from https://new.novaposhta.ua/)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```
````

3. Create `.env.local` file and add your Nova Poshta API key:

```env
NOVA_POSHTA_API_KEY=your_api_key_here
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
nova-poshta-app/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── nova-poshta/   # Nova Poshta API endpoints
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   └── ui/               # Reusable UI components
├── lib/                  # Utility functions
│   └── nova-poshta/      # Nova Poshta API client
├── types/                # TypeScript type definitions
│   └── nova-poshta.ts    # Nova Poshta API types
└── public/               # Static assets
```

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **API:** Nova Poshta JSON API v2.0

## Development Phases

- [x] Phase 1: Project initialization
- [ ] Phase 2: Nova Poshta API service layer
- [ ] Phase 3: City autocomplete component
- [ ] Phase 4: Warehouse selection component
- [ ] Phase 5: Declaration form
- [ ] Phase 6: Confirmation and error handling

## License

MIT

````

---

## Verification Steps

After completing the above steps:

1. **Run development server:**
   ```bash
   npm run dev
````

2. **Check the application loads at** `http://localhost:3000`

3. **Verify structure exists:**

   ```bash
   ls -R app components lib types
   ```

4. **Verify TypeScript compilation:**

   ```bash
   npm run build
   ```

5. **Check that `.env.local` is gitignored:**
   ```bash
   git status
   ```
   (`.env.local` should not appear in untracked files)

---

## Success Criteria

- ✅ Next.js 14+ app runs without errors
- ✅ TypeScript compiles successfully
- ✅ Tailwind CSS is configured and working
- ✅ Directory structure matches specification (`/app`, `/components`, `/lib`, `/types`)
- ✅ Environment variable setup is complete with `.env.local` and `.env.example`
- ✅ Basic types for Nova Poshta API are defined
- ✅ Home page displays in Ukrainian with proper layout
- ✅ Project is ready for Phase 2 (API integration)

---

## Files Changed/Created

**Created:**

- `types/nova-poshta.ts` - Nova Poshta API type definitions
- `lib/utils.ts` - Tailwind class merge utility
- `.env.local` - Environment variables (not committed)
- `.env.example` - Environment variables template
- `README.md` - Project documentation

**Modified:**

- `app/layout.tsx` - Added Ukrainian language support, updated metadata
- `app/page.tsx` - Created placeholder home page in Ukrainian
- `tailwind.config.ts` - Verified configuration
- `.gitignore` - Ensured `.env.local` is ignored

**Directory structure created:**

- `app/api/nova-poshta/`
- `components/ui/`
- `lib/nova-poshta/`
- `types/`

---

## Next Phase

**Phase 2:** Implement Nova Poshta API service layer with type-safe methods for city search and warehouse retrieval, plus Next.js API routes.
