import {APIRequestContext, APIResponse} from '@playwright/test';

// ─── Type Definitions ─────────────────────────────────────────────────────────

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';


// ─── Why a union type for HttpMethod? ────────────────────────────────────────
// Instead of accepting any string, we restrict to valid HTTP methods.
// callApi({ method: 'GETT' }) → TypeScript error at compile time
// callApi({ method: 'GET' })  → compiles fine
// This prevents a whole class of runtime bugs from typos

export interface ApiRequestOptions {
    url: string;
    method: HttpMethod;
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
    pollingInterval?:number;
    retryCount?:number;
}

// ─── Why condition is a function, not a status code? ─────────────────────────
// Different callers have different success conditions.
// Some want status 200. Some want a field in the body to be "completed".
// By accepting a function, the caller defines success. This is the
// Strategy Pattern — behavior is injected, not hardcoded.

export class ApiHelper {
    private context: APIRequestContext;

    constructor(context: APIRequestContext) {
        this.context = context;
    }
    // ─── Core request method ──────────────────────────────────────────────────
    // All HTTP methods funnel through here.
    // One place to add logging, timing, auth headers in the future.
    // This is the Template Method pattern.
async callApi(options: ApiRequestOptions): Promise<APIResponse> {
        const { url, method, headers, data, params, timeout } = options;
        const fullUrl = this.buildUrl(url, params);

        switch (method) {
            case 'GET':
                return await this.context.get(fullUrl, { headers, timeout });
            case 'POST':
                return await this.context.post(fullUrl, { headers, data, timeout });
            case 'PUT':
                return await this.context.put(fullUrl, { headers, data, timeout });
            case 'DELETE':
                return await this.context.delete(fullUrl, { headers, timeout });
            case 'PATCH':
                return await this.context.patch(fullUrl, { headers, data, timeout });
            default:
                throw new Error(`Unsupported HTTP method: ${method}`);
        }
    }
    
    // ─── Convenience methods ──────────────────────────────────────────────────
    // These make call sites cleaner.
    // Without these: await apiHelper.callApi({ url, method: 'GET' })
    // With these:    await apiHelper.get(url)
    async get(url: string, options?: Omit<ApiRequestOptions, 'url'|'method'>):Promise<APIResponse> {
        return this.callApi({ url, method: 'GET', ...options });
    }

    // ─── What is Omit<T, K>? ─────────────────────────────────────────────────
    // Omit is a TypeScript utility type.
    // Omit<ApiRequestOptions, 'url' | 'method'> creates a new type that is
    // ApiRequestOptions WITHOUT the url and method fields.
    // This prevents callers from passing url/method in options since those
    // are already handled by the method signature.

    async post(
        url: string,
        data?: unknown,
        options?: Omit<ApiRequestOptions, 'url' | 'method' | 'data'>
    ): Promise<APIResponse> {
        return this.callApi({ url, method: 'POST', data, ...options });
    }

    async put(
        url: string,
        data?: unknown,
        options?: Omit<ApiRequestOptions, 'url' | 'method' | 'data'>
    ): Promise<APIResponse> {
        return this.callApi({ url, method: 'PUT', data, ...options });
    }

    async delete(
        url: string,
        options?: Omit<ApiRequestOptions, 'url' | 'method'>
    ): Promise<APIResponse> {
        return this.callApi({ url, method: 'DELETE', ...options });
    }

    async patch(
        url: string,
        data?: unknown,
        options?: Omit<ApiRequestOptions, 'url' | 'method' | 'data'>
    ): Promise<APIResponse> {
        return this.callApi({ url, method: 'PATCH', data, ...options });
    }

    // ─── Retry with polling ───────────────────────────────────────────────────
    // Use case: background job endpoints that take time to complete
    // Poll every 5 seconds until condition is met or retries exhausted

    async callApiWithRetry(
        options: ApiRequestOptions,
        retryOptions: RetryOptions
    ): Promise<APIResponse> {
        const { condition, pollingInterval = 5000, retryCount = 3 } = retryOptions;
        let lastResponse!: APIResponse;

        for (let attempt = 1; attempt <= retryCount; attempt++) {
            lastResponse = await this.callApi(options);

            if (await condition(lastResponse)) {
                return lastResponse;
            }

            if (attempt < retryCount) {
                await new Promise(resolve => setTimeout(resolve, pollingInterval));
            }
        }

        return lastResponse;
    }

    // ─── Type-safe JSON parsing ───────────────────────────────────────────────
    // Generic method — T is the expected response shape
    // await apiHelper.parseJson<LoginResponse>(response)
    // Returns LoginResponse type with full IntelliSense

    async parseJson<T>(response: APIResponse): Promise<T> {
        return await response.json() as T;
    }

    // ─── Response validation helpers ──────────────────────────────────────────

    isSuccess(response: APIResponse): boolean {
        const status = response.status();
        return status >= 200 && status < 300;
    }

    assertStatus(response: APIResponse, expectedStatus: number): void {
        const actual = response.status();
        if (actual !== expectedStatus) {
            throw new Error(
                `Expected status ${expectedStatus} but got ${actual}.\nURL: ${response.url()}`
            );
        }
    }
    // ─── Private helpers ──────────────────────────────────────────────────────
     private buildUrl(url: string, params?: Record<string, string>): string {
        if (!params) return url;
        const searchParams = new URLSearchParams(params);
        return `${url}?${searchParams.toString()}`;
    }
}