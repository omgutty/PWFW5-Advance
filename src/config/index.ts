import * as dotenv from 'dotenv';


dotenv.config();

// ─── Interfaces ─────────────────────────────────────────────────────────────
// These are TypeScript contracts. Any object claiming to be AppConfig
// MUST have all these fields with these exact types.
// The compiler enforces this — no runtime surprises.

export interface TestUser{
    username:string;
    password:string;
}

export interface AppConfig{
    baseUrl: string;
    apiBaseUrl: string;
    apiTimeout: number;
    testUser: TestUser;
    logLevel: string;
    defaultTimeout: number;
}

// ─── Config Object ───────────────────────────────────────────────────────────
// This is the SINGLE SOURCE OF TRUTH for all configuration.
// playwright.config.ts will import FROM here — not define its own values.
// This eliminates the duplication problem we identified in the analysis.- Got it

export const config:AppConfig={
    baseUrl: process.env.BASE_URL ?? 'https://www.saucedemo.com',
    apiBaseUrl: process.env.API_BASE_URL ?? 'https://www.saucedemo.com',
    apiTimeout: parseInt(process.env.API_TIMEOUT ?? '30000', 10),
    defaultTimeout: 30000,
    testUser: {
        username: process.env.TEST_USERNAME ?? 'standard_user',
        password: process.env.TEST_PASSWORD ?? 'secret_sauce',
    },
    logLevel: process.env.LOG_LEVEL ?? 'INFO',
}

// ─── Why ?? instead of || ───────────────────────────────────────────────────
// The ?? operator (nullish coalescing) only falls back on null/undefined.
// The || operator falls back on ANY falsy value including empty string ''.
// If TEST_USERNAME='' in .env, || would silently use the fallback.
// ?? preserves the explicit empty string if that's what was set.

export default config;

/**
 * Centralized Application Configuration Layer
 * -------------------------------------------
 * This file acts as the SINGLE SOURCE OF TRUTH for all runtime configuration
 * used across the framework.
 *
 * Responsibilities:
 * - Load environment variables from .env
 * - Provide typed configuration using TypeScript interfaces
 * - Store reusable application settings:
 *      - Base URLs
 *      - API URLs
 *      - Test credentials
 *      - Timeouts
 *      - Log levels
 *
 * Why this file exists:
 * ---------------------
 * Instead of accessing process.env everywhere in the framework,
 * all configuration is centralized here and exported as a typed object.
 *
 * Benefits:
 * - Avoids duplicated configuration
 * - Improves maintainability
 * - Provides TypeScript type safety
 * - Creates cleaner architecture
 * - Enables reuse across:
 *      - Playwright config
 *      - Page Objects
 *      - API clients
 *      - Fixtures
 *      - Utilities
 *
 * Architecture Flow:
 * ------------------
 * .env
 *   ↓
 * config/index.ts
 *   ↓
 * typed config object
 *   ↓
 * consumed across framework
 *
 * Important:
 * ----------
 * playwright.config.ts should CONSUME config from here,
 * not redefine environment values again.
 */