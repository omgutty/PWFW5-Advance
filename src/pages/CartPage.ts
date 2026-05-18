import { expect, Page } from '@playwright/test';

export class CartPage {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // ─── LOCATORS ─────────────────────────────────────────────────────────────
    pageTitle = () => this.page.locator('.title');
    cartItems = () => this.page.locator('.cart_item');
    cartItemNames = () => this.page.locator('[data-test="inventory-item-name"]');
    cartItemPrices = () => this.page.locator('[data-test="inventory-item-price"]');
    checkoutButton = () => this.page.locator('[data-test="checkout"]');
    continueShoppingButton = () => this.page.locator('[data-test="continue-shopping"]');

    removeButton = (productName: string) =>
        this.page.locator(`[data-test="remove-${productName}"]`);

    // ─── ACTIONS ──────────────────────────────────────────────────────────────

    async navigate(): Promise<void> {
        await this.page.goto('/cart.html', { waitUntil: 'domcontentloaded' });
    }

    async clickCheckout(): Promise<void> {
        await this.checkoutButton().click();
    }

    async clickContinueShopping(): Promise<void> {
        await this.continueShoppingButton().click();
    }

    async removeItem(productName: string): Promise<void> {
        const slug = productName.toLowerCase().replace(/\s+/g, '-');
        await this.removeButton(slug).click();
    }

    async getCartItemCount(): Promise<number> {
        return await this.cartItems().count();
    }

    async getCartItemNames(): Promise<string[]> {
        return await this.cartItemNames().allTextContents();
    }

    // ─── ASSERTIONS ───────────────────────────────────────────────────────────

    async expectOnCartPage(): Promise<void> {
        await expect(this.page).toHaveURL(/cart/);
    }

    async expectItemInCart(productName: string): Promise<void> {
        await expect(
            this.cartItemNames().filter({ hasText: productName })
        ).toBeVisible();
    }

    async expectCartEmpty(): Promise<void> {
        await expect(this.cartItems()).toHaveCount(0);
    }

    async expectItemCount(count: number): Promise<void> {
        await expect(this.cartItems()).toHaveCount(count);
    }
}