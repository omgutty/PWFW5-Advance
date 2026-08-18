import { Page } from "@playwright/test";
import { Logger } from "../utils";
import { SignInPage } from "../pages";

export class SignInModule {
    private page:Page;
    private siginpage:SignInPage;
    private logger:Logger;

    constructor (page:Page){
        this.page= page;
        this.siginpage= new SignInPage(page);
        this.logger= Logger.create('Login Module')
    }

    async dologin(username:string,password:string):Promise<void>{
        this.logger.testStart('dologin');

        this.logger.step(1,'Navigate to Sign in page');
        await this.siginpage.navigate()
    }
}