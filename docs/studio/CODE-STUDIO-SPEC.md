Enterprise UI Studio — Code Studio Specification

Project: ENTERPRISE-UI
Repository: https://github.com/iant89/ENTERPRISE-UI
Application: Enterprise UI Studio
Scope: Code Studio, integrated Component Studio, component documentation, and live preview
Status: Proposed implementation specification

⸻

1. Vision

Evolve Enterprise UI Studio into a browser-based front-end development environment for building complete React and TypeScript applications using @enterprise-ui/react.

Code Studio will become the primary development workspace.

Component creation, component editing, component previews, and component documentation will be integrated capabilities within Code Studio. They will share the same project engine, editor, preview compiler, history, and persistence layer.

The user should be able to build an application without leaving the Studio.

Primary capabilities

1. Create and manage multi-file projects.
2. Edit TypeScript, TSX, CSS, JSON, and Markdown.
3. Use Monaco with TypeScript IntelliSense.
4. Preview application changes live.
5. Create reusable React components.
6. Preview components independently.
7. Inspect and modify component props and states.
8. Read and edit component documentation.
9. Navigate between documentation, component source, and preview.
10. Export complete, runnable Vite applications.

The initial implementation must remain compatible with static GitHub Pages hosting.

⸻

2. Existing implementation and constraints

The current Studio already provides:

* Separate Vite application under studio/.
* Monaco editor with Enterprise UI TypeScript declarations.
* Prettier formatting.
* Seven-theme sandboxed preview.
* Babel-based JSX model and visual editing.
* Component palette generated from API metadata.
* Outline tree and inspector.
* Undo/redo.
* IndexedDB project persistence.
* Existing sandbox runtime shared with the documentation playground.
* Generated API metadata at docs/generated/api.json.

The implementation must extend these systems rather than replace them.

Architectural constraints

* React + TypeScript for Studio development.
* Enterprise UI components for the Studio interface.
* Monaco remains behind the existing editor abstraction.
* Source code is the source of truth.
* Browser-first architecture.
* GitHub Pages compatibility.
* No mandatory backend or Node runtime.
* User-authored code executes only inside the isolated preview.
* Existing saved projects and migration behavior must be preserved.

⸻

3. Workspace architecture

3.1 Workspace navigation

The Studio should have two primary workspaces:

Design Studio

* Existing visual page composition functionality.
* Drag-and-drop page editing.
* Visual properties editing.

Code Studio

* Multi-file project development.
* Monaco editor.
* Live preview.
* Component development.
* Component documentation.
* Project diagnostics and testing.

Component Studio should not become a separate application. It should be a focused mode within Code Studio.

3.2 Code Studio layout

The default desktop layout should resemble a professional IDE.

┌──────────────────────────────────────────────────────────────────────────────┐
│ Project   File   Edit   View   Run   Tools                Theme    Settings │
├──────────────────────────────────────────────────────────────────────────────┤
│ Explorer | Search | Components | Docs       App.tsx  Button.tsx  styles.css │
├──────────────────┬──────────────────────────────────┬──────────────────────┤
│                  │                                  │                      │
│ PROJECT          │          CODE EDITOR             │    LIVE PREVIEW      │
│                  │                                  │                      │
│ ▾ src            │  import { Button } ...           │  ┌────────────────┐  │
│   ▾ components   │                                  │  │                │  │
│     Button.tsx   │  export function App() {         │  │                │  │
│     Button.css   │    return (...)                  │  │  Application   │  │
│   ▾ pages        │  }                               │  │  preview       │  │
│   App.tsx        │                                  │  │                │  │
│   main.tsx       │                                  │  └────────────────┘  │
│ package.json     │                                  │                      │
├──────────────────┴──────────────────────────────────┴──────────────────────┤
│ Problems | Console | Tests | Component Docs | Output | Preview Events       │
└──────────────────────────────────────────────────────────────────────────────┘

Panels must be resizable, collapsible, and restorable.

The initial release does not need fully customizable docking. A predictable layout is more valuable than a complex docking system at this stage.

3.3 Responsive behavior

* Desktop: Explorer, editor, and preview can be visible simultaneously.
* Tablet: Explorer collapses; editor and preview can switch between split and tabbed views.
* Mobile: editor and preview become separate full-screen tabs.

