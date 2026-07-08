import {APIRequestContext, test as base, Page,request} from '@playwright/test';
import { config } from '../config';
//pages
import { LoginPage ,CartPage,InventoryPage} from '../pages';

//modules
import { LoginModule ,ProductModule} from '../modules';

//api
import { PostsApi } from '../api';
import { LoginModule2 } from '../modules/LoginModule2';

// ─── TestFixtures Interface ──────────────────────────────────────────────────
// This is the TYPE CONTRACT for all fixtures.
// base.extend<TestFixtures>() tells Playwright:
// "these are the fixture names and their return types"
// Any test destructuring { loginPage } will get exactly LoginPage type.
// TypeScript errors at compile time if you try to use a fixture not listed here.

export type TestFixtures = {
    authenticatedPage: Page;

    loginPage: LoginPage;
    inventoryPage: InventoryPage;
    cartPage: CartPage;
   
    loginModule: LoginModule;
    loginModule2:LoginModule2;
    productModule: ProductModule;

    postsApi: PostsApi;
    apiContext: APIRequestContext;
    
};


export const test = base.extend<TestFixtures>({

     // ─── Simple Fixture ──────────────────────────────────────────────────────
    // { page } is automatically provided by Playwright's base fixtures.
    // We don't create the page — we just wrap it in our Page Object.
    // The `use` callback receives the constructed object and passes it to the test.

    loginPage: async ({page},use)=>{
        // SETUP: construct the page object
        const loginPageInstance = new LoginPage(page);
        // USE: hand it to the test. Test runs here.
        await use( loginPageInstance)  
        // TEARDOWN: nothing needed — page cleanup is handled by Playwright's
        // built-in page fixture automatically 
    },

    loginModule: async ({page},use)=>{
        await  use(new LoginModule(page));
    },
    loginModule2: async ({page}, use )=>{
        await use(new LoginModule2(page))
    },
    inventoryPage: async ({ page }, use) => {
        await use(new InventoryPage(page));
    },
    cartPage: async ({ page }, use) => {
        await use(new CartPage(page));
    },
    productModule: async ({ page }, use) => {
        await use(new ProductModule(page));
    },

    // ─── Standalone API context ───────────────────────────────────────────────
    // This creates a pure HTTP client with NO browser attached.
    // Use this for tests that only make API calls — no UI involved.
    // It is lighter and faster than using page.request

    apiContext: async ({}, use) => {
        // request.newContext() creates a standalone APIRequestContext
        // It has its own cookie jar, headers, baseURL
        const apiRequestContext = await request.newContext({
            baseURL: 'https://jsonplaceholder.typicode.com',
            extraHTTPHeaders: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        
            // Disable SSL certificate verification
        // Required in corporate networks with SSL inspection proxies
        ignoreHTTPSErrors: true,
        });

        await use(apiRequestContext);

        // TEARDOWN — dispose the context to release network resources
        await apiRequestContext.dispose();
    },
    // ─── Posts API fixture ────────────────────────────────────────────────────
    // Wraps apiContext in the PostsApi domain class
    // Test destructures { postsApi } and gets a fully configured client

    postsApi: async ({ apiContext }, use) => {
        // postsApi depends on apiContext
        // Playwright resolves this dependency automatically
        // apiContext fixture runs first, then postsApi fixture runs
        await use(new PostsApi(apiContext));
    },
    // ─── Authenticated Page Fixture ──────────────────────────────────────────
    // This is the key concept from checkpoint 2.
    //
    // WHY it uses { browser } instead of { page }:
    // The default { page } fixture shares a BrowserContext with other fixtures
    // in the same test. BrowserContext is where cookies/session live.
    //
    // If we did auth inside the default page fixture, those cookies would
    // be visible to ALL other fixtures in the test — potentially causing
    // interference in tests that specifically test the unauthenticated state.
    //
    // By creating our OWN context here, we get:
    // 1. Complete isolation — this auth session cannot affect other tests
    // 2. Explicit cleanup — we call context.close() ourselves
    // 3. Flexibility — we can configure this context differently (e.g., different
    //    viewport, locale, or storageState) without affecting other fixtures

    authenticatedPage:async({browser},use)=>{
        // Create a fresh, isolated browser context
        // This context has its own cookies, localStorage, sessionStorage
        const  context= await browser.newContext();
        const page=await context.newPage();

        // Perform login inside this isolated context
        const loginPage = new LoginPage(page);
        await loginPage.navigate();
        await loginPage.enterUsername(config.testUser.username);
        await loginPage.enterPassword(config.testUser.password);
        await loginPage.clickonLogin();
        await (page).waitForURL('**/inventory.html');

         // Hand the authenticated page to the test
        // At this point: the test body runs
        await use(page);

        // TEARDOWN: close the entire context
        // This deletes all cookies, storage, and closes all pages in this context
        // Ensures no auth state leaks to subsequent tests
        await context.close();
    }
})

export { expect } from '@playwright/test';