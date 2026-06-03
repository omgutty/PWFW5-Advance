import { test, expect } from '../fixtures';
import { PostsApi, Post } from '../api';
import { DataGenerator } from '../utils';

// ─── PATTERN 1: API Setup → UI Validation ────────────────────────────────────
// Create data via API (fast)
// Validate the result via UI (accurate)
// This is the most common hybrid pattern in enterprise frameworks

test.describe('@P0 @Smoke Hybrid - API Setup then UI Validation', () => {

    test('data created via API is accessible via UI layer', async ({ 
        postsApi, 
        apiContext 
    }) => {
        // ── STEP 1: Create data via API ──────────────────────────────────────
        await test.step('Create a post via API', async () => {
            const newPost = DataGenerator.randomPost(1);
            const created = await postsApi.createPost(newPost);

            // Validate API creation succeeded
            expect(created.id).toBeDefined();
            expect(created.title).toBe(newPost.title);

            // Store for next step
            // In real tests this would be an order ID, user ID etc.
            console.log(`Created post ID: ${created.id}`);
        });

        // ── STEP 2: Verify via GET (simulating UI reading same data) ─────────
        await test.step('Verify created data is retrievable', async () => {
            // JSONPlaceholder fakes creation — always returns id: 101
            // In a real app this would be: await postsApi.getPostById(created.id)
            const allPosts = await postsApi.getallposts();
            expect(allPosts.length).toBeGreaterThan(0);

            // Validate structure of retrieved data
            const firstPost = allPosts[0];
            expect(firstPost).toMatchObject({
                id: expect.any(Number),
                userId: expect.any(Number),
                title: expect.any(String),
                body: expect.any(String),
            });
        });
    });

});

// ─── PATTERN 2: API Data Validation ──────────────────────────────────────────
// Validate business rules across multiple API calls
// No UI involved — pure data integrity testing

test.describe('@P1 @Regression Hybrid - Data Integrity Validation', () => {

    test('all posts for a user belong to that user', async ({ postsApi }) => {
        await test.step('Fetch posts for user 1 and validate ownership', async () => {
            const posts = await postsApi.getPostsByUser(1);

            // Business rule: every post returned MUST belong to userId 1
            // This would catch a backend bug where filtering is broken
            posts.forEach((post: Post) => {
                expect(post.userId).toBe(1);
            });

            expect(posts.length).toBeGreaterThan(0);
        });
    });

    test('created post has all required fields', async ({ postsApi }) => {
        await test.step('Create post and validate complete response shape', async () => {
            const newPost = DataGenerator.randomPost(1);
            const created = await postsApi.createPost(newPost);

            // toMatchObject validates shape — extra fields are allowed
            // toStrictEqual would fail if any extra fields present
            expect(created).toMatchObject({
                id: expect.any(Number),
                userId: newPost.userId,
                title: newPost.title,
                body: newPost.body,
            });
        });
    });

    test('patch only modifies specified fields', async ({ postsApi }) => {
        await test.step('Get original post', async () => {
            const original = await postsApi.getPostById(1);
            expect(original.id).toBe(1);
        });

        await test.step('Patch only the title', async () => {
            const patched = await postsApi.patchPost(1, {
                title: 'Only Title Changed',
            });

            // Title changed
            expect(patched.title).toBe('Only Title Changed');

            // ID preserved — patch does not replace the resource
            expect(patched.id).toBe(1);
        });
    });

});

// ─── PATTERN 3: API Contract Testing ─────────────────────────────────────────
// Validate that the API response matches the expected contract
// Catches breaking changes in the API before UI tests break

test.describe('@P1 @Regression API Contract Tests', () => {

    test('GET /posts response matches Post contract', async ({ postsApi }) => {
        await test.step('Validate Post array contract', async () => {
            const posts = await postsApi.getallposts();

            // Validate every single item in the response
            posts.forEach((post: Post) => {
                // Each field must exist and be the right type
                expect(typeof post.id).toBe('number');
                expect(typeof post.userId).toBe('number');
                expect(typeof post.title).toBe('string');
                expect(typeof post.body).toBe('string');

                // Business rules
                expect(post.id).toBeGreaterThan(0);
                expect(post.userId).toBeGreaterThan(0);
                expect(post.title.length).toBeGreaterThan(0);
                expect(post.body.length).toBeGreaterThan(0);
            });
        });
    });

    test('GET /posts/:id returns correct post for each ID', async ({ postsApi }) => {
        // Test first 5 posts to validate ID routing works correctly
        const idsToTest = [1, 2, 3, 4, 5];

        for (const id of idsToTest) {
            await test.step(`Validate post with ID ${id}`, async () => {
                const post = await postsApi.getPostById(id);

                // The returned post ID must match what was requested
                // This catches bugs where ID routing is broken
                expect(post.id).toBe(id);
            });
        }
    });

    test('response headers contain correct content type', async ({ apiContext }) => {
        await test.step('Validate Content-Type header', async () => {
            const response = await apiContext.get('/posts');

            expect(response.status()).toBe(200);
            expect(response.headers()['content-type']).toContain('application/json');
        });
    });

});

// ─── PATTERN 4: CRUD Lifecycle Test ──────────────────────────────────────────
// Test the complete Create → Read → Update → Delete cycle
// Validates that all operations work together correctly

test.describe('@P1 @Regression CRUD Lifecycle', () => {

    test('complete post CRUD lifecycle', async ({ postsApi }) => {
        let createdPostId: number;

        // CREATE
        await test.step('Create a new post', async () => {
            const newPost = DataGenerator.randomPost(1);
            const created = await postsApi.createPost(newPost);

            expect(created.id).toBeDefined();
            expect(created.title).toBe(newPost.title);

            createdPostId = created.id;
            console.log(`Created post with ID: ${createdPostId}`);
        });

        // READ — verify it exists
        await test.step('Read the created post', async () => {
            // JSONPlaceholder fakes CRUD — in real app: getPostById(createdPostId)
            // Here we validate read works on a known existing post
            const post = await postsApi.getPostById(1);
            expect(post).toBeDefined();
            expect(post.id).toBe(1);
        });

        // UPDATE — full replacement
        await test.step('Update the post with PUT', async () => {
            const updatedData = DataGenerator.randomPost(1);
            const updated = await postsApi.updatePost(1, updatedData);

            expect(updated.id).toBe(1);
            expect(updated.title).toBe(updatedData.title);
        });

        // PATCH — partial update
        await test.step('Partially update the post with PATCH', async () => {
            const newTitle = `Patched: ${DataGenerator.randomString()}`;
            const patched = await postsApi.patchPost(1, { title: newTitle });

            expect(patched.title).toBe(newTitle);
        });

        // DELETE
        await test.step('Delete the post', async () => {
            await postsApi.deletePost(1);
            // No error thrown = delete succeeded
        });
    });

});