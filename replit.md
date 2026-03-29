# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Task Manager & Notes app (TaskFlow) with Kanban board, rich text editor, tags, and deadline reminders.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS
- **Drag & Drop**: @dnd-kit/core, @dnd-kit/sortable
- **Rich Text Editor**: TipTap (with Table, Underline extensions)
- **Date utilities**: date-fns

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   └── task-manager/       # React + Vite frontend (TaskFlow)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
```

## Features

1. **Kanban Board** - 3 columns (To Do / In Progress / Done) with drag & drop
2. **Rich Text Notes** - TipTap editor with Bold, Italic, Underline, Lists, Tables
3. **Tags/Categories** - Colored tags with filter on Kanban board
4. **Deadlines** - Yellow border (<24h), red border (overdue), Web Push Notifications

## Database Schema

- `tags` - id, name, color, created_at
- `tasks` - id, title, description, content, status (enum), deadline, order, created_at, updated_at
- `task_tags` - task_id, tag_id (junction table)

## API Endpoints

- `GET /api/tasks?tagIds=1,2` - List tasks (filtered by tags)
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id` - Update task (status, content, tags, deadline, order)
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tags` - List tags
- `POST /api/tags` - Create tag
- `DELETE /api/tags/:id` - Delete tag