All controls must remain keyboard accessible.

⸻

4. Project engine and virtual file system

A project must be represented as a virtual file system rather than a single source file.

4.1 Example project structure

my-application/
├── package.json
├── index.html
├── vite.config.ts
├── tsconfig.json
├── studio.config.json
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── components/
    │   └── ExampleCard/
    │       ├── ExampleCard.tsx
    │       ├── ExampleCard.css
    │       ├── ExampleCard.test.tsx
    │       ├── ExampleCard.docs.md
    │       └── index.ts
    ├── pages/
    ├── hooks/
    ├── lib/
    └── styles/
        └── global.css

4.2 File management

The Explorer must support:

* Create files and folders.
* Rename files and folders.
* Move files and folders.
* Duplicate files.
* Delete files and folders.
* Context menus.
* Drag-and-drop organization.
* Multiple editor tabs.
* Dirty-state indicators.
* Quick open.
* Project-wide search.
* Recently opened files.

Renaming and moving files should update relative imports when possible.

Deleting a non-empty folder requires confirmation.

4.3 Project model

Every project should contain:

* Project metadata.
* Virtual file system.
* Entry point.
* Dependency metadata.
* Open editor tabs.
* Selected file.
* Panel layout.
* Project settings.
* Component catalog cache.
* Documentation index cache.

Derived caches must always be reproducible from the actual project files.

⸻

5. Code editor

Monaco remains the primary editor.

Required capabilities

* TypeScript and TSX language support.
* Enterprise UI IntelliSense.
* Type information and diagnostics.
* Multiple editor tabs.
* Split editing.
* Find and replace.
* Project-wide search.
* Go to definition.
* Find references.
* Rename symbols.
* Code folding.
* Formatting through Prettier.
* Automatic import suggestions.
* Editor themes synchronized with the Studio theme.
* Unsaved-change indicators.

Keep Monaco behind EditorAdapter so other editor implementations can be introduced later.

Problems integration

Normalize diagnostics from the parser, TypeScript service, preview compiler, tests, and accessibility checks.

Each diagnostic should include:

* Severity.
* Message.
* File path.
* Source range.
* Diagnostic origin.
* Optional quick fix.

Selecting a diagnostic should navigate to the relevant source location.

⸻

6. Component Studio integration

Component Studio is a component-development mode within Code Studio.

6.1 Create Component action

Expose Create Component in:

* Project Explorer context menu.
* Editor toolbar.
* Components panel.
* Command palette.

The component creation dialog should support:

Setting	Default
Component name	Required
Destination folder	src/components/
Language	TypeScript
Export style	Named export
Styling	CSS file
Generate tests	Enabled
Generate documentation	Enabled
Generate index file	Enabled
Generate example	Optional

Advanced options should be collapsible.

6.2 Generated component files

For example, creating ExampleCard should generate:

ExampleCard/
├── ExampleCard.tsx
├── ExampleCard.css
├── ExampleCard.test.tsx
├── ExampleCard.docs.md
└── index.ts

Example component:

import type { ReactNode } from 'react';
import './ExampleCard.css';
export interface ExampleCardProps {
  /** Main heading displayed by the card. */
  title: string;
  /** Optional supporting content. */
  children?: ReactNode;
  /** Applies the emphasized visual treatment. */
  emphasized?: boolean;
}
export function ExampleCard({
  title,
  children,
  emphasized = false,
}: ExampleCardProps) {
  return (
    <article
      className={
        emphasized
          ? 'example-card example-card--emphasized'
          : 'example-card'
      }
    >
      <h2 className="example-card__title">{title}</h2>
      <div className="example-card__content">
        {children}
      </div>
    </article>
  );
}

Generation must be one atomic project operation. If generation fails, no partially created component should remain.

6.3 Component catalog

The Studio must automatically discover React components in the project.

Each catalog entry should contain:

* Component name.
* Export name.
* Source file.
* Source location.
* Props interface.
* Prop descriptions.
* Default values.
* Associated stylesheet.
* Associated tests.
* Associated documentation.
* Available examples.
* Whether it is a project component or library component.

The catalog must update when relevant source files change.

It must support named exports and props interfaces declared in separate files where the TypeScript service can resolve them.

6.4 Component detail view

Selecting a component should provide a focused component view.

Tabs:

