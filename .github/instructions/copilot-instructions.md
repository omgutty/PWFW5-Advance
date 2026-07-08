
# GitHub Copilot Instructions — Playwright Test Automation Framework

This file defines how Copilot should generate code for this Playwright + TypeScript project.

## Architecture — 3-Layer Pattern

All code must follow the **Pages → Modules → Tests** layering:

- **Layer 1 — Pages** (`src/pages/`): Locators (arrow functions) + basic UI actions only. No business logic, no assertions.
- **Layer 2 — Modules** (`src/modules/`): Business logic and multi-step workflows. Orchestrates page objects. No locators defined here.
- **Layer 3 — Tests** (`src/tests/`): Test specs with assertions. Uses modules and fixtures. No direct locator usage.

**Rule**: Never put `page.locator()` in tests or modules. Never put assertions in pages or modules.

## Page Objects

- Locators defined as **arrow function properties** (not fields):

  ```typescript
  readonly submitButton = () => this.page.locator('#submit');
  readonly errorMessage = () => this.page.locator('[data-test="error"]');
  ```

- Methods are async, return `Promise<void>`:

  ```typescript
  async clickSubmit(): Promise<void> {
    await this.submitButton().click();
  }
  ```

- Constructor always takes `private page: Page`.
- Export each page as a named class. Re-export from `src/pages/index.ts`.

## Modules

- Orchestrate multiple page objects in a single workflow.
- Accept `page: Page` in constructor, instantiate page objects internally.
- Graceful assertions only — no hard fails inside module methods (let tests decide pass/fail).

  ```typescript
  export class LoginModule {
    private loginPage: LoginPage;
    private homePage: HomePage;

    constructor(page: Page) {
      this.loginPage = new LoginPage(page);
      this.homePage = new HomePage(page);
    }

    async doLogin(username: string, password: string): Promise<void> {
      await this.loginPage.navigate();
      await this.loginPage.enterUsername(username);
      await this.loginPage.enterPassword(password);
      await this.loginPage.clickLogin();
    }
  }
  ```

## Tests

- Use `test.step()` to wrap logical blocks:

  ```typescript
  await test.step('Login with valid credentials', async () => { ... });
  ```

- Use fixtures from `src/fixtures/index.ts` (`test` and `expect`).
- Tag appropriately: `@P0`, `@P1`, `@P2`, `@Smoke`, `@Regression`.
- Tag placement: in test title as `test('should ... @P0 @Smoke', ...)`.

  ```typescript
  test('should login with valid credentials @P0 @Smoke', async ({ page }) => { ... });
  ```

## Fixtures

The custom fixtures in `src/fixtures/` provide:
- `authenticatedPage` — Pre-logged-in page via `auth.fixture.ts`.
- `loginPage`, `homePage`, `productPage`, `checkoutPage` — Pre-initialized page objects.

Use `authenticatedPage` when the test requires an active session.

## API Layer

- API classes in `src/api/` (e.g., `AuthApi`, `ProductApi`, `OrderApi`).
- Instantiate with `new AuthApi()`, call methods with token from login.
- Methods return typed responses.

## Utilities (`src/utils/`)

- `Logger` — Use `test.step()` with `console.log()` for step-level logging (captured by TTA reporter).
- `WaitHelper` — `waitForCondition()`, `retry()`, `waitForSelectorState()`.
- `DataGenerator` — `randomEmail()`, `randomPhoneNumber()`, `uuid()`, `randomString()`.
- `ApiHelper` — HTTP helper with built-in retry.

## Coding Standards

- **Types**: Always use TypeScript. Define interfaces in `src/testdata/types.ts`.
- **Imports**: Use named imports with relative paths (e.g., `../pages`).
- **Naming**: PascalCase for classes/files. camelCase for methods/variables. kebab-case for spec files.
- **Assertions**: Use Playwright's `expect().toBeVisible()`, `expect().toHaveText()` — avoid manual boolean checks.
- **Selectors**: Prefer `data-testid` attributes (`[data-test="value"]`) over CSS/XPath.
- **Async/await**: Always use async/await over raw promises.
- **Console logs**: `console.log()` inside `test.step()` is captured by the TTA reporter. Use it for test-time debugging.
- **Magic strings**: Extract repeated strings (URLs, credentials, product names) into `src/config/index.ts`.

## Test Data

- Static test data in `src/testdata/users.json`, `src/testdata/products.json`.
- Type definitions in `src/testdata/types.ts`.
- For dynamic data, use `DataGenerator` from utils.

## Reporting

The project uses a custom TTA reporter. `console.log()` inside `test.step()` is captured per-step in the report. No special configuration needed.

## Git Conventions

- Conventional commits: `feat(scope):`, `fix(scope):`, `test(scope):`, `docs:`, `refactor(scope):`.
- Pre-commit hooks run ESLint, TypeScript checks, and the framework rule engine.
