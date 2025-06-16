import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from './app.js';
import { resetMockData } from './setup.js';

describe('Performance Tests', () => {
  beforeEach(() => {
    resetMockData();
  });

  describe('Response Times', () => {
    it('should respond to GET / in under 100ms', async () => {
      const start = Date.now();
      
      await request(app)
        .get('/')
        .expect(200);
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100);
    });

    it('should respond to GET /health in under 50ms', async () => {
      const start = Date.now();
      
      await request(app)
        .get('/health')
        .expect(200);
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(50);
    });

    it('should respond to GET /tomatoes in under 200ms', async () => {
      const start = Date.now();
      
      await request(app)
        .get('/tomatoes')
        .expect(200);
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(200);
    });

    it('should handle POST /tomatoes in under 300ms', async () => {
      const start = Date.now();
      
      await request(app)
        .post('/tomatoes')
        .send({
          name: 'Performance Test Tomato',
          variety: 'Speed Variety',
          price: 9.99
        })
        .expect(201);
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(300);
    });
  });

  describe('Concurrent Requests', () => {
    it('should handle multiple concurrent GET requests', async () => {
      const concurrentRequests = 10;
      const promises = [];
      
      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          request(app)
            .get('/tomatoes')
            .expect(200)
        );
      }
      
      const start = Date.now();
      const results = await Promise.all(promises);
      const duration = Date.now() - start;
      
      expect(results).toHaveLength(concurrentRequests);
      expect(duration).toBeLessThan(1000); // All requests should complete within 1 second
      
      // All requests should return the same result
      const firstResult = results[0].body;
      results.forEach(result => {
        expect(result.body).toEqual(firstResult);
      });
    });

    it('should handle concurrent POST requests', async () => {
      const concurrentRequests = 5;
      const promises = [];
      
      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          request(app)
            .post('/tomatoes')
            .send({
              name: `Concurrent Tomato ${i + 1}`,
              variety: `Variety ${i + 1}`,
              price: (i + 1) * 2.99
            })
            .expect(201)
        );
      }
      
      const start = Date.now();
      const results = await Promise.all(promises);
      const duration = Date.now() - start;
      
      expect(results).toHaveLength(concurrentRequests);
      expect(duration).toBeLessThan(2000); // Allow more time for creates
      
      // Each request should create a unique tomato
      const createdIds = results.map(result => result.body.data._id);
      const uniqueIds = new Set(createdIds);
      expect(uniqueIds.size).toBe(concurrentRequests);
    });
  });

  describe('Large Data Sets', () => {
    it('should handle creating many tomatoes efficiently', async () => {
      const numberOfTomatoes = 50;
      const promises = [];
      
      const start = Date.now();
      
      for (let i = 0; i < numberOfTomatoes; i++) {
        promises.push(
          request(app)
            .post('/tomatoes')
            .send({
              name: `Bulk Tomato ${i + 1}`,
              variety: `Bulk Variety ${i + 1}`,
              price: Math.round((Math.random() * 10 + 1) * 100) / 100
            })
            .expect(201)
        );
      }
      
      await Promise.all(promises);
      const createDuration = Date.now() - start;
      
      // Now test retrieving all tomatoes
      const retrieveStart = Date.now();
      const response = await request(app)
        .get('/tomatoes')
        .expect(200);
      const retrieveDuration = Date.now() - retrieveStart;
      
      expect(response.body.count).toBe(numberOfTomatoes);
      expect(createDuration).toBeLessThan(5000); // 5 seconds for 50 creates
      expect(retrieveDuration).toBeLessThan(500); // 500ms to retrieve all
    });

    it('should handle search operations efficiently with many records', async () => {
      // Create test data with known patterns
      const testData = [
        { name: 'Cherry Tomato', variety: 'Sweet 100', price: 4.99 },
        { name: 'Cherry Tomato', variety: 'Sweet 200', price: 5.99 },
        { name: 'Cherry Tomato', variety: 'Sweet 300', price: 6.99 },
        { name: 'Beefsteak Tomato', variety: 'Big Beef', price: 7.99 },
        { name: 'Roma Tomato', variety: 'San Marzano', price: 3.99 }
      ];
      
      // Create multiple copies to simulate larger dataset
      const promises = [];
      for (let copy = 0; copy < 10; copy++) {
        for (const tomato of testData) {
          promises.push(
            request(app)
              .post('/tomatoes')
              .send({
                ...tomato,
                name: `${tomato.name} Copy ${copy + 1}`
              })
              .expect(201)
          );
        }
      }
      
      await Promise.all(promises);
      
      // Test search performance
      const searchStart = Date.now();
      const searchResponse = await request(app)
        .get('/tomatoes/search/variety/Sweet 100')
        .expect(200);
      const searchDuration = Date.now() - searchStart;
      
      expect(searchResponse.body.count).toBe(10); // 10 copies
      expect(searchDuration).toBeLessThan(200); // Search should be fast
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory during rapid requests', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Make many rapid requests
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(
          request(app)
            .get('/health')
            .expect(200)
        );
      }
      
      await Promise.all(promises);
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('Error Handling Performance', () => {
    it('should handle 404 errors quickly', async () => {
      const start = Date.now();
      
      await request(app)
        .get('/tomatoes/non-existent-id')
        .expect(404);
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100);
    });

    it('should handle validation errors quickly', async () => {
      const start = Date.now();
      
      await request(app)
        .post('/tomatoes')
        .send({ name: 'Test' }) // Missing required fields
        .expect(400);
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100);
    });
  });
});

