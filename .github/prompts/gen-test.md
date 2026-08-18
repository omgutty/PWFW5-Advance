/gen-test
mode: agent
description: Auto-generate Playwright tests with page objects, modules, and specs for a given feature.

Generate Playwright tests following the 3-layer architecture. Infer as much as possible from existing patterns in the codebase, then ask only what's truly ambiguous.

## Parameters

- **feature** (required): Feature to generate tests for (e.g., "checkout", "search", "registration")
- **description** (optional): Additional context about the feature behavior
- **tags** (optional): Comma-separated test tags. Default: `@P1 @Regression`

## Process

### Step 1 — Understand the Feature
Analyze `src/pages/`, `src/modules/`, and `src/testdata/` to infer existing patterns. If the feature already has partial files, read them and extend. If new, identify which pages/modules need creation.

### Step 2 — Create or Update Page Object
Path: `src/pages/<Feature>Page.ts`
- Locators as arrow functions: `readonly field = () => this.page.locator('[data-test="field"]')`
- Basic actions only: `navigate()`, `fillField(value)`, `clickSubmit()`
- No assertions, no business logic
- Export and add re-export in `src/pages/index.ts`

### Step 3 — Create or Update Module
Path: `src/modules/<Feature>Module.ts`
- Orchestrates page objects for the workflow
- Graceful checks only — no hard assertions
- Export and add re-export in `src/modules/index.ts`

### Step 4 — Generate Test Spec
Path: `src/tests/<feature>.spec.ts`
- Import `{ test, expect }` from `../fixtures`
- Each test uses `test.step()` for logical blocks
- Tag format: `test('should ... @P0 @Smoke', ...)`
- Include at minimum:
  - **Happy path** test (success scenario)
  - **Validation/error** test (bad input, missing fields)
  - **Edge case** test (optional: boundary, empty state)

### Step 5 — Add Test Data (if needed)
Update `src/testdata/<feature>.json` with sample data. Add types in `src/testdata/types.ts` if new shape is introduced.

## Constraints
- Never put `page.locator()` in tests or modules
- Never put assertions in pages or modules
- Use `[data-test="value"]` selectors — not CSS classes or XPath
- Use `test.step()` for console log capture by TTA reporter
- Follow PascalCase for classes/files, camelCase for methods/variables

## Example Output Structure
For feature="search":
- `src/pages/SearchPage.ts` (or extend existing)
- `src/modules/SearchModule.ts` (or extend existing)
- `src/tests/search.spec.ts`
- `src/testdata/search.json` (if new data needed)
