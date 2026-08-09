# Project Overview

`automation-ui` is the Angular frontend in this repository (the npm package and Angular project are currently named `rag-front`). It provides a small retrieval-augmented chat interface backed by `automation-engine`: users can upload documents, choose which known documents participate in a question, send that question, and display the backend answer.

The repository contains only the frontend. The backend implementation and its API contract are not present here; the relationship to `automation-engine` must therefore be checked in the backend repository whenever an API contract changes.

# Tech Stack

- Angular 21.2. The manifest requests Angular `^21.2.0`; the current lock/install resolves Angular framework packages to 21.2.12 and Angular CLI/build to 21.2.10.
- TypeScript `~5.9.2` (currently resolved to 5.9.3), with strict TypeScript and Angular template/compiler checks enabled.
- RxJS `~7.8.0` (currently resolved to 7.8.2). HTTP calls return observables and components subscribe directly.
- npm 11.6.2 is declared in `package.json`; no repository Node version file exists. Angular's installed tooling requires Node `^20.19.0`, `^22.12.0`, or `>=24.0.0`.
- Angular CLI application builder (`@angular/build`) for development and production builds.
- Vitest 4 with jsdom for unit tests, driven by Angular's `@angular/build:unit-test` builder.
- Plain global/component CSS. There is no third-party component library or CSS framework.
- Prettier 3 is installed, but there is no npm formatting script or repository Prettier configuration.

# Project Structure

```text
src/
├── app/
│   ├── app.ts, app.html, app.css       # Root component and router outlet
│   ├── app.config.ts                   # Router, HttpClient, global error listeners
│   ├── app.routes.ts                   # Single route to ChatPage
│   ├── core/
│   │   ├── constants/
│   │   │   └── api-constants.ts        # Hard-coded backend URLs
│   │   ├── model/                      # API/UI TypeScript interfaces
│   │   └── services/                   # Chat and document HTTP services
│   └── features/
│       ├── chat/
│       │   ├── chat-page/              # Implemented chat/document screen
│       │   ├── chat-input/             # Generated placeholder, unused
│       │   ├── message-item/           # Generated placeholder, unused
│       │   └── message-list/           # Generated placeholder, unused
│       └── documents/
│           ├── document-list/          # Generated placeholder, unused
│           └── document-upload/        # Generated placeholder, unused
├── index.html
├── main.ts                             # bootstrapApplication entry point
└── styles.css                          # Global stylesheet (currently only a comment)
```

There is no `src/environments/` directory. Tests are colocated with source files as `*.spec.ts`.

# Architecture

The application uses Angular's standalone bootstrap API rather than an `NgModule`. `main.ts` bootstraps `App` with `appConfig`; the root template contains only a router outlet. The only route is the empty path (`/`), which renders `ChatPage` eagerly.

`ChatPage` currently owns presentation, user interaction, and page state. It injects both singleton HTTP services, keeps messages/documents/status in writable signals, and keeps the input value as a string bound through `ngModel`. There is no global state library, shared store, interceptor, guard, resolver, or persistence layer.

`ChatService` and `DocumentService` isolate the actual `HttpClient` calls. Backend URLs are assembled in `ApiConstants`; they are not environment-dependent. Interfaces under `core/model/` describe responses and the UI's message/document shapes. The outgoing chat request is currently built inline in `ChatPage` and has no declared interface.

Although feature folders contain smaller generated components, `ChatPage` does not import or render them. Its template and CSS implement the whole current screen.

# Main Application Flow

```text
Application start
    -> router renders ChatPage at /
    -> ChatPage loads the document list through DocumentService
    -> returned documents are displayed and selected by default

User uploads a file
    -> ChatPage -> DocumentService -> POST /documents/upload
    -> uploaded document is appended locally and selected

User asks a question
    -> ChatPage adds user and loading messages
    -> ChatService -> POST /chat with message + selected documentIds
    -> response.answer replaces the loading message
```

# Backend Communication

The backend base URL is currently hard-coded as `http://localhost:8080` in `src/app/core/constants/api-constants.ts`. There are no environment files, proxy configuration, authentication headers, or HTTP interceptors.

The currently used endpoints are:

| Method | Endpoint | Caller | Request | Typed response |
| --- | --- | --- | --- | --- |
| `POST` | `/chat` | `ChatService.askQuestion()` | `{ message: string, documentIds: string[] }` built in `ChatPage`; the service parameter is currently `any` | `ChatResponse`: `{ answer: string }` |
| `POST` | `/documents/upload` | `DocumentService.upload()` | `multipart/form-data` with one `file` field | `UploadResponseModel`: `{ id: string, filename: string }` |
| `GET` | `/documents` | `DocumentService.getDocuments()` | none | `DocumentModel[]`: `{ id: string, name: string, selected: boolean }[]` as currently typed |

`ChatPage` handles chat and upload failures in the subscription by displaying `Erreur serveur` or `❌ erreur upload`. Loading the initial document list has no error callback. There is no centralized error handling, retry, cancellation, timeout, or response validation.

# Important Components and Services

## `App`

The root standalone component. It imports `RouterOutlet` and delegates all visible UI to routing. Its `title` signal is not rendered by the current template.

## `ChatPage`

The only implemented feature page and the target of `/`. It:

