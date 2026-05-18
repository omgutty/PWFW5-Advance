import { Page } from "@playwright/test";
import { Logger } from "../utils";
import { InventoryPage } from "../pages/InventoryPage";
import { CartPage } from "../pages/CartPage";

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
        
     
     // ─── Go to cart and verify product is there ───────


     // ─── Sort products and verify order ──────────────────



     // ─── Get all product names ────────────────────────


     // ─── Get all product prices ───────────────────────
}