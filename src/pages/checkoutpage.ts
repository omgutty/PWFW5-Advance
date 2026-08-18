import { Expect, Page } from "@playwright/test";
import { SelfHealingLocator  } from "../utils";

// ─── Why CheckoutPage spans multiple URLs ─────────────────────────────────────
// SauceDemo checkout has TWO step pages:
//   Step 1: /checkout-step-one.html  → customer info form
//   Step 2: /checkout-step-two.html  → order review
//   Complete: /checkout-complete.html → confirmation
//
// We keep all checkout-related locators in ONE page class because
// they all belong to the same BUSINESS DOMAIN (checkout process).
// Splitting into CheckoutStep1Page and CheckoutStep2Page would be
// over-engineering for a 2-step flow.

export class CheckoutPage{
    private page: Page;
    private healer:SelfHealingLocator;

    constructor (page:Page){
        this.page= page;
        this.healer= new SelfHealingLocator(page)

    }


    //----- LOCATORS - Your Cart 
    //if product added to cart
    remove= ()=>this.page.getByRole('button', { name: 'Remove' })
    continuewShopping= ()=>this.page.getByRole('button', { name: 'Continue Shopping' });
    checkoutbutton= ()=>this.page.getByRole('button', { name: 'Checkout' })
    cartitemtitle=()=>this.page.locator("#item_4_title_link")

    // ─── LOCATORS — Step 1 (Customer Information) ─────────────────────────────

    firstNameInput = () => this.page.locator('[data-test="firstName"]');
    lastNameInput = () => this.page.locator('[data-test="lastName"]');
    zipCodeInput = () => this.page.locator('[data-test="postalCode"]');
    continueButton = () => this.page.locator('[data-test="continue"]');
    cancelButton = () => this.page.locator('[data-test="cancel"]');
    errorMessage = () => this.page.locator('[data-test="error"]')

     // ─── LOCATORS — Step 2 (Order Review) ────────────────────────────────────

    finishButton = () => this.page.locator('[data-test="finish"]');
    summaryItemNames = () => this.page.locator('.inventory_item_name');
    summaryItemPrices = () => this.page.locator('.inventory_item_price');
    itemTotalLabel = () => this.page.locator('.summary_subtotal_label');
    taxLabel = () => this.page.locator('.summary_tax_label');
    totalLabel = () => this.page.locator('.summary_total_label');
    paymentInfo = () => this.page.locator('[data-test="payment-info-value"]');
    shippingInfo = () => this.page.locator('[data-test="shipping-info-value"]');

    // ─── LOCATORS — Confirmation Page ─────────────────────────────────────────

    confirmationHeader = () => this.page.locator('[data-test="complete-header"]');
    confirmationText = () => this.page.locator('[data-test="complete-text"]');
    backHomeButton = () => this.page.locator('[data-test="back-to-products"]');


     // ─── Self-Healing Selector Definitions ─────────────────────────────

    private selectors= {
        firstName:[
             '[data-test="firstName"]',
            '#first-name',
            'input[placeholder*="First"]',
            'input[name="firstName"]',
        ],
        lastName: [
            '[data-test="lastName"]',
            '#last-name',
            'input[placeholder*="Last"]',
            'input[name="lastName"]',
        ],
        zipCode: [
            '[data-test="postalCode"]',
            '#postal-code',
            'input[placeholder*="Zip"]',
            'input[name="postalCode"]',
        ],
        continueButton: [
            '[data-test="continue"]',
            'input[value="Continue"]',
            'button:has-text("Continue")',
        ],
        finishButton: [
            '[data-test="finish"]',
            'button:has-text("Finish")',
            '.btn_action:has-text("Finish")',
        ],
    };

    //-------Action step 1------------
     


}