// Import from OUR fixtures, not from @playwright/test directly
// This gives us loginPage, loginModule, authenticatedPage
import{test,expect}from '../fixtures'
import { UsersData } from '../testdata/types';

//import { config } from '../config';
//instead of config get the test data from testdata folder 
// ─── JSON Import ──────────────────────────────────────────────────────────────
// resolveJsonModule: true in tsconfig.json enables this.
// TypeScript treats the JSON as a module and imports it as a typed object.
// Without resolveJsonModule, this import would fail at compile time.
import usersRaw from '../testdata/users.json';

// ─── Type Casting ─────────────────────────────────────────────────────────────
// TypeScript infers the JSON type automatically but it is too loose —
// it infers literal types like "standard_user" instead of string.
// Casting to UsersData gives us the clean interface types we defined.
const usersData = usersRaw as UsersData

// ─── Extract specific data at the top ────────────────────────────────────────
// Do this once at file level, not inside each test.
// Keeps test bodies clean and focused on behavior, not data extraction.
const standardUser = usersData.validUsers[0];
const lockedUser = usersData.lockedUser;
const invalidUsers = usersData.invalidUsers;

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

            // Now using typed data — standardUser.username has IntelliSense
            // If you typo standardUser.usernam → TypeScript errors at compile time
            await loginModule.dologin(standardUser.username,standardUser.password)
        })
        // test.step does NOT receive fixtures as parameters
        // it receives nothing — it is just an async wrapper

        await test.step('verify user is on inventory page', async ()=>{
               await expect(page).toHaveURL(/inventory/);
                // page is accessible here because it is in the outer async scope
            // JavaScript closures give inner functions access to outer variables
        })   
    });

    test('shold show error for locked out user ',async ({loginModule})=>{
        await test.step('Attempt login with locked account ', async ()=>{
            const errorText=await loginModule.attemptInvalidLogin(lockedUser.username, lockedUser.password);
            // expectedError comes from JSON — single source of truth
            // If the error message changes, update JSON only
            expect(errorText).toContain(lockedUser.expectedError);
        })
    })

    // test('should show error invalid credentials ',async ({loginModule })=>{
    //     await test.step('Attempt logging in with invalid password',async ()=>{
    //        const errorText= await loginModule.attemptInvalidLogin
    //             ( 'standard_user',
    //             'wrong_password');
    //         expect(errorText).toContain('Username and password do not match');
    //     });
        
    // })
});

// ─── Data Driven Tests ────────────────────────────────────────────────────────
// This is where the test data layer shows its real power.
// One test definition runs multiple times with different data.
// Without this pattern you would write 3 separate test() blocks
// with nearly identical code.

test.describe('@P1 @Regression invalid login scenarios-data driven',()=>{
    //loop every invalid user scenario defined in json
    for(const invalidUser of invalidUsers){
           // Template literal creates a unique test name for each iteration
        // Report shows: "should reject login - username: , password: "
         test(`should reject login - username: ${invalidUser.username}, password: ${invalidUser.password}`,async ({loginModule})=>{
            await test.step('Attempt login with invalid credentials', async ()=>{
                const errorText = await loginModule.attemptInvalidLogin(
                        invalidUser.username,
                        invalidUser.password)
                expect(errorText).toContain(invalidUser.expectedError);
            });
            
        })
    }
})

    // ─── Using the authenticatedPage fixture ─────────────────────────────────────
    // This test receives a page that is ALREADY logged in.
    // No login code needed in the test body.
    // The fixture handles it transparently.
test.describe('@P0 @Regression Post-Login State', () => {
    test('should be on inventory page after authentication', async ({ authenticatedPage }) => {
        await test.step('Verify authenticated page lands on inventory', async () => {
            await expect(authenticatedPage).toHaveURL(/inventory/);
        });
    });
});

/**
users.json                    types.ts
─────────────────             ─────────────────────
{                             interface UsersData {
  validUsers: [...]    +        validUsers: ValidUser[]
  invalidUsers: [...]           invalidUsers: InvalidUser[]
  lockedUser: {...}             lockedUser: LockedUser
}                             }
        │                             │
        └──────────── cast ───────────┘
                          │
                    usersData (typed)
                          │
              ┌───────────┴───────────┐
        standardUser            invalidUsers[]
              │                       │
        test('happy path')      for loop →
              │                 3 data-driven tests
        loginModule.doLogin()
 */  
    



