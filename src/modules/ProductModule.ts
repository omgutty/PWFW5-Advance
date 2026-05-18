import { Page } from "@playwright/test";
import { Logger } from "../utils";
import { InventoryPage ,CartPage} from "../pages";

// ─── Why ProductModule exists ─────────────────────────────────────────────────
// InventoryPage knows HOW to click add-to-cart
// CartPage knows HOW to read cart contents
// ProductModule knows WHAT "adding a product to cart" means as a FLOW
// It orchestrates across multiple pages to complete a business action

export class ProductModule{
    private page: Page;
    private inventoryPage: InventoryPage;
    private cartPage: CartPage;
    private logger: Logger;

    constructor(page:Page){
        this.page=page;
        this.inventoryPage= new InventoryPage(page);
        this.cartPage= new CartPage(page);
        this.logger= Logger.create('Product module');
    }

     // ─── Add single product to cart ──────────────────────
     async addsinglproducttocar(producname:string):Promise<void>{
        this.logger.testStart('Add signle Product to Cart');

        this.logger.step(1, `Navigate to inventory page`);
        await this.inventoryPage.navigation()

        this.logger.step(2, `Adding the ${producname} to Cart`)
        await this.inventoryPage.addToCardByName(producname);

        this.logger.step(3, 'verify cart count updated');
        const badgecount= await this.inventoryPage.getCartCount()
        this.logger.info(`cart count now is : ${badgecount}`);

        this.logger.testEnd(' add single Product To Cart')
     }


     // ─── Add multiple products to cart ────────
        async addmultipleProducttoCart(productname:string []):Promise<void>{
            this.logger.testStart('Add Multiple product to cart')

            this.logger.step(1,`Navigate to inventory page`)
            await this.inventoryPage.navigation()

            for(let i=0;i<productname.length;i++){
                this.logger.step(i+2,`adding product to cart ${productname[i]}`);
                await this.inventoryPage.addToCardByName(productname[i])
            }
            const cartCount = await this.inventoryPage.getCartCount();
            this.logger.info(`Added ${productname.length} products. Cart count: ${cartCount}`);

            this.logger.testEnd('addMultipleProductsToCart');           
        }
     
     // ─── Go to cart and verify product is there ───────────────────────────────
    async verifyProductInCart(productName: string): Promise<void> {
        this.logger.step(1, 'Navigate to cart');
        await this.cartPage.navigate();

        this.logger.step(2, `Verify "${productName}" is in cart`);
        await this.cartPage.expectItemInCart(productName);

        this.logger.info(`Product "${productName}" confirmed in cart`);
    }

    // ─── Sort products and verify order ───────────────────────────────────────
    async sortProductsBy(option: string): Promise<void> {
        this.logger.testStart('sortProductsBy');

        this.logger.step(1, 'Navigate to inventory page');
        await this.inventoryPage.navigation();

        this.logger.step(2, `Sort by: ${option}`);
        await this.inventoryPage.sortby(option);

        this.logger.testEnd('sortProductsBy');
    }

    // ─── Get all product names ─────────────────────────────────────────────────
    async getAllProductNames(): Promise<string[]> {
        await this.inventoryPage.navigation();
        return await this.inventoryPage.getAllProductNames();
    }

    // ─── Get all product prices ────────────────────────────────────────────────
    async getAllProductPrices(): Promise<number[]> {
        await this.inventoryPage.navigation();
        return await this.inventoryPage.getAllProductPrices();
    }
}