# Authentication and Authorization Strategy

## Identity Provider
- **Provider:** Supabase Auth (GoTrue) configured with email/password, OAuth (Google, Microsoft), and magic link flows.
- **Rationale:**
  - Shares Supabase project with the PostgreSQL database, simplifying tenant isolation and billing.
  - Native support for multi-factor authentication (TOTP) and passwordless login options.
  - Emits JWTs compatible with .NET validation middleware via the JWKS endpoint.

## Token Flow
- **Grant Type:** Authorization Code with PKCE for browser and mobile clients; Client Credentials for trusted service-to-service calls.
- **Access Tokens:** Short-lived (15 minutes) JWTs signed by Supabase; include custom claims (`org_id`, `role_keys`).
- **Refresh Strategy:** Rotating refresh tokens managed through Supabase sessions and persisted in the `Session` entity for revocation tracking.
- **Session Security:** Enforce IP/device binding checks during refresh; invalidate sessions upon password reset or MFA enrollment changes.

## Permission Scheme
- **Role-Based Access Control:**
  - Organization-scoped roles assigned via the `Membership` entity.
  - System roles (`owner`, `admin`, `member`, `viewer`) shipped by default; custom roles can be created per organization.
- **Attribute-Based Enhancements:**
  - Supplemental policy checks consider resource ownership, organization status, and feature flags.
  - Row Level Security policies in Supabase ensure users only query rows tied to their organization.
- **Administrative Overrides:**
  - Platform super-admins authenticated through Azure AD can assume organization context via a privileged backend endpoint with audit logging.

## Operational Controls
- JWT validation handled by `Microsoft.AspNetCore.Authentication.JwtBearer` with cached JWKS.
- Permission checks executed via a custom `IAuthorizationHandler` that maps role claims to permission keys.
- Audit logging captures login success/failure, session refresh, and privileged context switching events.
