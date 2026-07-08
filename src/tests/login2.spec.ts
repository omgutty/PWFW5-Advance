import {test, expect} from '../fixtures';
import { UsersData } from '../testdata/types';

import userraw from '../testdata/users.json';


const usersData= userraw as UsersData;

const standarduser=usersData.validUsers[0];

test.describe ('P0 Smoke Login Feature ',  ()=>{

     test("should login with valid credentials", async ({loginModule2, page})=>{

        await test.step("Perform login with valid credentials",async ()=>{
            await loginModule2.dologin(standarduser.username, standarduser.password);
        })
        await test.step('verify user navigated to inventorypage', async ()=>{
            await expect(page).toHaveURL(/inventory/);
        })
    })
})

