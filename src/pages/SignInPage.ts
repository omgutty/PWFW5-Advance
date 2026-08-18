import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";


export class SignInPage extends BasePage{

    private usernameInput:Locator;
    private passwordInput:Locator;
    private Loginbutton:Locator;


    constructor (page:Page){
        super(page);
        this.usernameInput=  page.locator('#UserName');
        this.passwordInput= page.locator('#Password');
        this.Loginbutton=  page.getByRole('button', { name: 'Login' })
    }

    usernameInputA= ()=>this.page.locator('#UserName');
    passwordInputA= ()=>this.page.locator('#UserName');
    LoginbuttonA= ()=>this.page.locator('#UserName');

     // ─── ACTIONS 
    async navigate(): Promise<void>{
        await this.page.goto('http://172.23.8.12:8050', {waitUntil:'domcontentloaded'});
        
    }

    async login(username:string, password:string):Promise<void>{
        
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.Loginbutton.click();
    }


}