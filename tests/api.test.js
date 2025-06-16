import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from './app.js';
import { resetMockData, mockTomatoes } from './setup.js';

describe('Tomatoes API', () => {
  beforeEach(() => {
    resetMockData();
  });

  describe('Basic Endpoints', () => {
    it('should return API information on root endpoint', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Welcome to the Tomatoes API',
        version: '1.0.0',
        endpoints: {
          'GET /tomatoes': 'Get all tomatoes',
          'GET /tomatoes/:id': 'Get a specific tomato',
          'GET /tomatoes/search/name/:name': 'Search tomatoes by name',
          'GET /tomatoes/search/variety/:variety': 'Search tomatoes by variety',
          'POST /tomatoes': 'Create a new tomato',
          'PUT /tomatoes/:id': 'Update a tomato',
          'DELETE /tomatoes/:id': 'Delete a tomato'
        }
      });
    });

    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'OK',
        timestamp: expect.any(String),
        uptime: expect.any(Number)
      });
    });

    it('should return 404 for unknown endpoints', async () => {
      const response = await request(app)
        .get('/unknown-endpoint')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: 'Endpoint not found',
        path: '/unknown-endpoint'
      });
    });
  });

  describe('GET /tomatoes', () => {
    it('should return empty array when no tomatoes exist', async () => {
      const response = await request(app)
        .get('/tomatoes')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: [],
        count: 0
      });
    });

    it('should return all tomatoes when they exist', async () => {
      // Add mock data
      const tomato1 = {
        _id: 'tomato_1',
        name: 'Cherry Tomato',
        variety: 'Sweet 100',
        price: 4.99,
        description: 'Small sweet tomatoes',
        inStock: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      const tomato2 = {
        _id: 'tomato_2',
        name: 'Beefsteak Tomato',
        variety: 'Big Beef',
        price: 6.99,
        description: 'Large slicing tomatoes',
        inStock: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      mockTomatoes.set('tomato_1', tomato1);
      mockTomatoes.set('tomato_2', tomato2);

      const response = await request(app)
        .get('/tomatoes')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: [tomato1, tomato2],
        count: 2
      });
    });
  });

  describe('POST /tomatoes', () => {
    it('should create a new tomato with all fields', async () => {
      const newTomato = {
        name: 'Cherry Tomato',
        variety: 'Sweet 100',
        price: 4.99,
        description: 'Small sweet tomatoes',
        inStock: true
      };

      const response = await request(app)
        .post('/tomatoes')
        .send(newTomato)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Tomato created successfully',
        data: {
          _id: expect.any(String),
          name: 'Cherry Tomato',
          variety: 'Sweet 100',
          price: 4.99,
          description: 'Small sweet tomatoes',
          inStock: true,
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number)
        }
      });
    });

    it('should create a tomato with minimal required fields', async () => {
      const newTomato = {
        name: 'Roma Tomato',
        variety: 'San Marzano',
        price: 3.50
      };

      const response = await request(app)
        .post('/tomatoes')
        .send(newTomato)
        .expect(201);

      expect(response.body.data).toMatchObject({
        name: 'Roma Tomato',
        variety: 'San Marzano',
        price: 3.50,
        inStock: true, // Default value
        description: undefined
      });
    });

    it('should return 400 when name is missing', async () => {
      const newTomato = {
        variety: 'Sweet 100',
        price: 4.99
      };

      const response = await request(app)
        .post('/tomatoes')
        .send(newTomato)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: 'Name, variety, and price are required fields'
      });
    });

    it('should return 400 when variety is missing', async () => {
      const newTomato = {
        name: 'Cherry Tomato',
        price: 4.99
      };

      const response = await request(app)
        .post('/tomatoes')
        .send(newTomato)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: 'Name, variety, and price are required fields'
      });
    });

    it('should return 400 when price is missing', async () => {
      const newTomato = {
        name: 'Cherry Tomato',
        variety: 'Sweet 100'
      };

      const response = await request(app)
        .post('/tomatoes')
        .send(newTomato)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: 'Name, variety, and price are required fields'
      });
    });

    it('should return 400 when price is negative', async () => {
      const newTomato = {
        name: 'Cherry Tomato',
        variety: 'Sweet 100',
        price: -1.99
      };

      const response = await request(app)
        .post('/tomatoes')
        .send(newTomato)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: 'Price must be a non-negative number'
      });
    });

    it('should return 400 when price is not a number', async () => {
      const newTomato = {
        name: 'Cherry Tomato',
        variety: 'Sweet 100',
        price: 'expensive'
      };

      const response = await request(app)
        .post('/tomatoes')
        .send(newTomato)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: 'Price must be a non-negative number'
      });
    });
  });

  describe('GET /tomatoes/:id', () => {
    it('should return a specific tomato by ID', async () => {
      const tomato = {
        _id: 'tomato_1',
        name: 'Cherry Tomato',
        variety: 'Sweet 100',
        price: 4.99,
        description: 'Small sweet tomatoes',
        inStock: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      mockTomatoes.set('tomato_1', tomato);

      const response = await request(app)
        .get('/tomatoes/tomato_1')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: tomato
      });
    });

    it('should return 404 for non-existent tomato', async () => {
      const response = await request(app)
        .get('/tomatoes/non-existent-id')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: 'Tomato not found'
      });
    });
  });

  describe('PUT /tomatoes/:id', () => {
    beforeEach(() => {
      const tomato = {
        _id: 'tomato_1',
        name: 'Cherry Tomato',
        variety: 'Sweet 100',
        price: 4.99,
        description: 'Small sweet tomatoes',
        inStock: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      mockTomatoes.set('tomato_1', tomato);
    });

    it('should update a tomato with all fields', async () => {
      const updates = {
        name: 'Updated Cherry Tomato',
        variety: 'Sweet 200',
        price: 5.99,
        description: 'Updated description',
        inStock: false
      };

      const response = await request(app)
        .put('/tomatoes/tomato_1')
        .send(updates)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Tomato updated successfully',
        data: {
          _id: 'tomato_1',
          name: 'Updated Cherry Tomato',
          variety: 'Sweet 200',
          price: 5.99,
          description: 'Updated description',
          inStock: false,
          updatedAt: expect.any(Number)
        }
      });
    });

    it('should update a tomato with partial fields', async () => {
      const updates = {
        price: 6.99,
        inStock: false
      };

      const response = await request(app)
        .put('/tomatoes/tomato_1')
        .send(updates)
        .expect(200);

      expect(response.body.data).toMatchObject({
        _id: 'tomato_1',
        name: 'Cherry Tomato', // Unchanged
        variety: 'Sweet 100', // Unchanged
        price: 6.99, // Updated
        inStock: false, // Updated
        updatedAt: expect.any(Number)
      });
    });

    it('should return 404 for non-existent tomato', async () => {
      const updates = { price: 5.99 };

      const response = await request(app)
        .put('/tomatoes/non-existent-id')
        .send(updates)
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: 'Tomato not found'
      });
    });

    it('should return 400 for invalid price', async () => {
      const updates = { price: -5.99 };

      const response = await request(app)
        .put('/tomatoes/tomato_1')
        .send(updates)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: 'Price must be a non-negative number'
      });
    });
  });

  describe('DELETE /tomatoes/:id', () => {
    beforeEach(() => {
      const tomato = {
        _id: 'tomato_1',
        name: 'Cherry Tomato',
        variety: 'Sweet 100',
        price: 4.99,
        description: 'Small sweet tomatoes',
        inStock: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      mockTomatoes.set('tomato_1', tomato);
    });

    it('should delete an existing tomato', async () => {
      const response = await request(app)
        .delete('/tomatoes/tomato_1')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Tomato deleted successfully',
        data: { id: 'tomato_1' }
      });

      // Verify tomato is actually deleted
      expect(mockTomatoes.has('tomato_1')).toBe(false);
    });

    it('should return 404 for non-existent tomato', async () => {
      const response = await request(app)
        .delete('/tomatoes/non-existent-id')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: 'Tomato not found'
      });
    });
  });

  describe('Search Endpoints', () => {
    beforeEach(() => {
      const tomatoes = [
        {
          _id: 'tomato_1',
          name: 'Cherry Tomato',
          variety: 'Sweet 100',
          price: 4.99,
          description: 'Small sweet tomatoes',
          inStock: true,
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        {
          _id: 'tomato_2',
          name: 'Cherry Tomato',
          variety: 'Sweet 200',
          price: 5.99,
          description: 'Another cherry variety',
          inStock: false,
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        {
          _id: 'tomato_3',
          name: 'Beefsteak Tomato',
          variety: 'Big Beef',
          price: 6.99,
          description: 'Large slicing tomatoes',
          inStock: true,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ];

      tomatoes.forEach(tomato => {
        mockTomatoes.set(tomato._id, tomato);
      });
    });

    describe('GET /tomatoes/search/name/:name', () => {
      it('should find tomatoes by exact name match', async () => {
        const response = await request(app)
          .get('/tomatoes/search/name/Cherry Tomato')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.count).toBe(2);
        expect(response.body.data).toHaveLength(2);
        expect(response.body.data.every(t => t.name === 'Cherry Tomato')).toBe(true);
      });

      it('should return empty array for non-matching name', async () => {
        const response = await request(app)
          .get('/tomatoes/search/name/Non-existent Tomato')
          .expect(200);

        expect(response.body).toEqual({
          success: true,
          data: [],
          count: 0
        });
      });
    });

    describe('GET /tomatoes/search/variety/:variety', () => {
      it('should find tomatoes by exact variety match', async () => {
        const response = await request(app)
          .get('/tomatoes/search/variety/Sweet 100')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.count).toBe(1);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].variety).toBe('Sweet 100');
      });

      it('should return empty array for non-matching variety', async () => {
        const response = await request(app)
          .get('/tomatoes/search/variety/Non-existent Variety')
          .expect(200);

        expect(response.body).toEqual({
          success: true,
          data: [],
          count: 0
        });
      });
    });
  });

  describe('Integration Tests', () => {
    it('should perform complete CRUD operations', async () => {
      // Create a tomato
      const createResponse = await request(app)
        .post('/tomatoes')
        .send({
          name: 'Integration Test Tomato',
          variety: 'Test Variety',
          price: 9.99,
          description: 'For testing',
          inStock: true
        })
        .expect(201);

      const tomatoId = createResponse.body.data._id;

      // Read the created tomato
      const readResponse = await request(app)
        .get(`/tomatoes/${tomatoId}`)
        .expect(200);

      expect(readResponse.body.data.name).toBe('Integration Test Tomato');

      // Update the tomato
      const updateResponse = await request(app)
        .put(`/tomatoes/${tomatoId}`)
        .send({
          name: 'Updated Integration Test Tomato',
          price: 12.99
        })
        .expect(200);

      expect(updateResponse.body.data.name).toBe('Updated Integration Test Tomato');
      expect(updateResponse.body.data.price).toBe(12.99);
      expect(updateResponse.body.data.variety).toBe('Test Variety'); // Unchanged

      // Delete the tomato
      await request(app)
        .delete(`/tomatoes/${tomatoId}`)
        .expect(200);

      // Verify deletion
      await request(app)
        .get(`/tomatoes/${tomatoId}`)
        .expect(404);
    });

    it('should handle multiple tomatoes correctly', async () => {
      // Create multiple tomatoes
      const tomatoes = [
        { name: 'Test 1', variety: 'Var 1', price: 1.99 },
        { name: 'Test 2', variety: 'Var 2', price: 2.99 },
        { name: 'Test 3', variety: 'Var 3', price: 3.99 }
      ];

      const createdIds = [];
      for (const tomato of tomatoes) {
        const response = await request(app)
          .post('/tomatoes')
          .send(tomato)
          .expect(201);
        createdIds.push(response.body.data._id);
      }

      // Get all tomatoes
      const allResponse = await request(app)
        .get('/tomatoes')
        .expect(200);

      expect(allResponse.body.count).toBe(3);
      expect(allResponse.body.data).toHaveLength(3);

      // Search by name
      const searchResponse = await request(app)
        .get('/tomatoes/search/name/Test 2')
        .expect(200);

      expect(searchResponse.body.count).toBe(1);
      expect(searchResponse.body.data[0].name).toBe('Test 2');
    });
  });
});

