import {test, expect} from '../fixtures';
import { UsersData } from '../testdata/types';

import userraw from '../testdata/users.json';


const UsersData= userraw as UsersData;

const standarduser=UsersData.validUsers[0];

test.describe ('P0 Smoke Login Feature ', async ()=>{

     test("should login with valid credentials", async ({LoginModule2, page})=>{

        await test.step("Perform login with valid credentials",async ()=>{
            await LoginModule2.dologin(standarduser.username, standarduser.password);
        })
        await test.step('verify user navigated to inventorypage', async ()=>{
            await expect(page).toHaveURL(/inventory/);
        })
    })
})

