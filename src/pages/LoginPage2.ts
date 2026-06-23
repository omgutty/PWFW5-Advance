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