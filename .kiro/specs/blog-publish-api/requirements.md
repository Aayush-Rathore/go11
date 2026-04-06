# Requirements Document

## Introduction

This feature adds a protected REST API endpoint to the Next.js application that allows an external website (on a different domain) to publish blog posts remotely. The endpoint is secured with a shared secret key passed via a request header, and CORS is restricted to a single allowed origin stored in an environment variable. Published posts are persisted to a PostgreSQL database hosted on NeonDB, replacing or augmenting the current in-memory `BLOG_POSTS` array in `lib/blog.ts`.

## Glossary

- **API**: The Next.js Route Handler at `POST /api/blog/publish`
- **Publisher**: The external website that calls the API to create blog posts
- **Secret_Key**: A shared secret string stored in the `BLOG_PUBLISH_SECRET` environment variable, used to authenticate requests
- **Allowed_Origin**: The single domain permitted to make cross-origin requests, stored in the `BLOG_PUBLISH_ALLOWED_ORIGIN` environment variable
- **BlogPost**: A record containing `slug`, `title`, `description`, `excerpt`, `publishedAt`, `updatedAt`, `keywords`, `sections`, and optionally `faq`
- **Database**: The PostgreSQL instance hosted on NeonDB, accessed via the `DATABASE_URL` environment variable
- **CORS_Preflight**: An HTTP `OPTIONS` request sent by the browser before a cross-origin POST request

---

## Requirements

### Requirement 1: Publish Blog Post Endpoint

**User Story:** As a Publisher, I want to POST a blog post payload to a protected endpoint, so that I can create new blog posts on the site from an external system.

#### Acceptance Criteria

1. THE API SHALL expose a `POST /api/blog/publish` route handler.
2. WHEN a valid request is received, THE API SHALL insert the blog post into the Database and return HTTP 201 with the created post's `slug`.
3. WHEN the request body is missing required fields (`slug`, `title`, `description`, `excerpt`, `publishedAt`, `updatedAt`, `keywords`, `sections`), THE API SHALL return HTTP 400 with a descriptive error message identifying the missing fields.
4. WHEN a blog post with the same `slug` already exists in the Database, THE API SHALL return HTTP 409 with an error message indicating the conflict.
5. IF the Database is unreachable or returns an error, THEN THE API SHALL return HTTP 500 with a generic error message and SHALL NOT expose internal connection details.

---

### Requirement 2: Secret Key Authentication

**User Story:** As a site owner, I want the endpoint protected by a secret key, so that only authorised systems can publish blog posts.

#### Acceptance Criteria

1. THE API SHALL read the expected secret from the `BLOG_PUBLISH_SECRET` environment variable on every request.
2. WHEN a request is received without an `x-publish-secret` header, THE API SHALL return HTTP 401.
3. WHEN a request is received with an `x-publish-secret` header value that does not match `BLOG_PUBLISH_SECRET`, THE API SHALL return HTTP 403.
4. WHEN a request is received with an `x-publish-secret` header value that matches `BLOG_PUBLISH_SECRET`, THE API SHALL proceed to process the request.
5. IF the `BLOG_PUBLISH_SECRET` environment variable is not set at runtime, THEN THE API SHALL return HTTP 500 and SHALL log a configuration error.

---

### Requirement 3: CORS Restriction

**User Story:** As a site owner, I want CORS restricted to a single allowed origin, so that browsers block cross-origin requests from unauthorised domains.

#### Acceptance Criteria

1. THE API SHALL read the allowed origin from the `BLOG_PUBLISH_ALLOWED_ORIGIN` environment variable.
2. WHEN a CORS_Preflight (`OPTIONS`) request is received from the Allowed_Origin, THE API SHALL respond with HTTP 204 and include `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, and `Access-Control-Allow-Headers` headers set to permit the publish request.
3. WHEN a CORS_Preflight request is received from an origin that is not the Allowed_Origin, THE API SHALL respond with HTTP 403 and SHALL NOT include permissive CORS headers.
4. WHEN a `POST` request is received, THE API SHALL include the `Access-Control-Allow-Origin` response header set to the Allowed_Origin value.
5. IF the `BLOG_PUBLISH_ALLOWED_ORIGIN` environment variable is not set at runtime, THEN THE API SHALL return HTTP 500 and SHALL log a configuration error.

---

### Requirement 4: Database Schema and Persistence

**User Story:** As a developer, I want blog posts stored in PostgreSQL via NeonDB, so that published posts are durable and queryable.

#### Acceptance Criteria

1. THE Database SHALL contain a `blog_posts` table with columns: `slug` (primary key, text), `title` (text, not null), `description` (text, not null), `excerpt` (text, not null), `published_at` (date, not null), `updated_at` (date, not null), `keywords` (text array, not null), `sections` (jsonb, not null), `faq` (jsonb, nullable).
2. WHEN the application starts, THE API SHALL be able to connect to the Database using the `DATABASE_URL` environment variable.
3. THE Database SHALL enforce uniqueness on the `slug` column.

---

### Requirement 5: Input Validation

**User Story:** As a developer, I want the API to validate all incoming fields, so that malformed data is never written to the Database.

#### Acceptance Criteria

1. WHEN the `slug` field contains characters other than lowercase letters, digits, and hyphens, THE API SHALL return HTTP 400 with a descriptive validation error.
2. WHEN the `publishedAt` or `updatedAt` fields are not valid ISO 8601 date strings, THE API SHALL return HTTP 400 with a descriptive validation error.
3. WHEN the `keywords` field is not a non-empty array of strings, THE API SHALL return HTTP 400 with a descriptive validation error.
4. WHEN the `sections` field is not a non-empty array of objects each containing a `heading` string and a `paragraphs` non-empty string array, THE API SHALL return HTTP 400 with a descriptive validation error.
5. WHEN the `faq` field is present and is not an array of objects each containing a `question` string and an `answer` string, THE API SHALL return HTTP 400 with a descriptive validation error.