- loads documents during `ngOnInit`;
- displays document selection checkboxes and toggles local selection state;
- uploads one file at a time and adds a successful upload to the document list;
- builds chat requests from the text input and selected document IDs;
- maintains the conversation as `ChatMessage[]` in a signal;
- shows a temporary typing indicator, then the answer or a fixed error message.

It depends on `FormsModule`, `CommonModule`, `ChatService`, and `DocumentService`. The declared `isLoading` signal is currently unused.

## `ChatService`

A root-provided service wrapping `POST /chat`. It depends on `HttpClient`, accepts an untyped request, and returns the typed HTTP observable `ChatResponse`.

## `DocumentService`

A root-provided service wrapping document upload and listing. It converts a `File` to `FormData` for upload and returns typed HTTP observables for `UploadResponseModel` and `DocumentModel[]`.

## Models

- `ChatMessage`: local display model with `user`/`assistant` role, content, and optional loading flag.
- `ChatResponse`: backend chat response containing `answer`.
- `DocumentModel`: document identifier, display name, and UI selection flag.
- `UploadResponseModel`: uploaded document identifier and backend filename.

## Placeholder components

`ChatInput`, `MessageItem`, `MessageList`, `DocumentList`, and `DocumentUpload` are standalone-by-default generated components with placeholder `works!` templates. They are not imported by `ChatPage`, not routed, and do not implement the corresponding feature yet.

# Angular Conventions

Conventions observed in the current implementation:

- standalone bootstrapping and standalone components; `ChatPage` explicitly declares `standalone: true`, while other components rely on Angular 21's standalone default;
- constructor-based dependency injection for services;
- `providedIn: 'root'` singleton services;
- signals with immutable `set()`/`update()` operations for page state;
- direct RxJS `subscribe({ next, error })` handling for HTTP observables;
- native template control flow with `@if` and `@for`;
- template-driven form binding with `FormsModule` and `[(ngModel)]` rather than reactive forms;
- property/class/event bindings in templates;
- external HTML and CSS files colocated with components;
- strict TypeScript, strict templates, strict injection parameters, and ES2022 target.

Do not assume unused conventions are already established. In particular, the project currently has no lazy-loaded route, reactive form, `OnPush` declaration, `input()`/`output()`, computed signal, NgRx-style state management, or API interceptor.

# Current State

Currently implemented:

- one full-height chat page at `/`;
- initial backend document listing, with all loaded documents selected in the UI;
- local toggling of document selection;
- single-file upload and visible success/failure status;
- question submission with selected document IDs;
- local conversation rendering and a typing indicator;
- display of the backend answer or a fixed chat error message.

Known limits visible in the repository:

- the backend URL is fixed to localhost and has no environment override;
- the conversation and selections are in-memory only;
- the five smaller feature components are placeholders and unused;
- the outgoing chat request is untyped at the service boundary;
- document-list loading has no UI error handling;
- there is no authentication, streaming response, document deletion, or e2e test setup;
- `README.md` is mostly the generated Angular CLI README and mentions `ng e2e`, but no `e2e` npm script or e2e framework is configured.

# Tests

Unit specs are colocated with `App`, both services, and all feature components. They use Angular TestBed and Vitest globals. Most contain only a creation smoke test; `App` also contains a generated title-rendering assertion even though the current root template only renders `router-outlet`. The service tests configure no explicit HTTP testing provider. Treat these as the current test inventory, not as evidence of behavioral coverage.

Run the configured suite with:

```bash
npm test
```

For a non-interactive run when supported by the current Angular test builder:

```bash
npm test -- --watch=false
```

There is no configured end-to-end test target.

# Commands

The actual `package.json` scripts are:

```bash
npm install             # Install dependencies from package metadata
npm start               # ng serve (development server, normally localhost:4200)
npm run build           # ng build; production is the default configuration
npm run watch           # ng build --watch --configuration development
npm test                # ng test (Angular unit-test builder / Vitest)
npm run ng -- <args>    # Invoke Angular CLI through the local dependency
```

Prefer `npm ci` instead of `npm install` in clean automation when the existing `package-lock.json` must be reproduced exactly.

# Development Rules

1. Read `AGENTS.md` before any important modification.
2. Inspect the affected component or service before modifying code.
3. Respect the existing Angular architecture.
4. Prefer small, testable changes.
5. Do not introduce a new library when Angular already provides a suitable solution without justification.
6. Do not change backend contracts without checking the corresponding DTOs and endpoints.
7. Do not unnecessarily mix business logic, HTTP calls, and presentation.
8. Respect existing TypeScript conventions and strict compiler settings.
9. Add or adapt tests when important behavior changes.
10. Run the appropriate tests and build after modifications.
11. Do not invent features or components that do not exist.
12. Report any divergence between this documentation and the actual code.

# Relationship with Backend

`automation-ui` is the frontend; `automation-engine` is the backend. The frontend must respect the API contracts exposed by `automation-engine`. Any frontend change to a DTO, URL, HTTP method, payload, or response handling must be checked against the corresponding backend contract. The backend source is not part of this repository, so do not infer contract details beyond the calls documented above.

# Current Roadmap

No roadmap is present in the repository. The only clearly identifiable unfinished work is represented by the unused placeholder components and the implementation limits listed under **Current State**; these are observations, not committed roadmap items.

# Git Rules

- Do not force-push.
- Do not rewrite Git history without an explicit request.
- Check `git diff` before committing.
- Do not include files unrelated to the requested change.

