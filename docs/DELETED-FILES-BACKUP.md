# Backup — Deleted Practice Files

> **Date:** 2026-08-18
> **Purpose:** These files were deleted as practice/unused code per user request.
> **How to restore:** Copy the file contents below back to the exact paths listed, and re-add the exports/fixture references noted at the bottom.

---

## Deleted Files

### 1. `src/pages/LoginPage2.ts`

```typescript
import { Page ,expect} from "@playwright/test";

export class LoginPage2{
    private page:Page;

    constructor (page:Page){
        this.page= page;
    }



    usernameinput=()=>this.page.locator('#user-name');
    passwordinput=()=>this.page.locator('[data-test="password"]')
    Loginbutton = ()=>{return this.page.getByRole('button', {name:'Login'})};


    /**
     * Navigate to the login page
     */
    async navigate():Promise<void>{
        await this. page.goto('/',{waitUntil:"domcontentloaded"})
    }

    /**
     * Entering user name 
     */
    async enterusername(username:string ):Promise<void>{
        await this.usernameinput().fill(username);
    }

    /**
     * Entering password
     */
    async enterpassword(password:string){
        await this.passwordinput().fill(password);
    }

    async clickonLoginbutton():Promise<void>{
        await this.Loginbutton().click();
    }
    


}
```

---

### 2. `src/modules/LoginModule2.ts`

```typescript
import { Page } from "@playwright/test";
import { Logger } from "../utils";
import { LoginPage2 } from "../pages/LoginPage2";




export class LoginModule2{
    private page:Page;
    private logger:Logger;
    private loginpage:LoginPage2

    constructor (page:Page){
        this.page=page;
        this.logger= Logger.create("Loginpage");
        this.loginpage= new LoginPage2(page);
    }

    async dologin(username:string, password:string):Promise<void>{
        this.logger.testStart('dologin')

        this.logger.step(1. , 'Navigate to login page');
        await  this.loginpage.navigate();

        this.logger.step(2. ,`Username entering ${username} `);
        await this.loginpage.enterusername(username);

        this.logger.step(3. ,`password entering`);
        await this.loginpage.enterpassword(password);

        this.logger.step(4. ,`clicking on the Login button`);
        await this.loginpage.clickonLoginbutton();

        this.logger.step(5. ,`wait for inventory page to load `);
        await this.page.waitForURL('**/inventory.html');

         this.logger.testEnd('doLogin');

    }

}
```

---

### 3. `src/pages/HomePage.ts`

```typescript
import { expect, Page } from '@playwright/test';

export class HomePage {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }
}
```

---

### 4. `src/tests/login2.spec.ts`

```typescript
import {test, expect} from '../fixtures';
import { UsersData } from '../testdata/types';

import userraw from '../testdata/users.json';


const usersData= userraw as UsersData;

const standarduser=usersData.validUsers[0];

test.describe ('P0 Smoke Login Feature ',  ()=>{

     test("should login with valid credentials", async ({loginModule2, page})=>{

        await test.step("Perform login with valid credentials",async ()=>{
            await loginModule2.dologin(standarduser.username, standarduser.password);
        })
        await test.step('verify user navigated to inventorypage', async ()=>{
            await expect(page).toHaveURL(/inventory/);
        })
    })


})
```

---

## Related Edits Made (for restoration)

### `src/pages/index.ts`
Removed lines:
```typescript
export { HomePage } from './HomePage';
export {LoginPage2} from './LoginPage2'
```

### `src/modules/index.ts`
Removed line:
```typescript
export {LoginModule2} from './LoginModule2'
```

### `src/fixtures/index.ts`
Removed:
- `import { LoginModule2 } from '../modules/LoginModule2';`
- `loginModule2:LoginModule2;` from `TestFixtures` type
- The `loginModule2` fixture implementation

### `src/modules/LoginModule.ts`
Changed import from:
```typescript
import { LoginPage ,HomePage} from "../pages";
```
to:
```typescript
import { LoginPage } from "../pages";
```

---

## NOT Deleted (kept intentionally)

- `src/pages/BasePage.ts` — separate project
- `src/pages/SignInPage.ts` — separate project
- `src/modules/SignInModule.ts` — separate project
- `src/api/` — all API files
- Everything else in `src/`
