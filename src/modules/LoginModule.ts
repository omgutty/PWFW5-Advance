import { Page } from "@playwright/test";
import { Logger } from '../utils/Logger';
import { LoginPage ,HomePage} from "../pages";

// ─── Why Module Layer Exists ──────────────────────────────────────────────────
// LoginPage knows HOW to interact with the login form.
// LoginModule knows WHAT a "login flow" means in business terms.
//
// Without Module layer, your test would look like:
//   await loginPage.navigate();
//   await loginPage.enterUsername(user);
//   await loginPage.enterPassword(pass);
//   await loginPage.clickLogin();
//   await page.waitForURL('...');
// — duplicated in every test that needs login.
//
// With Module layer:
//   await loginModule.doLogin(user, pass);
// — single call, single source of truth.

export class LoginModule{
    private page:Page;
    private loginPage:LoginPage;
    private logger:Logger;

    constructor(page:Page){
        this.page=page;
        // Composition: LoginModule HAS a LoginPage, it does not EXTEND LoginPage
        // This means tests only see LoginModule's API (doLogin, doLogout, etc.)
        // They cannot call loginPage.clickLogin() directly — correct encapsulation
        this.loginPage= new LoginPage(page);
        this.logger= Logger.create('Login Module')
    }

    async dologin(username:string,password:string):Promise<void>{
        this.logger.testStart('dologin')

        this.logger.step(1, 'Navigate to login page');
        await this.loginPage.navigate()

        this.logger.step(2,`enter username: ${username}`);
        await this.loginPage.enterUsername(username);

        this.logger.step(3, 'Enter password');
        await this.loginPage.enterPassword(password);

        this.logger.step(4, 'Click login button');
        await this.loginPage.clickonLogin();

        this.logger.step(5, 'Wait for navigation to inventory page');
        await this.page.waitForURL('**/inventory.html');

        this.logger.testEnd('doLogin');
    }

    async attemptInvalidLogin(username:string , password:string):Promise<string>{
        this.logger.testStart('attemptInvalidLogin');

        await this.loginPage.navigate();
        await this.loginPage.enterUsername(username);
        await this.loginPage.enterPassword(password);
        await this.loginPage.clickonLogin();

        // We EXPECT an error — wait for it
        await this.loginPage.expectErrorVisible();
        const errorText = await this.loginPage.geterrrormessage();

        this.logger.info(`Login failed with: ${errorText}`);
        this.logger.testEnd('attemptInvalidLogin');

        return errorText;
    }
}