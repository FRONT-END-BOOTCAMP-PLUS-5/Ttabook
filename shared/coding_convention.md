# Ttabook AI Coding Rules

## Core Config
- Prettier: `semi:true, singleQuote:true, tabWidth:2, trailingComma:'es5'`
- ESLint: `next/core-web-vitals`, `next/typescript`, `eslint-config-prettier`
- TypeScript: `strict:true, moduleResolution:'bundler', paths:'@/*'->'./*'`
- Commands: `yarn format`, `yarn lint`, `yarn test`

## Naming Rules
**React Hooks**: `use` prefix + verb+noun (useUserData ✓, useData ✗)
**Components**: PascalCase files/functions, Props suffix for types
**Files**: 
- Components: PascalCase (UserProfile.tsx)
- Stores: role.store.ts (user.store.ts)
- API clients: resource.ts (user.ts)

## File Structure
**Components**:
- Shared: `app/components/ComponentName/index.tsx`
- Page-specific: `app/page/components/Component.tsx`

**API Architecture (Clean)**:
```
app/api/user/reservations/(adaptor)/route.ts  // Next.js routes
backend/user/reservations/dtos/              // Business logic
backend/user/reservations/usecases/
backend/common/domains/entities/             // Shared domain
backend/common/infrastructures/repositories/ // Shared infra
```

**Frontend API**:
- Clients: `app/services/api/user.ts` (getUsers, createUser)
- Hooks: `app/hooks/queries/useUsersQuery.ts`

## Code Rules
**API Routes**: HTTP method exports (GET, POST) in route.ts
**State Management**: Zustand in `app/stores/`, separate State/Actions types
**Architecture**: ALL folders plural (dtos/, usecases/, repositories/)
**Language**: Korean comments/docs, English identifiers

## Key Constraints
- Next.js API routes: MUST be route.ts in (adaptor) folders
- Clean architecture: Separate API routes from business logic
- Plural naming: ALL folders use plural forms consistently
- TDD: Required for all features/fixes
- Yarn only: NO npm/pnpm mixing