* Preview
* Code
* Props
* Documentation
* Tests

These tabs must operate on the same project files and editor state.

⸻

7. Integrated component documentation

This is a core Code Studio capability.

Documentation must be accessible without leaving the IDE, and it must connect directly to component source, properties, examples, and preview.

7.1 Documentation interface

Provide:

* A persistent Docs panel.
* A Component Docs bottom panel.
* Documentation search.
* Component documentation pages.
* Prop-specific documentation.
* Interactive examples.
* Source navigation.
* Copy import statement.
* Copy example code.
* Link to full documentation.

Documentation should be pinnable beside the editor.

Opening documentation must not unexpectedly steal editor focus.

7.2 Enterprise UI library documentation

Use the existing generated API metadata in:

docs/generated/api.json

Do not manually duplicate component API definitions.

The documentation panel should display the following information where available:

1. Component name.
2. Description.
3. Import statement.
4. Interactive example.
5. Props table.
6. Events and callback signatures.
7. State-related properties.
8. CSS variables.
9. Accessibility guidance.
10. Related components.
11. Link to the canonical documentation page.

The Props table should include:

Field	Description
Name	Property name
Type	TypeScript type
Required	Whether required
Default	Default value
Description	JSDoc description

If metadata is missing, show Not documented yet. Never invent API descriptions.

Display the metadata version or build identifier so stale documentation can be diagnosed.

7.3 Project component documentation

Project components should support colocated Markdown documentation:

ComponentName.docs.md

Recommended structure:

