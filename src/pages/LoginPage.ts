import { Page,expect } from "@playwright/test";

import { SelfHealingLocator } from '../utils';

export class LoginPage{
     // private enforces encapsulation.
    // Code outside this class cannot do: loginPage.page.goto('/something')
    // All interactions must go through this class's methods.
    private page: Page;
    private healer: SelfHealingLocator;

    constructor(page: Page) {
        this.page = page;
        this.healer = new SelfHealingLocator(page);
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

    // ─── Standard Locators (unchanged) ────────────────────────────────────────
    // Keep these for assertions and simple interactions
    // Self-healing is used for ACTIONS only

    username=()=>this.page.locator('[data-test="username"]');
    passwordInput = () => this.page.locator('[data-test="password"]');
    loginButton = () => this.page.locator('[data-test="login-button"]');
    errorMessage = () => this.page.locator('[data-test="error"]');
    errorCloseButton = () => this.page.locator('[data-test="error-button"]');



// ─── Self-Healing Selector Definitions ────────────────────────────────────
    // Each element has a PRIMARY selector and FALLBACK selectors
    // Ordered from most specific to most generic
    // Most specific = least likely to match wrong element
    // Most generic = last resort, still correct

    private selectors = {
        username: [//BROKEN add in primary selector 
            '[data-test="username  "]',        // primary — most specific
            '#user-name',                    // fallback 1 — id based
            'input[placeholder*="Username"]', // fallback 2 — attribute
            'input[name="user-name"]',       // fallback 3 — name attribute
            'input[type="text"]:first-child', // fallback 4 — structural
        ],
        password: [
            '[data-test="password"]',        // primary
            '#password',                     // fallback 1
            'input[placeholder*="Password"]', // fallback 2
            'input[type="password"]',        // fallback 3
        ],
        loginButton: [
            '[data-test="login-button"]',    // primary
            'input[type="submit"]',          // fallback 1
            'button[type="submit"]',         // fallback 2
            '.btn_action',                   // fallback 3 — class
            'button:has-text("Login")',      // fallback 4 — text
            '[value="Login"]',               // fallback 5 — value
        ],
    };



    // ─── ACTIONS ─────────────────────────────────────────────────────────────
    // Each method does ONE thing.
    // No method in a Page Object should contain if/else business logic.
    // Business logic belongs in Modules.

    async navigate():Promise<void>{
        
        await this.page.goto('/',{ waitUntil: 'domcontentloaded' })
    }

   // ─── Self-healing actions ──────────────────────────────────────────────────
    // These use the healer instead of direct locator calls
    // If primary fails, healer tries fallbacks automatically

    async enterUsername(username: string, testName?: string): Promise<void> {
        await this.healer.fill(
            'username input',
            this.selectors.username,
            username,
            { testName }
        );
    }

    async enterPassword(password: string, testName?: string): Promise<void> {
        await this.healer.fill(
            'password input',
            this.selectors.password,
            password,
            { testName }
        );
    }

    async clickonLogin(testName?: string): Promise<void> {
        await this.healer.click(
            'login button',
            this.selectors.loginButton,
            { testName }
        );
    }

     // ─── Non-critical actions stay as direct locator calls ────────────────────
    // Self-healing adds overhead (multiple waitFor calls)
    // Only use it for elements that change frequently

    async geterrrormessage():Promise<string>{
        // Wait for the element to be visible before reading text
    // Without this, textContent() can return null on fast responses
     await this.errorMessage().waitFor({ state: 'visible' });
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