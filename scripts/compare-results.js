#!/usr/bin/env node

/**
 * compare-results.js — Phase 3, Step 1: Deterministic Playwright result comparison.
 *
 * Reads the latest Playwright JSON report plus the self-healing report, archives
 * the current run, diffs it against the most recent archived run, and writes a
 * normalized ai-results/regression-summary.json.
 *
 * Node built-ins only. No LLM, no Langflow — fully deterministic.
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ─── Paths ────────────────────────────────────────────────────────────────────
const ROOT = path.resolve(__dirname, '..');
const RESULTS_FILE = path.join(ROOT, 'test-results', 'results.json');
const HEALING_FILE = path.join(ROOT, 'test-results', 'healing-report.json');
const HISTORY_DIR = path.join(ROOT, 'ai-results', 'history');
const SUMMARY_FILE = path.join(ROOT, 'ai-results', 'regression-summary.json');

// ─── Fail fast if the Playwright report is missing ────────────────────────────
if (!fs.existsSync(RESULTS_FILE)) {
    console.error(`[compare-results] ERROR: ${RESULTS_FILE} does not exist.`);
    console.error('[compare-results] Run `npx playwright test` first so a JSON report is produced.');
    process.exit(1);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readJson(filePath, fallback) {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
        if (fallback !== undefined) {
            console.warn(`[compare-results] WARNING: could not read ${filePath} (${err.message}); using fallback.`);
            return fallback;
        }
        throw err;
    }
}

function toRunId(startTime) {
    const d = new Date(startTime);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_` +
           `${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function getRunTimestamp(startTime) {
    const d = new Date(startTime);
    return d.toISOString();
}

/**
 * Flatten the nested suites[] tree into one record per test execution.
 * Identity: spec.file + spec.title (the stable key for comparison).
 */
function flattenTests(data) {
    const out = [];
    const walk = (suites) => {
        for (const suite of suites || []) {
            for (const spec of suite.specs || []) {
                for (const test of spec.tests || []) {
                    const result = (test.results && test.results[0]) || {};
                    out.push({
                        id: `${spec.file}::${spec.title}`,
                        file: spec.file,
                        title: spec.title,
                        ok: !!spec.ok,
                        status: test.status || 'unknown', // expected | unexpected | flaky | skipped
                        expectedStatus: test.expectedStatus || 'passed',
                        duration: typeof result.duration === 'number' ? result.duration : 0,
                        error: firstError(result.errors),
                        stderr: result.stderr || [],
                        tags: spec.tags || [],
                    });
                }
            }
            walk(suite.suites);
        }
    };
    walk(data.suites || []);
    return out;
}

function firstError(errors) {
    if (!Array.isArray(errors) || errors.length === 0) return null;
    const e = errors[0];
    return (e && (e.message || e.error && e.error.message)) || null;
}

function deriveCounts(tests) {
    const counts = { total: 0, passed: 0, failed: 0, skipped: 0, flaky: 0 };
    for (const t of tests) {
        counts.total++;
        if (t.status === 'skipped' || t.status === 'expected' && t.expectedStatus === 'skipped') {
            counts.skipped++;
        } else if (t.status === 'flaky') {
            counts.flaky++;
        } else if (t.status === 'unexpected' || !t.ok) {
            counts.failed++;
        } else {
            counts.passed++;
        }
    }
    return counts;
}

function isFailure(t) {
    return t.status === 'unexpected' || (t.status === 'expected' && t.expectedStatus !== 'passed');
}

function formatDurationMs(ms) {
    const d = Math.abs(ms);
    const unit = ms < 0 ? '-' : '';
    if (d < 1000) return `${unit}${d}ms`;
    if (d < 60000) return `${unit}${(d / 1000).toFixed(1)}s`;
    return `${unit}${(d / 60000).toFixed(1)}m`;
}

