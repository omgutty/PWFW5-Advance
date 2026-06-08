import { defineConfig, devices } from '@playwright/test';
import { config } from './src/config';

// Notice: we import config from src/config, NOT dotenv directly here.
// src/config/index.ts already calls dotenv.config() and exports a typed object.
// playwright.config.ts simply consumes it.
// This is the single source of truth fix from the analysis.

// Handle SSL issues in corporate networks
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export default defineConfig({
    testDir: './src/tests',
    // this tear down is for the self healing tear down 
    globalTeardown: './src/fixtures/global.teardown.ts', 
    // Global test timeout — entire test including beforeEach
    timeout: 60000,
    
    // Assertion-level timeout — how long expect(...).toBeVisible() waits
    expect: { timeout: 10000 },
    
    // Tests within a file run in parallel (different workers)
    fullyParallel: true,
    
    // If someone commits test.only(), fail the CI build immediately
    // !! converts any truthy value to boolean true
    forbidOnly: !!process.env.CI,
    
    // Retry failed tests: 2 times in CI, 0 locally (fail fast during dev)
    retries: process.env.CI ? 2 : 0,
    
    // Parallel workers: less in CI to avoid resource contention
    workers: process.env.CI ? 2 : undefined,

    // reporter: [
    //     ['html', { open: 'never' }],
    //     ['json', { outputFile: 'test-results/results.json' }],
    //     ['list'],
    // ],

    reporter: [
    ['./src/utils/CustomTTAReporter.ts'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
],

    use: {
        // THIS is the fix — imported from config, not duplicated
        baseURL: config.baseUrl,
        
        // Only capture evidence on failure — keep storage clean on passing runs
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'retain-on-failure',
        
        // Automatically wait for network to be idle after navigation
        actionTimeout: 15000,
        navigationTimeout: 30000,
        ignoreHTTPSErrors: true, // Required in corporate networks with SSL inspection proxies
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },
        {
            name: 'mobile-chrome',
            use: { ...devices['Pixel 5'] },
        },
    ],
});