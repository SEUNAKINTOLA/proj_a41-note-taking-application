# Note Taking Application

A user-friendly web application for capturing, organizing, and managing notes
("vlogs") efficiently. It provides a clean interface for recording thoughts,
ideas, and information with rich-text formatting, organizes entries into folders,
and offers fast full-text search so users can find content quickly. Deleted
entries move to a trash area and can be restored before being permanently removed
by a scheduled cleanup job.

## Features

- Create, edit, and organize notes with a rich-text editor and formatting toolbar
- Group notes into folders (create, rename, delete)
- Full-text search across note content and titles
- Soft-delete with a trash view and restore support
- Scheduled background cleanup of trashed items
- Token-based authentication

## Tech Stack

- **Frontend:** React, TypeScript
- **Backend:** Express.js, TypeScript
- **Database:** PostgreSQL (full-text search)
- **ORM / Migrations:** Prisma
- **Containerization & Orchestration:** Docker, Kubernetes

## Architecture

The project follows a modular, monolithic architecture served through a web
client:

- A **React + TypeScript** single-page client provides the user interface
  (dashboard, folder sidebar, note list, and rich-text editor).
- An **Express.js + TypeScript** API exposes authentication, folder, note, and
  health endpoints.
- **PostgreSQL** stores users, folders, and notes, with full-text search enabled
  via Prisma migrations.
- **Prisma** manages the schema, migrations, and seed data.
- A background **trash-cleanup job** permanently removes soft-deleted notes after
  a retention window.

```
Client (React) ──▶ API (Express) ──▶ Prisma ──▶ PostgreSQL
                         │
                         └──▶ Scheduled jobs (trash cleanup)
```

## Prerequisites

- [Node.js](https://nodejs.org/) 20 or later
- [PostgreSQL](https://www.postgresql.org/) 15 or later
- [Docker](https://www.docker.com/) (optional, for containerized development and
  deployment)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd proj_a41-note-taking-application
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file and update the values for your setup
(database connection string, authentication secrets, etc.):

```bash
cp .env.example .env
```

### 4. Set up the database

Run the Prisma migrations and seed the database:

```bash
npx prisma migrate deploy
npx prisma db seed
```

> Prefer a containerized database? Start the bundled services with
> `docker compose up -d` before running the migrations.

## Development

Common scripts:

```bash
npm run dev      # Start the application in development mode
npm test         # Run the test suite
npm run build    # Create a production build
```

## Project Structure

```
.
├── prisma/            # Prisma schema, migrations, and seed data
├── src/
│   ├── components/    # React UI components (editor, folders, search, lists)
│   ├── pages/         # Page-level React views (e.g. Dashboard)
│   ├── routes/        # Express API route handlers (auth, folders, notes, health)
│   ├── middleware/    # Express middleware (e.g. authentication)
│   ├── jobs/          # Scheduled background jobs (trash cleanup)
│   ├── utils/         # Shared utilities (e.g. sanitization)
│   └── index.ts       # Application entry point
├── tests/             # Integration and end-to-end tests
├── k8s/               # Kubernetes manifests and monitoring config
├── Dockerfile
└── docker-compose.yml
```

## Deployment

The application ships with Docker and Kubernetes support:

```bash
# Build and run with Docker Compose
docker compose up --build

# Or deploy the Kubernetes manifests
kubectl apply -f k8s/
```

Continuous integration and deployment pipelines are defined under
`.github/workflows/`.

## Contributing

Contributions are welcome:

1. Fork the repository and create a feature branch.
2. Make your changes, adding tests where appropriate.
3. Ensure `npm test` and `npm run build` pass.
4. Open a pull request describing your changes.

Please follow the existing code style enforced by the project's linter and
formatter configuration.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE)
file for details.