// ─── Load current run ─────────────────────────────────────────────────────────
const currentRaw = readJson(RESULTS_FILE, null);
if (!currentRaw || !currentRaw.stats || !currentRaw.suites) {
    console.error(`[compare-results] ERROR: ${RESULTS_FILE} is not a valid Playwright JSON report.`);
    process.exit(1);
}

const currentStart = currentRaw.stats.startTime || new Date().toISOString();
const runId = toRunId(currentStart);
const currentTests = flattenTests(currentRaw);
const currentCounts = deriveCounts(currentTests);
const currentDuration = typeof currentRaw.stats.duration === 'number' ? currentRaw.stats.duration : 0;

console.log(`[compare-results] Current run: ${runId} (${currentStart})`);
console.log(`[compare-results] Tests: ${currentCounts.total} | ` +
            `passed: ${currentCounts.passed} | failed: ${currentCounts.failed} | ` +
            `skipped: ${currentCounts.skipped} | flaky: ${currentCounts.flaky}`);

// ─── Archive the current run ──────────────────────────────────────────────────
fs.mkdirSync(HISTORY_DIR, { recursive: true });
const archiveFile = path.join(HISTORY_DIR, `results_${runId}.json`);

if (fs.existsSync(archiveFile)) {
    console.warn(`[compare-results] WARNING: archive already exists — skipping overwrite: ${archiveFile}`);
} else {
    fs.copyFileSync(RESULTS_FILE, archiveFile);
    console.log(`[compare-results] Archived current run → ${archiveFile}`);
}

// ─── Find the most recent previous archive ────────────────────────────────────
const archiveFiles = fs.readdirSync(HISTORY_DIR)
    .filter((f) => /^results_\d{8}_\d{6}\.json$/.test(f))
    .sort()
    .reverse();

// Exclude the archive we just wrote for THIS run
const previousFile = archiveFiles.find((f) => path.join(HISTORY_DIR, f) !== archiveFile) || null;

// ─── Load healing report (graceful) ───────────────────────────────────────────
const healing = readJson(HEALING_FILE, { totalHealingEvents: 0, events: [] });
const healingData = {
    totalHealingEvents: typeof healing.totalHealingEvents === 'number' ? healing.totalHealingEvents : (healing.events || []).length,
    events: Array.isArray(healing.events) ? healing.events : [],
};

// ─── Compare ──────────────────────────────────────────────────────────────────
const comparisonAvailable = !!previousFile;
let baseline = null;
const comparison = {
    newFailures: [],
    recoveredTests: [],
    persistentFailures: [],
    newTests: [],
    removedTests: [],
    durationChange: { absoluteMs: 0, percentage: 0 },
};

