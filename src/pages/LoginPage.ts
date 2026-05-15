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

    // ─── ACTIONS ─────────────────────────────────────────────────────────────
    // Each method does ONE thing.
    // No method in a Page Object should contain if/else business logic.
    // Business logic belongs in Modules.

    async navigation():Promise<void>{
        await this.page.goto('/')
    }

    async enterusername(username:string):Promise<void>{
        await this.username().fill(username);
    }

    async enterpassword(password:string):Promise<void>{
        await this.passwordInput().fill(password);
    }

    async clickonlogin():Promise<void>{
        await this.loginButton().click();
    }

    async geterrrormessage():Promise<string>{
        return (await this.errorMessage().textContent()) ?? '';
    }

     async closeError(): Promise<void> {
        await this.errorCloseButton().click();
    }

    // ─── ASSERTIONS ──────────────────────────────────────────────────────────
    // Assertions live IN the page object when they are reused across tests.
    // They should NOT contain test logic — only "is this element in this state?"

    async expectErrorVisible(): Promise<void> {
        await expect(this.errorMessage()).toBeVisible();
    }

    async expectErrorContains(text: string): Promise<void> {
        await expect(this.errorMessage()).toContainText(text);
    }

    async expectOnLoginPage(): Promise<void> {
        await expect(this.page).toHaveURL('/');
        await expect(this.loginButton()).toBeVisible();
    }

}