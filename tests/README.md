# Test Documentation

This directory contains comprehensive tests for the Tomatoes API. The test suite covers API endpoints, business logic, performance, and integration scenarios.

## Test Structure

### Test Files

1. **`api.test.js`** - Main API endpoint tests
2. **`convex.test.js`** - Unit tests for Convex functions
3. **`performance.test.js`** - Performance and load tests
4. **`setup.js`** - Test setup and mocks
5. **`app.js`** - Test application configuration

## Test Categories

### API Tests (`api.test.js`)

#### Basic Endpoints
- Root endpoint (`/`) returns API information
- Health check endpoint (`/health`) returns server status
- 404 handling for unknown endpoints

#### GET /tomatoes
- Returns empty array when no tomatoes exist
- Returns all tomatoes when they exist
- Proper response format with success, data, and count

#### POST /tomatoes (Create)
- Creates tomato with all fields
- Creates tomato with minimal required fields
- Validates required fields (name, variety, price)
- Validates price is non-negative number
- Sets default values (inStock: true)

#### GET /tomatoes/:id
- Returns specific tomato by ID
- Returns 404 for non-existent tomato

#### PUT /tomatoes/:id (Update)
- Updates tomato with all fields
- Updates tomato with partial fields
- Returns 404 for non-existent tomato
- Validates price when provided
- Updates timestamp correctly

#### DELETE /tomatoes/:id
- Deletes existing tomato
- Returns 404 for non-existent tomato
- Confirms deletion in mock data

#### Search Endpoints
- Search by name (`/tomatoes/search/name/:name`)
- Search by variety (`/tomatoes/search/variety/:variety`)
- Returns empty array for no matches
- Returns multiple results when applicable

#### Integration Tests
- Complete CRUD operations flow
- Multiple tomatoes handling
- Search functionality integration

### Convex Tests (`convex.test.js`)

#### Query Functions
- `getAllTomatoes` - Returns all tomatoes from database
- `getTomatoById` - Returns specific tomato or null
- `getTomatoesByName` - Filters tomatoes by name
- `getTomatoesByVariety` - Uses index for variety filtering

#### Mutation Functions
- `createTomato` - Creates new tomato with timestamps
- `updateTomato` - Updates fields and timestamp
- `deleteTomato` - Removes tomato from database

#### Schema Validation
- Validates argument types for all functions
- Ensures optional fields are properly typed
- Confirms ID types for database operations

### Performance Tests (`performance.test.js`)

#### Response Times
- API endpoints respond within acceptable time limits
- Health check is particularly fast (<50ms)
- CRUD operations complete within reasonable timeframes

#### Concurrent Requests
- Handles multiple simultaneous GET requests
- Manages concurrent POST requests without conflicts
- Maintains data consistency under load

#### Large Data Sets
- Efficiently creates many tomatoes
- Fast retrieval of large datasets
- Search performance with many records

#### Memory Usage
- No memory leaks during rapid requests
- Reasonable memory consumption patterns

#### Error Handling Performance
- Fast 404 responses
- Quick validation error responses

## Test Configuration

### Vitest Configuration (`vitest.config.js`)
- Node environment setup
- Global test utilities
- 30-second timeout for complex operations
- Setup file loading
- Coverage reporting configuration

### Test Setup (`setup.js`)
- Mock Convex client implementation
- In-memory data store for tests
- Automatic data reset between tests
- Mock function implementations for all CRUD operations

### Test App (`app.js`)
- Express app without server startup
- Same configuration as main app
- Suitable for supertest integration

## Mocking Strategy

### Convex Client Mock
The tests use a comprehensive mock of the Convex client that:
- Implements all query and mutation functions
- Maintains in-memory data store
- Provides realistic database behavior
- Supports filtering and indexing operations
- Handles error scenarios appropriately

### Data Management
- Mock data is reset before each test
- Consistent ID generation
- Proper timestamp handling
- Realistic data structures

## Running Tests

### Commands
```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Output
Tests provide detailed output including:
- Pass/fail status for each test
- Performance metrics
- Coverage information (when enabled)
- Error details for failures

## Test Data

### Sample Tomato Objects
Tests use realistic tomato data:
```javascript
{
  _id: 'tomato_1',
  name: 'Cherry Tomato',
  variety: 'Sweet 100',
  price: 4.99,
  description: 'Small sweet tomatoes',
  inStock: true,
  createdAt: 1640995200000,
  updatedAt: 1640995200000
}
```

### Edge Cases Covered
- Missing required fields
- Invalid data types
- Negative prices
- Non-existent IDs
- Empty datasets
- Large datasets

## Coverage Goals

The test suite aims for:
- **100% endpoint coverage** - All API routes tested
- **High business logic coverage** - All validation and processing logic
- **Error path coverage** - All error conditions tested
- **Performance benchmarks** - Response time and memory usage

## Continuous Integration

These tests are designed to:
- Run quickly in CI/CD pipelines
- Provide clear failure messages
- Test realistic scenarios
- Validate both happy paths and edge cases
- Ensure API reliability and performance

