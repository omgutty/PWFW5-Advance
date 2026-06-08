import { Page, Locator } from '@playwright/test';
import { Logger } from './Logger';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface HealingResult {
    found: boolean;
    usedSelector: string;
    usedIndex: number;
    wasHealed: boolean;
    allSelectors: string[];
}

export interface HealingEvent {
    timestamp: string;
    elementName: string;
    primarySelector: string;
    healedSelector: string;
    healedIndex: number;
    testName: string;
}

// ─── Self-Healing Locator Class ───────────────────────────────────────────────

export class SelfHealingLocator {
    private page: Page;
    private logger: Logger;

    // ─── Static healing log ───────────────────────────────────────────────────
    // Static means ONE shared log across ALL SelfHealingLocator instances
    // Collects all healing events from all tests in one place
    // Used to generate the healing report at the end

    private static healingLog: HealingEvent[] = [];

    constructor(page: Page) {
        this.page = page;
        this.logger = Logger.create('SelfHealingLocator');
    }

    // ─── Core Method ──────────────────────────────────────────────────────────
    // Takes element name (for logging) and array of selectors
    // Returns a Playwright Locator for the first selector that finds an element
    // Logs a warning if it had to use a fallback

    async findElement(
        elementName: string,
        selectors: string[],
        options: { timeout?: number; testName?: string } = {}
    ): Promise<Locator> {

        const timeout = options.timeout ?? 5000;
        const testName = options.testName ?? 'unknown';

        if (selectors.length === 0) {
            throw new Error(`SelfHealingLocator: No selectors provided for "${elementName}"`);
        }

        // ── Try each selector ─────────────────────────────────────────────────
        for (let i = 0; i < selectors.length; i++) {
            const selector = selectors[i];
            const isPrimary = i === 0;

            try {
                const locator = this.page.locator(selector);

                // waitFor with short timeout
                // If element not visible within timeout → exception → try next
                await locator.waitFor({
                    state: 'visible',
                    timeout: timeout
                });

                // ── Element found ─────────────────────────────────────────────
                if (isPrimary) {
                    // Primary locator worked — no healing needed
                    this.logger.debug(
                        `"${elementName}" found with primary selector: ${selector}`
                    );
                } else {
                    // Fallback locator worked — healing occurred
                    this.logger.warn(
                        `⚠️  SELF-HEALING: "${elementName}" primary selector failed.\n` +
                        `   Primary:  ${selectors[0]}\n` +
                        `   Used:     ${selector} (fallback ${i})\n` +
                        `   → Update primary selector to: ${selector}`
                    );

                    // Record the healing event
                    const healingEvent: HealingEvent = {
                        timestamp: new Date().toISOString(),
                        elementName,
                        primarySelector: selectors[0],
                        healedSelector: selector,
                        healedIndex: i,
                        testName,
                    };

                    SelfHealingLocator.healingLog.push(healingEvent);
                }

                return locator;

            } catch {
                // This selector did not find element within timeout
                // Log which selector failed and try next one
                this.logger.debug(
                    `"${elementName}" selector ${i} failed: ${selector}`
                );

                // If this was the last selector — all failed
                if (i === selectors.length - 1) {
                    const errorMessage = [
                        `SelfHealingLocator: Could not find "${elementName}".`,
                        `Tried ${selectors.length} selector(s):`,
                        ...selectors.map((s, idx) => `  [${idx}] ${s}`),
                    ].join('\n');

                    throw new Error(errorMessage);
                }
            }
        }

        // TypeScript requires this even though the loop always returns or throws
        throw new Error(`SelfHealingLocator: Unexpected state for "${elementName}"`);
    }

    // ─── Convenience method for click ─────────────────────────────────────────
    async click(
        elementName: string,
        selectors: string[],
        options: { timeout?: number; testName?: string } = {}
    ): Promise<void> {
        const locator = await this.findElement(elementName, selectors, options);
        await locator.click();
    }

    // ─── Convenience method for fill ──────────────────────────────────────────
    async fill(
        elementName: string,
        selectors: string[],
        value: string,
        options: { timeout?: number; testName?: string } = {}
    ): Promise<void> {
        const locator = await this.findElement(elementName, selectors, options);
        await locator.fill(value);
    }

    // ─── Convenience method for getText ───────────────────────────────────────
    async getText(
        elementName: string,
        selectors: string[],
        options: { timeout?: number; testName?: string } = {}
    ): Promise<string> {
        const locator = await this.findElement(elementName, selectors, options);
        return (await locator.textContent()) ?? '';
    }

    // ─── Static: Get all healing events ───────────────────────────────────────
    static getHealingLog(): HealingEvent[] {
        return [...SelfHealingLocator.healingLog];
    }

    // ─── Static: Clear log between test runs ──────────────────────────────────
    static clearHealingLog(): void {
        SelfHealingLocator.healingLog = [];
    }

    // ─── Static: Get healing summary ──────────────────────────────────────────
    static getHealingSummary(): string {
        const log = SelfHealingLocator.healingLog;

        if (log.length === 0) {
            return '✅ No self-healing events. All primary locators worked correctly.';
        }

        const lines = [
            `⚠️  SELF-HEALING SUMMARY: ${log.length} healing event(s) detected`,
            '─'.repeat(60),
            'These primary locators need to be updated:',
            '',
        ];

        log.forEach((event, index) => {
            lines.push(`${index + 1}. Element: "${event.elementName}"`);
            lines.push(`   Test:     ${event.testName}`);
            lines.push(`   Old:      ${event.primarySelector}`);
            lines.push(`   New:      ${event.healedSelector}`);
            lines.push(`   Time:     ${event.timestamp}`);
            lines.push('');
        });

        return lines.join('\n');
    }

    // ─── Static: Write healing report to file ─────────────────────────────────
    static writeHealingReport(outputPath: string = 'test-results/healing-report.json'): void {
        const fs = require('fs');
        const path = require('path');

        const reportDir = path.dirname(outputPath);
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }

        const report = {
            generatedAt: new Date().toISOString(),
            totalHealingEvents: SelfHealingLocator.healingLog.length,
            events: SelfHealingLocator.healingLog,
        };

        fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    }
}