import { Page } from "@playwright/test";
// ─── Why WaitHelper exists ────────────────────────────────────────────────────
// Playwright has built-in auto-waiting but some scenarios need explicit waits.
// Centralizing wait logic means one place to change wait strategies.
// Tests never call page.waitForTimeout() directly — that is a code smell.
// They call WaitHelper methods with semantic names.

export class WaitHelper{
    private page: Page;

    constructor(page:Page){
        this.page = page;
    }

        // ─── Wait for API response ─────────────────────────────────────────────────
    // Use when a UI action triggers an API call
    // Wait for the network response before asserting UI state
    async waitForApiResponse(
        urlPattern:string|RegExp,
        action:()=>Promise<void>
    ):Promise<void>{
        await Promise.all([
            this.page.waitForURL(urlPattern),
            action(),
        ])
    }

    // wait for navigation-----------------
    async waitForNavigation(
        urlpattern:string|RegExp,
        action: ()=>Promise<void>
    ):Promise<void>{
        await Promise.all([
            this.page.waitForURL(urlpattern),
            action(),
        ])
    }

    //wait for element state---------------------
    async waitForVisible(selector:string):Promise<void>{
        await this.page.locator(selector).waitFor({state:'visible'})
    }

    async waitForHidden(selector:string):Promise<void>{
        await this.page.locator(selector).waitFor({state:'hidden'})
    }

    /**
 * Polls repeatedly until a specified asynchronous condition returns true
 * or the configured timeout is reached.
 *
 * Purpose:
 * - Used to wait for application state changes that are not directly tied
 *   to a single UI element, network request, or Playwright built-in wait.
 * - Useful for validating backend processing, database updates, status
 *   transitions, background jobs, cache refreshes, or any custom condition.
 *
 * Implementation:
 * - Executes the provided condition callback at a fixed interval.
 * - Stops polling immediately when the condition evaluates to true.
 * - Continues polling until the timeout is exceeded.
 * - Throws an error if the condition is not satisfied within the timeout period.
 *
 * @param condition Async callback that returns true when the expected state is reached.
 * @param options Optional polling configuration.
 * @param options.timeout Maximum wait time in milliseconds (default: 30000ms).
 * @param options.interval Polling interval in milliseconds (default: 1000ms).
 *
 * @returns Promise<void> Resolves when the condition is met.
 *
 * @throws Error If the condition is not met within the specified timeout.
 *
 * Example:
 * await utility.pollUntil(
 *   async () => {
 *     const status = await orderPage.getOrderStatus();
 *     return status === 'Completed';
 *   },
 *   {
 *     timeout: 60000,
 *     interval: 2000
 *   }
 * );
 */
async pollUntil(
    condition: () => Promise<boolean>,
    options: { timeout?: number; interval?: number } = {}
): Promise<void> {
    const timeout = options.timeout ?? 30000;
    const interval = options.interval ?? 1000;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        if (await condition()) return;
        await new Promise(resolve => setTimeout(resolve, interval));
    }

    throw new Error(`Condition not met within ${timeout}ms`);
}
}