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

-------------------------------------------------------
 Hybrid Tests: API + UI Combined

Why Hybrid Tests Exist
You now have two separate test layers:
UI Tests   → slow setup, tests real user experience
API Tests  → fast setup, tests backend behavior
Hybrid tests combine both strategically:
Use API for everything that is NOT what you are testing
Use UI for exactly what you ARE testing
Real example:
Test: "User with 3 items in cart sees correct total"

Pure UI approach:
  Login via UI          → 3 seconds
  Search product 1      → 2 seconds
  Add product 1         → 1 second
  Search product 2      → 2 seconds
  Add product 2         → 1 second
  Search product 3      → 2 seconds
  Add product 3         → 1 second
  Navigate to cart      → 1 second
  ASSERT total          ← this is what you are testing
  Total setup: 13 seconds

Hybrid approach:
  Login via API         → 0.3 seconds
  Add 3 items via API   → 0.3 seconds each
  Navigate to cart UI   → 1 second
  ASSERT total          ← this is what you are testing
  Total setup: 2 seconds
Same assertion. 6x faster. This is why enterprise frameworks always have a hybrid layer.
-------------------------------------

The Simple Rule to Remember
Testing UI behavior, already logged in via UI
→ use page.request
→ shares session automatically
→ no extra auth needed

Testing API behavior only, no browser needed
→ use request.newContext() (our apiContext fixture)
→ completely independent
→ must handle auth yourself if API requires it