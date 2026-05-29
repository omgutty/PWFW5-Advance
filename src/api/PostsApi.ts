import { APIRequestContext } from "@playwright/test";
import {ApiHelper} from "../utils";

// ─── Response Interfaces ──────────────────────────────────────────────────────
// These define the SHAPE of what the API returns.
// Any code consuming PostsApi gets full type safety on response fields.

export interface Post {
    userId: number;
    id: number;
    title: string;
    body: string;
}

export interface CreatePostRequest {
    userId: number;
    title: string;
    body: string;
}


// ─── Why a dedicated API class per domain? ───────────────────────────────────
// PostsApi owns everything related to /posts endpoints.
// UsersApi would own /users endpoints.
// This mirrors how real backend teams organize their services.
// Each API class is independently testable and maintainable.

export class PostsApi {
    private apiHelper: ApiHelper;
    private baseUrl: string;

    constructor (context: APIRequestContext){
        this.apiHelper = new ApiHelper(context);
        this.baseUrl = 'https://jsonplaceholder.typicode.com/posts';
        }

        // ─── GET all posts ────────────────
        async getallposts(): Promise<Post[]> {
            const response=await this.apiHelper.get(`${this.baseUrl}/posts`);
            this.apiHelper.assertStatus(response,200);
            return await this.apiHelper.parseJson<Post[]>(response);
        }
        

        // ─── GET post by ID ───────────────
        async getPostById(id: number):Promise<Post> {
            const response= await this.apiHelper.get(`${this.baseUrl}/posts/${id}`)
            this.apiHelper.assertStatus(response,200);
            return await this.apiHelper.parseJson<Post>(response);
        }

       // ─── GET posts by user ────────────────────────────────────────────────────
    // Demonstrates query parameter usage
    async getPostsByUser(userId:number):Promise<Post[]> {
        const response=await this.apiHelper.get(`${this.baseUrl}/posts1`,{
            params:{
                userId: String(userId)
                // params becomes ?userId=1 in the URL
                // URLSearchParams handles encoding automatically
            }
        })
          this.apiHelper.assertStatus(response,200);
          return await this.apiHelper.parseJson<Post[]>(response);
    }

     // ─── POST create new post ──────────
   
   