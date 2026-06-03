import {test,expect} from '../fixtures'
import { DataGenerator } from '../utils'
import { PostsApi,Post } from '../api'


// ─── PATTERN 1: API Setup → UI Validation ────────────────────────────────────
// Create data via API (fast)
// Validate the result via UI (accurate)
// This is the most common hybrid pattern in enterprise frameworks

test.describe('@P0 @Smoke Hybrid - API Setup then UI validation ',()=>{

test('data created via API is accessaible via UI layer', async ({postsApi,apiContext})=>{

    //-- step 1 : 'Create data via API-----'

    await test.step('Create a Post via API', async ()=>{
        const newPost=DataGenerator.randomPost(1);
        const created=await postsApi.createPost(newPost)

         // Validate API creation succeeded
         expect(created.id).toBeDefined();
         expect(created.title).toBe(newPost.title);
        
         // Store for next step
        // In real tests this would be an order ID, user ID etc.
        console.log(`Created post ID: ${created.id}`);
    })
})

})