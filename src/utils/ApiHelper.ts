import {APIRequestContext} from '@playwright/test';

export type httpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';


// ─── Why a union type for HttpMethod? ────────────────────────────────────────
// Instead of accepting any string, we restrict to valid HTTP methods.
// callApi({ method: 'GETT' }) → TypeScript error at compile time
// callApi({ method: 'GET' })  → compiles fine
// This prevents a whole class of runtime bugs from typos

export interface ApiRequestOptions {
    url: string;
    method: httpMethod;
    headers?: Record<string, string>;
    data?: unknown;
    params?: Record<string, string>;
    timeout?: number;
}
// ─── Why Record<string, string>? ─────────────────────────────────────────────
// Record<K, V> is a TypeScript utility type meaning "object with keys of type K
// and values of type V". Record<string, string> means any object where both
// keys and values are strings. Perfect for headers and query params.
