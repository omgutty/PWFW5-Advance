// Import from OUR fixtures, not from @playwright/test directly
// This gives us loginPage, loginModule, authenticatedPage
import{test,expect}from '../fixtures'
import { config } from '../config';






// ─── test.describe ────────────────────────────────────────────────────────────
// Groups related tests. The string becomes the suite name in the report.
// @Smoke and @P0 are tags — used for filtering: npx playwright test --grep @Smoke

test.describe('@PO @Smoke Login Feature',()=>{

    test('should login with valid credentials',async ({loginModule,page})=>{
        // loginModule → comes from YOUR TestFixtures
        // page        → comes from Playwright BASE fixtures
        // Both are available because base.extend() merges them
        // page comes from Playwright base fixtures automatically
        // loginModule comes from your TestFixtures
        // both are destructured from the same parameter
        await test.step('Perform login with valid credentials',async ()=>{
            await loginModule.dologin(config.testUser.username,config.testUser.password)
        })
        // test.step does NOT receive fixtures as parameters
        // it receives nothing — it is just an async wrapper

        await test.step('verify user is on inventory page', async ()=>{
               await expect(page).toHaveURL(/inventory/);
                // page is accessible here because it is in the outer async scope
            // JavaScript closures give inner functions access to outer variables
        })   
    });

    test('should show error invalid credentials ',async ({loginModule })=>{
        await test.step('Attempt logging in with invalid password',async ()=>{
           const errorText= await loginModule.attemptInvalidLogin
                ( 'standard_user',
                'wrong_password');
            expect(errorText).toContain('Username and password do not match');
        });
        
    })
});


    // ─── Using the authenticatedPage fixture ─────────────────────────────────────
    // This test receives a page that is ALREADY logged in.
    // No login code needed in the test body.
    // The fixture handles it transparently.
test.describe('@P1 @Regression Post-Login State', () => {
    test('should be on inventory page after authentication', async ({ authenticatedPage }) => {
        await test.step('Verify authenticated page lands on inventory', async () => {
            await expect(authenticatedPage).toHaveURL(/inventory/);
        });
    });
});

    


    



