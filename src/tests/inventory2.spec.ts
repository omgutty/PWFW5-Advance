import { test, expect } from '../fixtures';
import { ProductsData } from '../testdata/types';
import { UsersData } from '../testdata/types';
import productsRaw from '../testdata/products.json';
import usersRaw from '../testdata/users.json';

const productsData = productsRaw as ProductsData;
const usersData = usersRaw as UsersData;

const standardUser = usersData.validUsers[0];
const firstProduct = productsData.products[0];
const secondProduct = productsData.products[1];

// ─── beforeEach ───────────────────────────────────────────────────────────────
// Every test in this describe block needs to be logged in first
// beforeEach runs before EACH test — not once for all tests
// If you need it once for all tests → use beforeAll
// Here we use beforeEach because each test gets a fresh page context
 
test.describe('@P0 @Smoke Inventory Feature', () => {

    test.beforeEach(async ({ loginModule }) => {
        // Login before every test in this describe block
        // loginModule is injected by fixture — no manual instantiation 
        await loginModule.dologin(standardUser.username, standardUser.password);
    });


    test('should display inventory page after login', async ({ inventoryPage }) => {
        await test.step('Verify inventory page is displayed', async () => {
            await inventoryPage.expectOnInventoryPage();
            await inventoryPage.expectProductListVisible();
        });

        await test.step('Verify page title is correct', async () => {
            const title = await inventoryPage.getPageTitle();
            expect(title).toBe('Products');
        });
    });

    test('should add single product to cart', async ({ productModule, inventoryPage }) => {
        await test.step(`Add "${firstProduct.name}" to cart`, async () => {
            await productModule.addsinglproducttocar(firstProduct.name);
        });

        await test.step('Verify cart count is 1', async () => {
            await inventoryPage.expectCartCount(1);
        });
    });

    test('should add multiple products to cart', async ({ productModule, inventoryPage }) => {
        const productNames = [firstProduct.name, secondProduct.name];

        await test.step('Add two products to cart', async () => {
            await productModule.addmultipleProducttoCart(productNames);
        });

        await test.step('Verify cart count is 2', async () => {
            await inventoryPage.expectCartCount(2);
        });
    });

    test('should verify product appears in cart page', async ({ productModule }) => {
        await test.step(`Add "${firstProduct.name}" to cart`, async () => {
            await productModule.addsinglproducttocar(firstProduct.name);
        });

        await test.step('Navigate to cart and verify product', async () => {
            await productModule.verifyProductInCart(firstProduct.name);
        });
    });

});

// ─── Sorting Tests ─────────────────────────────────────────────────────────────
// Separate describe block — these tests focus on sort functionality
// Still need login so they have their own beforeEach
//comments udpated

test.describe('@P1 @Regression Inventory Sorting', () => {

    test.beforeEach(async ({ loginModule }) => {
        await loginModule.dologin(standardUser.username, standardUser.password);
    });

    test('should sort products by name A to Z', async ({ inventoryPage }) => {
        await test.step('Apply A to Z sort', async () => {
            await inventoryPage.sortby('Name (A to Z)');
        });

        await test.step('Verify products are sorted alphabetically', async () => {
            await inventoryPage.expectSortedByNameAscending();
        });
    });

    test('should sort products by price low to high', async ({ inventoryPage }) => {
        await test.step('Apply price low to high sort', async () => {
            await inventoryPage.sortby('Price (low to high)');
        });

        await test.step('Verify products are sorted by price ascending', async () => {
            await inventoryPage.expectSortedByPriceLowToHigh();
        });
    });

    // ─── Data driven sort tests ────────────────────────────────────────────────
    for (const sortOption of productsData.sortOptions) {
        test(`should apply sort option: "${sortOption}"`, async ({ inventoryPage }) => {
            await test.step(`Select sort option: ${sortOption}`, async () => {
                await inventoryPage.sortby(sortOption);
            });

            await test.step('Verify dropdown shows selected option', async () => {
                await expect(inventoryPage.sortDropdown()).toHaveValue(
                    getSortValue(sortOption)
                );
            });
        });
    }
}


);
// ─── Helper function ──────────────────────────────────────────────────────────
// SauceDemo sort dropdown uses value attributes not labels
// This maps human-readable labels to their DOM value attributes
function getSortValue(label: string): string {
    const map: Record<string, string> = {
        'Name (A to Z)': 'az',
        'Name (Z to A)': 'za',
        'Price (low to high)': 'lohi',
        'Price (high to low)': 'hilo',
    };
    return map[label] ?? 'az';
}