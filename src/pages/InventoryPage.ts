import {Page,expect} from '@playwright/test'

export class InventoryPage{
    private page:Page;

    constructor(page:Page){
        this.page=page;
    }

    // ─── LOCATORS ─────────────────────────────────────────────────────────────
    // Notice the pattern: container first, then items within container
    // This mirrors how a real user reads the page — find the list, then find items

    // Page level
    pagetitle= ()=> this.page.locator('');
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
    addToCardButton=(productName: string)=>{
        this.page.locator(`[data-test="add-to-cart-${productName}"]`);
    }

    removeButton= (productName:string)=>{
        this.page.locator(`[data-test="remove-${productName}"]`);
    }

    productByName = (name: string) =>
        this.page.locator('.inventory_item')
            .filter({ hasText: name });


    //Action methods
    async navigation():Promise <void>{
        this.page.goto('/inventory.html',{waitUntil:'domcontentloaded'});
    }

    async addToCardByName(productname:string):Promise<void>{
        const slug= this.slugify(productname);
        await this.productByName(slug).click();
    }

    async removeFromCartByName(productName: string): Promise<void> {
        const slug = this.slugify(productName);
        
    }





     // ─── PRIVATE HELPERS ──────────────────────────────────────────────────────
    // Private because this is an implementation detail
    // Consumers call addToCartByName('Sauce Labs Backpack')
    // They do not need to know about slugification

    private slugify(name: string): string {
        // "Sauce Labs Backpack" → "sauce-labs-backpack"
        return name.toLowerCase().replace(/\s+/g, '-');
    }


}