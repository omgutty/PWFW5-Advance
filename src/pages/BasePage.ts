import { Page, Locator, expect } from "@playwright/test";

// Already have this — click opens new tab, returns new Page

export abstract class BasePage {
    // protected — subclasses (LoginPage, DashboardPage etc.) can access this.page
  // private would block child classes from using it
  // public would expose it to tests — we never want that
  protected readonly page: Page;

  constructor (page:Page){
    this.page= page;
    }

  async goto(path: string): Promise<void> {
    await this.page.goto(path);
  }

    // ─── Text utilities ─────────────

    // Get visible text from any element and return it
   async gettext(locator:Locator):Promise<string>{
    return (await (locator.innerText())).trim()
   }

   // Get all texts from a list of elements — useful for table rows
   async getalltext(locator:Locator):Promise<string[]>{
    return await locator.allInnerTexts();
   }

   // Get value from input field
   async getinputvalue(locator:Locator):Promise<string>{
    return await locator.inputValue();
   }


}


