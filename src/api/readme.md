Test: "User should see order history after placing an order"

Without API layer:
  1. Login via UI         → 3 seconds
  2. Find product via UI  → 2 seconds
  3. Add to cart via UI   → 2 seconds
  4. Checkout via UI      → 5 seconds
  5. THEN test order history

Total setup time: 12 seconds before the actual assertion

With API layer:
  1. Login via API        → 0.3 seconds
  2. Create order via API → 0.3 seconds
  3. THEN test order history via UI

Total setup time: 0.6 seconds before the actual assertion


Pattern 1 — Pure API tests
  Test the API endpoints directly
  No browser involved
  Validates backend behavior

Pattern 2 — API setup + UI validation
  Use API to create test state (login, create data)
  Use UI to verify the result
  Fastest end-to-end tests

Pattern 3 — UI action + API validation
  Use UI to trigger an action
  Use API to verify the backend recorded it correctly
  Validates full stack integration


  SauceDemo does not have a real REST API. For API testing we will use JSONPlaceholder — a free, public REST API used specifically for testing and prototyping. It has users, posts, comments, todos — perfect for demonstrating all HTTP methods.
Base URL: https://jsonplaceholder.typicode.com