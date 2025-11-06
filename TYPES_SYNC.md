# Types Synchronization

This project maintains types in three locations for standalone operation:

- **Root** `/types/` - Source of truth
- **Client** `/client/types/` - Used by Next.js
- **Server** `/server/types/` - Used by Deno

## Why Three Copies?

Each directory (root, client, server) can operate standalone:

- **Client** can be deployed to Vercel independently
- **Server** can be deployed to Deno Deploy independently
- **Root** maintains the source of truth for development

This avoids cross-directory imports that don't work with Turbopack builds or deployment platforms.

## Automatic Synchronization

Types are automatically synced using a **pre-commit hook** powered by Husky:

1. Edit files in `/types/` (source of truth)
2. Commit your changes
3. The pre-commit hook automatically:
   - Copies `/types/` to `/client/types/`
   - Copies `/types/` to `/server/types/`
   - Stages the copied files for commit

**All three directories are committed to git.**

## Manual Sync

If you need to sync types manually (without committing):

```bash
pnpm sync-types
```

## Building

```bash
# From root - syncs types and builds client
pnpm build

# Client only
cd client && pnpm build

# Server
cd server && deno task dev
```

## Important Notes

- **Always edit `/types/` only** - this is the source of truth
- The pre-commit hook ensures copies stay in sync automatically
- All three directories are tracked in git for deployment compatibility
- Each directory (client/server) can be deployed independently