# ExampleCard
## Overview
A reusable card component for displaying grouped content.
## When to use
Describe appropriate use cases.
## Usage
\`\`\`tsx
<ExampleCard title="Example">
  Card content
</ExampleCard>
\`\`\`
## Props
Document the component properties.
## Variants and states
Document available visual states.
## Accessibility
Describe keyboard and screen-reader considerations.
## Related components
List related components.

Supported Markdown:

* Headings.
* Paragraphs.
* Lists.
* Tables.
* Links.
* Inline code.
* Fenced code blocks.

Raw HTML and executable scripts must not be rendered.

7.4 Documentation generation

When a component has no documentation file, provide an Add documentation action.

The generator should:

1. Read the component name.
2. Inspect its props interface.
3. Extract JSDoc descriptions.
4. Identify default values.
5. Identify available examples.
6. Generate a documentation template.
7. Open the new Markdown file in the editor.

Generated documentation is a draft. The user must be able to edit it.

Regeneration must never overwrite manually authored prose.

7.5 Documentation precedence

Use this order for project components:

1. Explicit component documentation file.
2. JSDoc descriptions.
3. TypeScript type information.
4. Generated fallback labels.

The documentation system must distinguish generated metadata from manually authored content.

7.6 Interactive documentation examples

Documentation examples should render using the same preview runtime as Code Studio.

Support:

* Inline TSX examples.
* Dedicated example files.
* Interactive component examples.
* Editable example props where appropriate.

Examples must use the exact project or library version loaded by the preview.

7.7 Documentation navigation

The Docs panel should support:

* Search.
* Back and forward navigation.
* Breadcrumbs.
* Copy import statement.
* Copy example code.
* Open full docs page.
* Pin/unpin panel.
* Show source.
* Open component detail view.

Selecting a component in the palette, preview, or inspector should make its documentation readily available.

7.8 Unified documentation search

Index:

* docs/generated/api.json.
* Existing library documentation pages.
* Existing examples.
* Project *.docs.md files.
* Component JSDoc.
* Props and event declarations.

Search by:

* Component name.
* Property name.
* Description.
* Event name.
* Category.
* Keyword.

Search must be local and deterministic. No external search service is required.

⸻

8. Component props playground

The Props panel should allow users to preview components with different property values.

Infer suitable controls from TypeScript types.

Type	Control
Boolean	Switch
String union	Select
Number	Number input
String	Text input
Optional string	Text input with reset
Array/object	Structured editor or JSON mode
ReactNode/function	Code editor

The interface must clearly distinguish:

1. Changing preview-only sample props.
2. Editing a component instance in the application.
3. Editing the component’s TypeScript interface.

Changing preview-only values must never silently modify application source code.

⸻

9. Live preview

9.1 Preview capabilities

* Automatic preview updates.
* Desktop, tablet, and mobile presets.
* Custom viewport dimensions.
* Zoom.
* Fit to window.
* Fullscreen.
* Theme selection.
* Density selection.
* Refresh.
* Pause/resume.
* Console output.
* Runtime error overlay.
* Source navigation from errors.

Use a configurable debounce to avoid unnecessary compilation on every keystroke.

9.2 Preview architecture

Monaco / File Operations
          |
          v
      Project Store
       (VFS)
          |
          v
      Module Graph
          |
          v
    Preview Compiler
          |
          v
    Preview Message Bridge
          |
          v
    Sandboxed iframe
       |     |     |
       v     v     v
     React Console Errors
     App   Events

9.3 Compiler adapter

The preview compiler should expose a stable interface:

* Resolve entry point.
* Build module graph.
* Resolve relative imports.
* Transform TypeScript and JSX.
* Resolve CSS imports.
* Resolve approved package imports.
* Produce diagnostics.
* Produce an immutable preview artifact.

The existing Sucrase implementation is a foundation, not a complete package bundler.

The browser runtime must clearly document supported dependencies. It must not claim arbitrary npm compatibility.

9.4 Browser and local runtime

Browser runtime — initial implementation

* Works on GitHub Pages.
* Resolves project-relative imports.
* Uses an explicit package allowlist.
* Does not support arbitrary network imports.
* Does not expose Node built-ins or filesystem access.

Local runtime — future implementation

An optional local Vite runtime can provide:

* Normal npm dependency resolution.
* Terminal.
* Full build tooling.
* Full TypeScript build.
* More advanced debugging.

Both runtimes must use the same project model and compiler adapter contract.

9.5 Preview isolation

All user-authored code must run in a sandboxed iframe.

The message protocol must:

* Be versioned.
* Validate message types and payloads.
* Validate the expected iframe window.
* Restrict messages to documented operations.
* Enforce payload size limits.
* Avoid exposing parent DOM, credentials, or privileged APIs.

Do not grant allow-same-origin by default.

9.6 Last-known-good preview

A failed compile must never destroy the last successful preview.

When compilation fails:

* Keep the previous preview running.
* Show the new diagnostics.
* Mark the preview as stale.
* Allow retry.
* Provide navigation to the error location.

⸻

10. Preview component selection

Development preview builds should support selecting components and navigating back to source.

Workflow:

1. User selects an element in the preview.
2. Studio identifies its component or JSX source when possible.
3. Preview highlights the selected region.
4. Studio opens the corresponding source file.
5. Component properties and documentation become available.

Use development-only source instrumentation.

Instrumentation must not affect production builds.

It must gracefully handle third-party components, fragments, portals, and dynamic rendering that cannot be mapped reliably.

⸻

11. Bottom panels

Initial bottom panel tabs:

* Problems
* Console
* Tests
* Component Docs
* Output
* Preview Events

Panels should be collapsible and their state should persist per project.

⸻

12. Persistence and export

Persistence

Use IndexedDB to store:

* Project files.
* Project metadata.
* Open tabs.
* Selected file.
* Panel layout.
* Project settings.

Use explicit schema versions and tested migrations.

If storage fails, stop overwriting persisted data and provide a project download.

Export

Support:

* Complete ZIP export.
* .studio.json fallback export.
* ZIP import.
* .studio.json import.
* Runnable Vite + React + TypeScript projects.

Exports must include source files, styles, tests, documentation, and required configuration.

The exported application must build outside Studio with standard Vite tooling.

⸻

13. Testing and quality

Unit tests

Cover:

* VFS path normalization.
* File operations.
* Relative import updates.
* Module graph.
* Compiler resolution.
* Documentation parsing.
* Documentation search indexing.
* Component discovery.
* Props inference.
* Documentation generation.
* Preview message validation.
* Storage migrations.
* Undo/redo.

End-to-end tests

1. Create a project.
2. Create folders and multiple TSX files.
3. Generate a component.
4. Generate its documentation.
5. Edit component source.
6. Observe live preview updates.
7. Open component docs from the Explorer.
8. Open prop documentation from the inspector.
9. Change preview-only props.
10. Select a component in the preview and navigate to source.
11. Introduce a compilation error.
12. Confirm the last good preview remains.
13. Export the project.
14. Verify the exported project builds.

Security tests

* Reject malformed iframe messages.
* Reject unknown message types.
* Reject unsafe import specifiers.
* Reject path traversal.
* Prevent Markdown scripts and raw HTML execution.
* Reject archive entries outside the project root.
* Confirm preview code cannot access parent DOM or privileged storage.

Accessibility

Target WCAG 2.2 AA.

Ensure keyboard access, visible focus, accessible diagnostics, focus management, screen-reader announcements, and reduced-motion support.

⸻

14. Suggested project organization

Adapt this structure to the existing code rather than moving files without a reason.

studio/src/
├── app/
│   ├── StudioApp.tsx
│   └── workspace/
├── core/
│   ├── project/
│   ├── vfs/
│   ├── history/
│   ├── module-graph/
│   └── diagnostics/
├── editor/
│   ├── EditorAdapter.ts
│   └── monaco/
├── preview/
│   ├── compiler/
│   ├── bridge/
│   └── iframe/
├── components/
│   ├── generator/
│   ├── catalog/
│   ├── inspector/
│   └── playground/
├── docs/
│   ├── api-metadata/
│   ├── project-markdown/
│   ├── search/
│   └── DocsPanel.tsx
├── panels/
│   ├── explorer/
│   ├── problems/
│   ├── console/
│   └── bottom/
└── storage/

⸻

15. Implementation roadmap

Phase	Scope	Result
C1	IDE shell and panel layout	Explorer, editor, preview, bottom panels
C2	Multi-file VFS	Complete file and folder management
C3	Monaco multi-tab	Multi-file editing and navigation
C4	Multi-file preview	Imports, CSS, compiler diagnostics, last-good preview
C5	Component generator	Generate source, styles, tests, docs
C6	Component catalog	Discover project components
C7	Integrated documentation	Library and project docs inside Studio
C8	Props playground	Preview-only prop editing
C9	Preview source inspection	Select component and navigate to source
C10	ZIP import/export	Runnable Vite projects
C11	Test workflow	In-browser tests
C12	Local runtime	Optional Vite/npm runtime
C13	Git integration	Status, diff, commits
C14	Debugging and polish	Advanced debugging and cross-browser QA

Recommended first release

Complete C1–C7 as the first coherent Code Studio release.

Do not delay integrated component documentation indefinitely. A component generator that creates undocumented components would leave the workflow incomplete.

⸻

16. First release acceptance criteria

The first release is complete when:

* Users can create and open multi-file projects.
* Explorer supports file and folder operations.
* Monaco edits multiple TSX files.
* Local component imports work.
* Live preview updates automatically.
* Failed builds preserve the last working preview.
* User code runs in an isolated iframe.
* Users can generate reusable components.
* Generated files are atomic and undoable.
* Project components appear in the catalog.
* Enterprise UI documentation opens from the palette and inspector.
* Project components can have editable Markdown documentation.
* Documentation can be searched.
* Documentation examples run in the preview.
* Props can be changed without modifying source.
* Existing projects migrate safely.
* Complete projects can be exported and built outside Studio.

⸻

17. Explicitly out of scope for the first release

* Backend/API generation.
* Database integration.
* Authentication scaffolding.
* Server-side rendering.
* Production hosting.
* Arbitrary npm installation in browser mode.
* Multi-user collaboration.
* Cloud project storage.
* Full Git client.
* Full terminal.
* Replacing Design Studio.

These capabilities can be introduced through later adapters without compromising the initial architecture.

⸻

18. Architectural decisions

1. One project engine: Design Studio, Code Studio, component tools, and documentation share the same project model.
2. Code is authoritative: visual views and metadata are derived from source.
3. Documentation is contextual: docs connect components, props, examples, and source locations.
4. Reuse existing metadata: Enterprise UI documentation uses the existing API metadata and canonical docs.
5. Preview is isolated: all user code runs in a sandboxed iframe.
6. Last good build wins: failed compilation never destroys the last working preview.
7. Browser-first: GitHub Pages remains a supported deployment target.
8. Incremental delivery: editor and preview reliability come before advanced tooling.

Implementation status: This document defines the target behavior and acceptance criteria. It does not claim that C1–C14 have been implemented. Existing M0–M2 functionality remains the baseline. Each new phase must include tests and an updated Studio README.