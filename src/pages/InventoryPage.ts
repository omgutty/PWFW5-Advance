import {Page,expect} from '@playwright/test'

export class InventoryPage{
    private page:Page;

    constructor(page:Page){
        this.page=page;
    }

    // ─── LOCATORS ─────────────────────────────────────────────────────────────
    // Notice the pattern: container first, then items within container
    // This mirrors how a real user reads the page — find the list, then find items

    // ─── LOCATOR NAMING RULES ─────────────────────────────────────────────────────
// data-test attribute locators → pass slugified name: this.slugify(productName)
// visible text locators (hasText, filter) → pass original name as-is

    // Page level
    pagetitle= ()=> this.page.locator('.title');
    productList = () => this.page.locator('.inventory_list');
    sortDropdown = () => this.page.locator('[data-test="product-sort-container"]');
    cartIcon = () => this.page.locator('[data-test="shopping-cart-link"]');
    cartBadge = () => this.page.locator('[data-test="shopping-cart-badge"]');

    // Product items — these return COLLECTIONS (multiple elements)
    // We use .nth(index) or .filter() to target specific items
    allProductNames = () => this.page.locator('[data-test="inventory-item-name"]');
    allProductPrices = () => this.page.locator('[data-test="inventory-item-price"]');
    allAddToCartButtons = () => this.page.locator('[data-test^="add-to-cart"]');
    allRemoveButtons = () => this.page.locator('[data-test^="remove"]');

    // ─── Dynamic Locators ─────────────────────────────────────────────────────
    // These accept parameters to target a SPECIFIC product
    // This is the correct pattern for list-based pages
    addToCardButton=(productName: string)=> this.page.locator(`[data-test="add-to-cart-${productName}"]`);
    
    removeButton= (productName:string)=> this.page.locator(`[data-test="remove-${productName}"]`);
    /**
     *  =>  expression          returns the expression automatically
        => { expression }       returns void unless you write return
        => { return expression} returns the expression explicitly
     */

    productByName = (name: string) =>
        this.page.locator('.inventory_item')
            .filter({ hasText: name });


    //Action methods
    async navigation():Promise <void>{
        this.page.goto('/inventory.html',{waitUntil:'domcontentloaded'});
    }

    async addToCardByName(productname:string):Promise<void>{
        const slug= this.slugify(productname);
        await this.addToCardButton(slug).click();
       //await this.productByName(slug).click();
    }

    async removeFromCartByName(productName: string): Promise<void> {
        const slug = this.slugify(productName);
        await this.removeButton(slug).click();
    }

    async sortby(option: string):Promise<void>{
        await this.sortDropdown().selectOption({label:option});
    }

    async clickcart():Promise<void>{
        await this.cartIcon().click();
    }

    async clickProductByName(productname:string):Promise <void>{
        await this.allProductNames().filter({hasText:productname}).click();
    }

    async getCartCount(){
             // Cart badge only appears when items are in cart
        // If badge is not visible, cart is empty → return 0
        const isvisible=await this.cartBadge().isVisible();
        if(!isvisible) return 0;
        const text=await this.cartBadge().textContent();
        return parseInt(text ?? '0', 10);
    }

    async getAllProductNames(): Promise<string[]> {
        // returns array of all visible product name strings
        return await this.allProductNames().allTextContents();
    }

    async getAllProductPrices(): Promise<number[]> {
        const priceTexts = await this.allProductPrices().allTextContents();
        // Price text is "$29.99" — strip $ and parse to number
        return priceTexts.map(p => parseFloat(p.replace('$', '')));
    }

    async getPageTitle(): Promise<string> {
        return (await this.pagetitle().textContent()) ?? '';
    }



     // ─── PRIVATE HELPERS ──────────────────────────────────────────────────────
    // Private because this is an implementation detail
    // Consumers call addToCartByName('Sauce Labs Backpack')
    // They do not need to know about slugification

    private slugify(name: string): string {
        // "Sauce Labs Backpack" → "sauce-labs-backpack"
        return name.toLowerCase().replace(/\s+/g, '-');
    }

     // ─── ASSERTIONS ───────────────────────────────────────────────────────────

    async expectOnInventoryPage(): Promise<void> {
        await expect(this.page).toHaveURL(/inventory/);
        await expect(this.pagetitle()).toBeVisible();
    }

    async expectProductListVisible(): Promise<void> {
        await expect(this.productList()).toBeVisible();
    }

    async expectCartCount(count: number): Promise<void> {
        if (count === 0) {
            await expect(this.cartBadge()).not.toBeVisible();
        } else {
            await expect(this.cartBadge()).toHaveText(String(count));
        }
    }

    async expectProductVisible(productName: string): Promise<void> {
        await expect(this.productByName(productName)).toBeVisible();
    }

    async expectSortedByNameAscending(): Promise<void> {
        const names = await this.getAllProductNames();
        const sorted = [...names].sort();
        // Compare actual order to expected sorted order
        expect(names).toEqual(sorted);
    }

    async expectSortedByPriceLowToHigh(): Promise<void> {
        const prices = await this.getAllProductPrices();
        const sorted = [...prices].sort((a, b) => a - b);
        expect(prices).toEqual(sorted);
    }
}

