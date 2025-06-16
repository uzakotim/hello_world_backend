import { vi } from 'vitest';

// Mock data store for tests
const mockTomatoes = new Map();
let idCounter = 1;

// Reset mock data before each test
export function resetMockData() {
  mockTomatoes.clear();
  idCounter = 1;
}

// Mock Convex client
vi.mock('convex/browser', () => {
  return {
    ConvexHttpClient: vi.fn(() => ({
      query: vi.fn(async (functionName, args = {}) => {
        switch (functionName) {
          case 'tomatoes:getAllTomatoes':
            return Array.from(mockTomatoes.values());
          
          case 'tomatoes:getTomatoById':
            return mockTomatoes.get(args.id) || null;
          
          case 'tomatoes:getTomatoesByName':
            return Array.from(mockTomatoes.values()).filter(
              tomato => tomato.name === args.name
            );
          
          case 'tomatoes:getTomatoesByVariety':
            return Array.from(mockTomatoes.values()).filter(
              tomato => tomato.variety === args.variety
            );
          
          default:
            throw new Error(`Unknown query: ${functionName}`);
        }
      }),
      
      mutation: vi.fn(async (functionName, args = {}) => {
        const now = Date.now();
        
        switch (functionName) {
          case 'tomatoes:createTomato': {
            const id = `tomato_${idCounter++}`;
            const newTomato = {
              _id: id,
              name: args.name,
              variety: args.variety,
              price: args.price,
              description: args.description,
              inStock: args.inStock ?? true,
              createdAt: now,
              updatedAt: now
            };
            mockTomatoes.set(id, newTomato);
            return id;
          }
          
          case 'tomatoes:updateTomato': {
            const existing = mockTomatoes.get(args.id);
            if (!existing) {
              throw new Error('Tomato not found');
            }
            
            const updated = {
              ...existing,
              ...Object.fromEntries(
                Object.entries(args).filter(([key, value]) => 
                  key !== 'id' && value !== undefined
                )
              ),
              updatedAt: now
            };
            
            mockTomatoes.set(args.id, updated);
            return updated;
          }
          
          case 'tomatoes:deleteTomato':
            if (!mockTomatoes.has(args.id)) {
              throw new Error('Tomato not found');
            }
            mockTomatoes.delete(args.id);
            return { success: true, id: args.id };
          
          default:
            throw new Error(`Unknown mutation: ${functionName}`);
        }
      })
    }))
  };
});

// Export mock data access for tests
export { mockTomatoes };

