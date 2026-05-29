import {APIRequestContext, APIResponse} from '@playwright/test';

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


export interface RetryOptions {
    condition:(response:APIResponse)=>Promise<boolean>|boolean;
    polingInterval?:number;
    retryCount?:number;
}

// ─── Why condition is a function, not a status code? ─────────────────────────
// Different callers have different success conditions.
// Some want status 200. Some want a field in the body to be "completed".
// By accepting a function, the caller defines success. This is the
// Strategy Pattern — behavior is injected, not hardcoded.

export class ApiHelper {
    private request: APIRequestContext;

    constructor(request: APIRequestContext) {
        this.request = request;
    }
    // ─── Core request method ──────────────────────────────────────────────────
    // All HTTP methods funnel through here.
    // One place to add logging, timing, auth headers in the future.
    // This is the Template Method pattern.

    
}