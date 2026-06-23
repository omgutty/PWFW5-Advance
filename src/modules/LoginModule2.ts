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