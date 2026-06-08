import { SelfHealingLocator } from '../utils';

// ─── Global Teardown ──────────────────────────────────────────────────────────
// Runs ONCE after ALL tests complete
// Perfect place to print and save the healing report

async function globalTeardown(): Promise<void> {
    // Print healing summary to console
    console.log('\n' + SelfHealingLocator.getHealingSummary());

    // Write healing report to JSON file
    SelfHealingLocator.writeHealingReport('test-results/healing-report.json');
}

export default globalTeardown;