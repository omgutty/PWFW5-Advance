import { test, expect } from '../fixtures';
import { UsersData, ProductsData } from '../testdata/types';
import { CheckoutCustomer } from '../modules';
import usersRaw from '../testdata/users.json';
import productsRaw from '../testdata/products.json';

const usersData = usersRaw as UsersData;
const productsData = productsRaw as ProductsData;

// ─── Extract test data at file level ──────────────────────────────────────────
const standardUser = usersData.validUsers[0];
const firstProduct = productsData.products[0];
const secondProduct = productsData.products[1];
const validCustomer = usersData.checkoutCustomers[0];
const invalidCustomers = usersData.checkoutCustomers.filter(
    c => c.scenario !== 'valid'
);

// ─── Build typed customer object from JSON ────────────────────────────────────
const checkoutCustomer: CheckoutCustomer = {
    firstName: validCustomer.firstName,
    lastName: validCustomer.lastName,
    zipCode: validCustomer.zipCode,
};

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 1 — Happy Path (P0 Smoke)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('@P0 @Smoke Checkout — Happy Path', () => {

    test.beforeEach(async ({ loginModule }) => {
        await loginModule.dologin(
            standardUser.username,
            standardUser.password
        );
    });

    test('should complete full checkout flow successfully',
        async ({ checkoutModule }) => {

            await test.step('Complete checkout with valid data', async () => {
                await checkoutModule.completeCheckout(
                    firstProduct.name,
                    checkoutCustomer
                );
            });

            await test.step('Verify confirmation message', async () => {
                const message = await checkoutModule.getConfirmationMessage();
                expect(message).toContain('Thank you for your order');
            });
        }
    );

    test('should display correct product in order summary',
        async ({ checkoutModule, checkoutPage }) => {

            await test.step('Proceed to order review', async () => {
                await checkoutModule.proceedToOrderReview(
                    firstProduct.name,
                    checkoutCustomer
                );
            });

            await test.step('Verify product appears in summary', async () => {
                await checkoutPage.expectProductInSummary(firstProduct.name);
            });
        }
    );

    test('should calculate correct order total',
        async ({ checkoutModule, checkoutPage }) => {

            await test.step('Proceed to order review', async () => {
                await checkoutModule.proceedToOrderReview(
                    firstProduct.name,
                    checkoutCustomer
                );
            });

            await test.step('Verify item total + tax = grand total', async () => {
                await checkoutPage.expectTotalCorrect();
            });

            await test.step('Log order amounts', async () => {
                const itemTotal = await checkoutPage.getItemTotal();
                const tax = await checkoutPage.getTax();
                const total = await checkoutPage.getTotal();
                console.log(`Item: $${itemTotal} | Tax: $${tax} | Total: $${total}`);
            });
        }
    );

});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 2 — Error Validation (P1 Regression)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('@P1 @Regression Checkout — Error Validation', () => {

    test.beforeEach(async ({ loginModule }) => {
        await loginModule.dologin(
            standardUser.username,
            standardUser.password
        );
    });

    // ─── Data-driven error tests ───────────────────────────────────────────────
    // Each invalid customer scenario generates one test
    // Test name clearly shows which field is missing

    for (const customer of invalidCustomers) {
        test(`should show error for scenario: ${customer.scenario}`,
            async ({ checkoutModule }) => {

                await test.step(
                    `Attempt checkout with ${customer.scenario}`,
                    async () => {
                        const errorText = await checkoutModule
                            .attemptCheckoutWithMissingInfo(
                                firstProduct.name,
                                {
                                    firstName: customer.firstName || undefined,
                                    lastName: customer.lastName || undefined,
                                    zipCode: customer.zipCode || undefined,
                                }
                            );

                        expect(errorText).toContain(customer.expectedError);
                    }
                );
            }
        );
    }

});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 3 — Multi-Product Checkout (P1 Regression)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('@P1 @Regression Checkout — Multiple Products', () => {

    test.beforeEach(async ({ loginModule }) => {
        await loginModule.dologin(
            standardUser.username,
            standardUser.password
        );
    });

    test('should checkout with multiple products in cart',
        async ({ productModule, checkoutModule, checkoutPage }) => {

            await test.step('Add two products to cart', async () => {
                await productModule.addmultipleProducttoCart([
                    firstProduct.name,
                    secondProduct.name,
                ]);
            });

            await test.step('Navigate to cart', async () => {
                await productModule.verifyProductInCart(firstProduct.name);
            });

            await test.step('Proceed through checkout', async () => {
                // Navigate directly to checkout since cart is already populated
                await checkoutPage.navigateToCheckout();
                await checkoutPage.enterfirstName(checkoutCustomer.firstName);
                await checkoutPage.enterlastName(checkoutCustomer.lastName);
                await checkoutPage.enterZipCode(checkoutCustomer.zipCode);
                await checkoutPage.clickContinue();
                await checkoutPage.expectOnStepTwo();
            });

            await test.step('Verify both products in summary', async () => {
                await checkoutPage.expectProductInSummary(firstProduct.name);
                await checkoutPage.expectProductInSummary(secondProduct.name);
            });

            await test.step('Verify total calculation', async () => {
                await checkoutPage.expectTotalCorrect();
            });

            await test.step('Complete the order', async () => {
                await checkoutPage.clickFinish();
                await checkoutPage.expectOnConfirmationPage();
            });
        }
    );

});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 4 — Navigation and Cancel (P2 Regression)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('@P2 @Regression Checkout — Navigation', () => {

    test.beforeEach(async ({ loginModule }) => {
        await loginModule.dologin(
            standardUser.username,
            standardUser.password
        );
    });

    test('should return to inventory when cancel is clicked on step one',
        async ({ inventoryPage, cartPage, checkoutPage }) => {

            await test.step('Add product and go to cart', async () => {
                await inventoryPage.navigation();
                await inventoryPage.addToCartByName(firstProduct.name);
                await inventoryPage.clickcart();
            });

            await test.step('Proceed to checkout step one', async () => {
                await cartPage.clickCheckout();
                await checkoutPage.expecteonStepOne();
            });

            await test.step('Click cancel', async () => {
                await checkoutPage.clickCancel();
            });

            await test.step('Verify returned to cart', async () => {
                await cartPage.expectOnCartPage();
            });
        }
    );

    test('should go back to products after successful order',
        async ({ checkoutModule, checkoutPage }) => {

            await test.step('Complete full checkout', async () => {
                await checkoutModule.completeCheckout(
                    firstProduct.name,
                    checkoutCustomer
                );
            });

            await test.step('Click back to products', async () => {
                await checkoutPage.clickBackHome();
            });

            await test.step('Verify on inventory page', async () => {
                await expect(checkoutPage['page']).toHaveURL(/inventory/);
            });
        }
    );

});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 5 — Add to Cart and Verify (P0 Smoke)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('@P0 @Smoke Add to Cart Feature', () => {

    test.beforeEach(async ({ loginModule }) => {
        await loginModule.dologin(
            standardUser.username,
            standardUser.password
        );
    });

    test('should add first product to cart and verify it appears in cart',
        async ({ productModule, page }) => {

            await test.step('Add first product to cart', async () => {
                await productModule.addsinglproducttocar(firstProduct.name);
            });

            await test.step('Verify cart badge shows 1 item', async () => {
                await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
            });

            await test.step('Open cart and verify product is displayed', async () => {
                await productModule.verifyProductInCart(firstProduct.name);
            });

            await test.step('Verify on cart page', async () => {
                await expect(page).toHaveURL(/cart/);
            });
        }
    );

});