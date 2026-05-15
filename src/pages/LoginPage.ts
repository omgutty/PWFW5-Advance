import { Page,expect } from "@playwright/test";

export class LoginPage{
     // private enforces encapsulation.
    // Code outside this class cannot do: loginPage.page.goto('/something')
    // All interactions must go through this class's methods.
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // ─── LOCATORS ────────────────────────────────────────────────────────────
    // Arrow functions = lazy evaluation.
    // this.page.locator() is called only when the method is invoked,
    // not when the LoginPage instance is constructed.
    //
    // Why this matters:
    // new LoginPage(page) → runs constructor → does NOT call page.locator()
    // loginPage.enterUsername('user') → NOW calls page.locator('#user-name')
    // The DOM is definitely rendered at action time. Not at construction time.

    username=()=>this.page.locator('[data-test="username"]');
    passwordInput = () => this.page.locator('[data-test="password"]');
    loginButton = () => this.page.locator('[data-test="login-button"]');
    errorMessage = () => this.page.locator('[data-test="error"]');
    errorCloseButton = () => this.page.locator('[data-test="error-button"]');


}