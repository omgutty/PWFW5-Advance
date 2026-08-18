import { Page } from "@playwright/test";
import { InventoryPage,CartPage,CheckoutPage } from "../pages";
import { Logger } from "../utils";


// ─── CheckoutCustomer Interface ───────────────────────────────────────────────
// Defines the shape of customer data needed for checkout
// Keeps the module API clean — one object instead of 3 separate strings

export interface CheckoutCustomer {
    firstName: string;
    lastName: string;
    zipCode: string;
}

// ─── Why CheckoutModule Composes 3 Pages ──────────────────────────────────────
// A real checkout flow touches THREE pages:
//   InventoryPage → add product to cart
//   CartPage      → navigate to checkout
//   CheckoutPage  → fill info, review, confirm
//
// The MODULE owns this multi-page orchestration.
// No individual page class knows about the other pages.
// Only the module connects them into a complete business flow.


export class CheckoutModule{

    private page:Page;
    private inventoryPage:InventoryPage 
    private cartPage: CartPage;
    private checkoutPage: CheckoutPage;
    private logger: Logger;

    constructor (page:Page){
        this.page= page;
        this.inventoryPage= new InventoryPage(page);
        this.cartPage = new CartPage(page);
        this.checkoutPage = new CheckoutPage(page);
        this.logger = Logger.create('CheckoutModule');
    }

        // ─── COMPLETE CHECKOUT FLOW ───────────────────────────────────────────────
    // The full happy path from inventory to confirmation
    // This is what most tests will call

    async completeCheckout(
        productName:string,
        customer:CheckoutCustomer
    ):Promise <void>{
        this.logger.testStart('complete checkout');

        this.logger.step(1,`Add "${productName}" to cart `);
        await this.inventoryPage.navigation();
        await this.inventoryPage.addToCartByName(productName);

        this.logger.step(2, 'Navigate to cart')
        await this.inventoryPage.clickcart();
        await this.cartPage.expectOnCartPage();

        this.logger.step(3, 'Proceed to checkout');
        await this.cartPage.clickCheckout();
        await this.checkoutPage.expecteonStepOne();

        this.logger.step(4, 'Fill customer information');
        await this.checkoutPage.enterfirstName(customer.firstName);
        await this.checkoutPage.enterlastName(customer.lastName);
        await this.checkoutPage.enterZipCode(customer.zipCode);

        this.logger.step(5, 'Continue to order review');
        await this.checkoutPage.clickContinue();
        await this.checkoutPage.expectOnStepTwo();

        this.logger.step(6, 'Confirm order');
        await this.checkoutPage.clickFinish();
        await this.checkoutPage.expectOnConfirmationPage();

        this.logger.testEnd('completeCheckout');

    }


    // ─── CHECKOUT UP TO REVIEW STEP ───────────────────────────────────────────
    // Stops at step 2 without finishing
    // Useful for tests that validate the order summary details

    async proceedToOrderReview(
        productName: string,
        customer: CheckoutCustomer
    ): Promise<void> {
        this.logger.testStart('proceedToOrderReview');

        this.logger.step(1, `Add "${productName}" to cart`);
        await this.inventoryPage.navigation();
        await this.inventoryPage.addToCartByName(productName);

        this.logger.step(2, 'Navigate to cart');
        await this.inventoryPage.clickcart();

        this.logger.step(3, 'Proceed to checkout');
        await this.cartPage.clickCheckout();

        this.logger.step(4, 'Fill customer information');
        await this.checkoutPage.enterfirstName(customer.firstName);
        await this.checkoutPage.enterlastName(customer.lastName);
        await this.checkoutPage.enterZipCode(customer.zipCode);

        this.logger.step(5, 'Continue to review');
        await this.checkoutPage.clickContinue();
        await this.checkoutPage.expectOnStepTwo();

        this.logger.testEnd('proceedToOrderReview');
    }

    // ─── ATTEMPT CHECKOUT WITH MISSING INFO ───────────────────────────────────
    // Navigates to checkout step 1 and tries to continue
    // without filling required fields
    // Returns the error message for assertion

    async attemptCheckoutWithMissingInfo(
        productName: string,
        customer: Partial<CheckoutCustomer>
    ): Promise<string> {
        this.logger.testStart('attemptCheckoutWithMissingInfo');

        this.logger.step(1, `Add "${productName}" to cart`);
        await this.inventoryPage.navigation();
        await this.inventoryPage.addToCartByName(productName);

        this.logger.step(2, 'Navigate to cart and checkout');
        await this.inventoryPage.clickcart();
        await this.cartPage.clickCheckout();

        // Fill only the provided fields
        // Partial<CheckoutCustomer> means any field can be undefined
        if (customer.firstName) {
            await this.checkoutPage.enterfirstName(customer.firstName);
        }
        if (customer.lastName) {
            await this.checkoutPage.enterlastName(customer.lastName);
        }
        if (customer.zipCode) {
            await this.checkoutPage.enterZipCode(customer.zipCode);
        }

        this.logger.step(3, 'Click continue — expecting error');
        await this.checkoutPage.clickContinue();

        const errorText = await this.checkoutPage.getErrorMessage();
        this.logger.info(`Checkout error: ${errorText}`);
        this.logger.testEnd('attemptCheckoutWithMissingInfo');

        return errorText;
    }

    // ─── GET ORDER TOTAL ──────────────────────────────────────────────────────
    // Returns the total amount from order review page
    // Call this after proceedToOrderReview()

    async getOrderTotal(): Promise<number> {
        return await this.checkoutPage.getTotal();
    }

    // ─── GET CONFIRMATION MESSAGE ─────────────────────────────────────────────
    // Returns the confirmation header text
    // Call this after completeCheckout()

    async getConfirmationMessage(): Promise<string> {
        return await this.checkoutPage.getConfirmationHeader();
    }

    // ─── VERIFY ORDER SUMMARY ─────────────────────────────────────────────────
    // Validates the order review page contents

    async verifyOrderSummary(productName: string): Promise<void> {
        this.logger.step(1, 'Verify product in summary');
        await this.checkoutPage.expectProductInSummary(productName);

        this.logger.step(2, 'Verify total calculation is correct');
        await this.checkoutPage.expectTotalCorrect();
    }
}