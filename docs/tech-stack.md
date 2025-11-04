# Technology Stack Decisions

## Backend Platform

- **Primary Framework:** .NET 8 Web API with Minimal APIs and MediatR for request handling.
- **Language:** C# 12.
- **Runtime Environment:** Linux containers orchestrated via Azure Container Apps (development via Docker).
- **Supporting Libraries:**
  - Entity Framework Core for relational data access.
  - Dapper for optimized read models and reporting queries.
  - FluentValidation for input validation pipelines.
  - Serilog for structured logging.

### Justification
- .NET was explicitly preferred and offers a mature ecosystem for modular domain-driven services.
- Minimal APIs keep the HTTP surface small while MediatR and FluentValidation enforce clean separation of concerns.
- First-class async/await and native background worker support ease integration with Supabase triggers and MongoDB change streams.

## Data Layer

### Supabase (PostgreSQL)
- **Purpose:** Authoritative transactional store for core domain entities (Users, Organizations, Memberships, Roles, Invitations).
- **Access:** Via EF Core using Npgsql provider and Supabase REST endpoints for administrative tasks.
- **Reasons for Selection:**
  - Existing Supabase/PostgreSQL dataset can be reused without migration.
  - Strong relational integrity and advanced SQL features support complex joins for reporting.
  - Built-in Row Level Security policies align with tenant isolation requirements.

### MongoDB Atlas
- **Purpose:** Event and analytics store for AuditLogs, session telemetry, and denormalized activity feeds.
- **Access:** Using the official MongoDB .NET driver with change stream support for near-real-time projections.
- **Reasons for Selection:**
  - Existing MongoDB cluster is leveraged for schemaless, append-only workloads.
  - Flexible document structure suits verbose audit payloads without overloading Postgres storage.
  - Change streams enable downstream services (notifications, analytics) without impacting the transactional database.

## Integration Considerations

- Cross-database consistency handled via outbox pattern persisted in PostgreSQL and replayed into MongoDB.
- Azure Key Vault manages connection secrets for Supabase and MongoDB.
- CI/CD pipeline uses GitHub Actions to build, test, and deploy container images; database migrations executed via `dotnet ef database update` against Supabase.
