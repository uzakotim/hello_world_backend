# Postman Testing Guide for Tomatoes API

This guide shows you how to test your deployed Tomatoes API at `https://hello-world-backend-uzakotim.onrender.com` using Postman.

## Quick Start

### Method 1: Import Collection (Recommended)

1. **Import the Collection:**
   - Open Postman
   - Click "Import" in the top left
   - Drag and drop the `postman-collection.json` file from this directory
   - The complete collection will be imported with all endpoints and tests

2. **Run the Collection:**
   - Right-click the imported collection
   - Select "Run collection"
   - Click "Run Tomatoes API - Render" to execute all tests

### Method 2: Manual Setup

1. **Create a New Collection:**
   - Click "New" → "Collection"
   - Name it "Tomatoes API Testing"

2. **Set Base URL Variable:**
   - Go to Collection → Variables
   - Add: `baseUrl` = `https://hello-world-backend-uzakotim.onrender.com`

## Manual Testing Steps

### 1. Test Basic Connectivity

**First, test if your API is accessible:**

```
GET {{baseUrl}}/
```

Expected Response (200):
```json
{
  "message": "Welcome to the Tomatoes API",
  "version": "1.0.0",
  "endpoints": { ... }
}
```

**Health Check:**
```
GET {{baseUrl}}/health
```

Expected Response (200):
```json
{
  "status": "OK",
  "timestamp": "2025-06-16T08:31:46.000Z",
  "uptime": 123.456
}
```

### 2. Test CRUD Operations

**Step 1: Create a Tomato**
```
POST {{baseUrl}}/tomatoes
Content-Type: application/json

Body:
{
  "name": "Cherry Tomato",
  "variety": "Sweet 100",
  "price": 4.99,
  "description": "Small, sweet tomatoes perfect for snacking",
  "inStock": true
}
```

**Step 2: Get All Tomatoes**
```
GET {{baseUrl}}/tomatoes
```

**Step 3: Get Specific Tomato (use ID from Step 1)**
```
GET {{baseUrl}}/tomatoes/{tomato_id}
```

**Step 4: Update the Tomato**
```
PUT {{baseUrl}}/tomatoes/{tomato_id}
Content-Type: application/json

Body:
{
  "price": 5.99,
  "inStock": false
}
```

**Step 5: Delete the Tomato**
```
DELETE {{baseUrl}}/tomatoes/{tomato_id}
```

### 3. Test Search Functions

**Search by Name:**
```
GET {{baseUrl}}/tomatoes/search/name/Cherry Tomato
```

**Search by Variety:**
```
GET {{baseUrl}}/tomatoes/search/variety/Sweet 100
```

### 4. Test Error Handling

**Missing Required Fields:**
```
POST {{baseUrl}}/tomatoes
Content-Type: application/json

Body:
{
  "name": "Incomplete Tomato"
}
```
Expected: 400 Bad Request

**Non-existent Resource:**
```
GET {{baseUrl}}/tomatoes/nonexistent123
```
Expected: 404 Not Found

**Invalid Endpoint:**
```
GET {{baseUrl}}/invalid-endpoint
```
Expected: 404 Not Found

## Advanced Testing Features

### Environment Variables

Set up different environments:

1. **Production Environment:**
   - `baseUrl`: `https://hello-world-backend-uzakotim.onrender.com`

2. **Local Development:**
   - `baseUrl`: `http://localhost:3000`

### Automated Tests

The imported collection includes automated tests that:
- Verify status codes
- Check response structure
- Validate data integrity
- Store IDs for subsequent requests

### Collection Runner

Use Postman's Collection Runner to:
1. Run all tests automatically
2. Generate test reports
3. Export results
4. Set up CI/CD integration

## Common Issues and Solutions

### Issue: CORS Errors
**Solution:** Your API should have CORS enabled. Check if requests work in Postman but fail in browsers.

### Issue: 500 Internal Server Error
**Solution:** Check if:
- Convex database is properly configured
- Environment variables are set correctly
- Server is running and accessible

### Issue: Slow Response Times
**Solution:** 
- Render free tier may have cold starts
- First request might take 10-30 seconds
- Subsequent requests should be faster

### Issue: Connection Timeout
**Solution:**
- Check if the Render URL is correct
- Verify the service is deployed and running
- Try the health endpoint first

## Testing Checklist

- [ ] API root endpoint responds
- [ ] Health check works
- [ ] Can create tomatoes
- [ ] Can retrieve all tomatoes
- [ ] Can get specific tomato by ID
- [ ] Can update tomatoes
- [ ] Can delete tomatoes
- [ ] Search by name works
- [ ] Search by variety works
- [ ] Error handling works (400, 404)
- [ ] Response times are reasonable
- [ ] Data persistence works

## Example Test Scenarios

### Scenario 1: Complete CRUD Workflow
1. Create a new tomato
2. Verify it appears in the list
3. Update its price
4. Confirm the update
5. Delete the tomato
6. Verify it's gone

### Scenario 2: Search and Filter
1. Create multiple tomatoes with different names
2. Search by specific name
3. Verify only matching results return
4. Test search with no results

### Scenario 3: Error Validation
1. Try creating tomato without required fields
2. Try accessing non-existent tomato
3. Try updating with invalid data
4. Verify appropriate error messages

## Tips for Effective Testing

1. **Start Simple:** Begin with basic GET requests
2. **Check Status Codes:** Always verify the HTTP status
3. **Validate Response Structure:** Ensure JSON format is correct
4. **Test Edge Cases:** Empty data, invalid IDs, missing fields
5. **Use Variables:** Store IDs and reuse them in subsequent tests
6. **Monitor Performance:** Check response times
7. **Test Error Scenarios:** Don't just test happy paths

This comprehensive testing approach will help ensure your API is working correctly and ready for production use!

