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

    
}