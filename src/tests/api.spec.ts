import { test, expect } from '../fixtures';
import { Post } from '../api';

// ─── Pure API Tests ───────────────────────────────────────────────────────────
// No browser. No page. Pure HTTP.
// Notice: fixtures used are postsApi and apiContext only.
// These tests run in milliseconds.

test.describe('@P0 @Smoke Posts API - GET Operations', () => {

    test('should fetch all posts successfully', async ({ postsApi }) => {
        await test.step('Call GET /posts and validate response', async () => {
            const posts = await postsApi.getallposts();

            // JSONPlaceholder always returns 100 posts
            expect(posts).toHaveLength(100);

            // Validate first post structure matches our Post interface
            expect(posts[0]).toHaveProperty('id');
            expect(posts[0]).toHaveProperty('userId');
            expect(posts[0]).toHaveProperty('title');
            expect(posts[0]).toHaveProperty('body');
        });
    });

    test('should fetch single post by ID', async ({ postsApi }) => {
        await test.step('Fetch post with ID 1', async () => {
            const post = await postsApi.getPostById(1);

            expect(post.id).toBe(1);
            expect(post.userId).toBe(1);
            expect(post.title).toBeTruthy();
            expect(post.body).toBeTruthy();
        });
    });

    test('should fetch posts filtered by userId', async ({ postsApi }) => {
        await test.step('Get all posts for user 1', async () => {
            const posts = await postsApi.getPostsByUser(1);

            // All returned posts must belong to userId 1
            expect(posts.length).toBeGreaterThan(0);
            posts.forEach(post => {
                expect(post.userId).toBe(1);
            });
        });
    });

});

test.describe('@P1 @Regression Posts API - Write Operations', () => {

    test('should create a new post', async ({ postsApi }) => {
        await test.step('POST new post and validate response', async () => {
            const newPost = {
                userId: 1,
                title: 'My Automation Test Post',
                body: 'This post was created by Playwright API test',
            };

            const created = await postsApi.createPost(newPost);

            // JSONPlaceholder returns the created object with a generated id
            expect(created.id).toBeDefined();
            expect(created.title).toBe(newPost.title);
            expect(created.body).toBe(newPost.body);
            expect(created.userId).toBe(newPost.userId);
        });
    });

    test('should update an existing post', async ({ postsApi }) => {
        await test.step('PUT full update to post 1', async () => {
            const updatedData = {
                userId: 1,
                title: 'Updated Title',
                body: 'Updated body content',
            };

            const updated = await postsApi.updatePost(1, updatedData);

            expect(updated.id).toBe(1);
            expect(updated.title).toBe('Updated Title');
        });
    });

    test('should partially update a post title', async ({ postsApi }) => {
        await test.step('PATCH only the title of post 1', async () => {
            const patched = await postsApi.patchPost(1, {
                title: 'Patched Title Only',
            });

            // Only title changed, id preserved
            expect(patched.id).toBe(1);
            expect(patched.title).toBe('Patched Title Only');
        });
    });

    test('should delete a post', async ({ postsApi }) => {
        await test.step('DELETE post 1 and verify no error', async () => {
            // deletePost throws if status is not 200
            // If this line completes without throwing, delete succeeded
            await postsApi.deletePost(1);
        });
    });

});

// ─── Raw API Context Tests ────────────────────────────────────────────────────
// Sometimes you need direct access to the raw APIRequestContext
// for scenarios not covered by your API client classes
// This shows how to use apiContext directly

test.describe('@P1 @Regression Raw API Context Usage', () => {

    test('should validate response headers', async ({ apiContext }) => {
        await test.step('Check content-type header on posts response', async () => {
            const response = await apiContext.get('/posts/1');

            expect(response.status()).toBe(200);

            // Header validation — useful for security and contract testing
            const contentType = response.headers()['content-type'];
            expect(contentType).toContain('application/json');
        });
    });

    test('should handle non-existent resource', async ({ apiContext }) => {
        await test.step('GET post with ID 99999 returns 404', async () => {
            const response = await apiContext.get('/posts/99999');

            // JSONPlaceholder returns 404 for non-existent IDs
            expect(response.status()).toBe(404);
        });
    });

});