if (!comparisonAvailable) {
    console.log('[compare-results] No previous archive found — treating current run as baseline.');
} else {
    const previousRaw = readJson(path.join(HISTORY_DIR, previousFile), null);
    const previousStart = (previousRaw && previousRaw.stats && previousRaw.stats.startTime) || '';
    const prevRunId = previousStart ? toRunId(previousStart) : path.basename(previousFile, '.json').replace('results_', '');

    const previousTests = previousRaw ? flattenTests(previousRaw) : [];
    const prevCounts = deriveCounts(previousTests);
    const prevDuration = (previousRaw && typeof previousRaw.stats.duration === 'number') ? previousRaw.stats.duration : 0;

    baseline = {
        runId: prevRunId,
        startTime: previousStart,
    };

    console.log(`[compare-results] Comparing against: ${previousFile}`);
    console.log(`[compare-results] Baseline: ${prevRunId} (${previousStart}) | ` +
                `passed: ${prevCounts.passed} | failed: ${prevCounts.failed} | ` +
                `skipped: ${prevCounts.skipped} | flaky: ${prevCounts.flaky}`);

    const prevById = new Map(previousTests.map((t) => [t.id, t]));
    const curById = new Map(currentTests.map((t) => [t.id, t]));

    const currentFailures = currentTests.filter(isFailure);
    const previousFailures = previousTests.filter(isFailure);

    // New failures: failed now, but either passed or absent in the baseline
    for (const t of currentFailures) {
        const prev = prevById.get(t.id);
        if (!prev || !isFailure(prev)) {
            comparison.newFailures.push({
                file: t.file,
                title: t.title,
                status: t.status,
                error: t.error,
                duration: t.duration,
            });
        }
    }

    // Persistent failures: failed now AND failed in the baseline
    for (const t of currentFailures) {
        const prev = prevById.get(t.id);
        if (prev && isFailure(prev)) {
            comparison.persistentFailures.push({
                file: t.file,
                title: t.title,
                status: t.status,
                error: t.error,
                duration: t.duration,
            });
        }
    }

    // Recovered tests: passed now, but failed in the baseline
    for (const t of currentTests) {
        if (!isFailure(t)) {
            const prev = prevById.get(t.id);
            if (prev && isFailure(prev)) {
                comparison.recoveredTests.push({
                    file: t.file,
                    title: t.title,
                    status: t.status,
                    duration: t.duration,
                });
            }
        }
    }

    // Newly added tests: present now, absent in baseline
    for (const t of currentTests) {
        if (!prevById.has(t.id)) {
            comparison.newTests.push({
                file: t.file,
                title: t.title,
                status: t.status,
                duration: t.duration,
            });
        }
    }

    // Removed tests: present in baseline, absent now
    for (const t of previousTests) {
        if (!curById.has(t.id)) {
            comparison.removedTests.push({
                file: t.file,
                title: t.title,
                status: t.status,
                duration: t.duration,
            });
        }
    }

    // Duration change
    comparison.durationChange = {
        absoluteMs: Math.round(currentDuration - prevDuration),
        percentage: prevDuration > 0 ? Number((((currentDuration - prevDuration) / prevDuration) * 100).toFixed(2)) : 0,
    };
}

// ─── Summary ──────────────────────────────────────────────────────────────────
const summary = {
    generatedAt: new Date().toISOString(),
    comparisonAvailable,
    baseline,
    current: {
        runId,
        startTime: currentStart,
        duration: currentDuration,
        counts: currentCounts,
    },
    comparison,
    healing: healingData,
};

fs.mkdirSync(path.dirname(SUMMARY_FILE), { recursive: true });
fs.writeFileSync(SUMMARY_FILE, JSON.stringify(summary, null, 2) + '\n');

// ─── Console report ───────────────────────────────────────────────────────────
console.log('─'.repeat(60));
if (!comparisonAvailable) {
    console.log('[compare-results] BASELINE RUN (no previous archive to compare).');
} else {
    console.log(`[compare-results] NEW FAILURES: ${comparison.newFailures.length}`);
    for (const f of comparison.newFailures) {
        console.log(`  - ${f.file} :: ${f.title}`);
        if (f.error) console.log(`      ${f.error}`);
    }
    console.log(`[compare-results] RECOVERED: ${comparison.recoveredTests.length}`);
    for (const r of comparison.recoveredTests) {
        console.log(`  + ${r.file} :: ${r.title}`);
    }
    console.log(`[compare-results] PERSISTENT FAILURES: ${comparison.persistentFailures.length}`);
    for (const f of comparison.persistentFailures) {
        console.log(`  ! ${f.file} :: ${f.title}`);
    }
    console.log(`[compare-results] NEW TESTS: ${comparison.newTests.length}`);
    console.log(`[compare-results] REMOVED TESTS: ${comparison.removedTests.length}`);
    console.log(`[compare-results] DURATION CHANGE: ${formatDurationMs(comparison.durationChange.absoluteMs)} ` +
                `(${comparison.durationChange.percentage}%)`);
}
console.log(`[compare-results] Healing events: ${healingData.totalHealingEvents}`);
console.log(`[compare-results] Summary written → ${SUMMARY_FILE}`);
