Plan: Nova Poshta Parcel Sending App
A Next.js 14+ application with TypeScript for creating shipping declarations via Nova Poshta API. The app features an intuitive Ukrainian-language UI with autocomplete city search and filtered warehouse selection. Static sender/parcel data minimizes API calls while focusing on dynamic city/warehouse selection. App Router with server-side API routes protects the API key. Each phase delivers shippable, testable functionality incrementally.

Steps
Initialize Next.js project with TypeScript, Tailwind CSS, App Router, and create foundational structure (/app, /components, /lib, /types)
Implement Nova Poshta API service layer in /lib/nova-poshta with type-safe methods for city search and warehouse retrieval, plus Next.js API routes in /app/api/nova-poshta
Build city autocomplete component with debounced search, keyboard navigation, and Ukrainian text predictions displaying city results
Create warehouse selection component that filters warehouses by selected city, displays list with search/filter capabilities
Develop declaration form page integrating city/warehouse selectors with static sender/parcel fields, form validation, and submission to Nova Poshta API
Add confirmation and error handling with success/error states, declaration details display, and user-friendly Ukrainian error messages
Further Considerations
API key storage: Environment variable (.env.local) or server-side config? Recommend .env.local for local dev, with server-side API routes only.
City/warehouse caching: Cache API responses client-side (SWR/React Query) or server-side (Redis/memory)? Recommend SWR for simplicity given warehouse data updates infrequently.
Form persistence: Save draft declarations to localStorage or skip for MVP? Recommend localStorage to improve UX for incomplete forms.
Testing strategy: Unit tests for API service, integration tests for components, or E2E with Playwright? Recommend Jest for utils + React Testing Library for components as minimum viable testing.
Claude Sonnet 4.5 • 1x
