import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the Convex server imports
vi.mock('../convex/_generated/server', () => ({
  query: vi.fn((config) => config),
  mutation: vi.fn((config) => config)
}));

vi.mock('convex/values', () => ({
  v: {
    string: () => 'string',
    number: () => 'number',
    boolean: () => 'boolean',
    optional: (type) => `optional(${type})`,
    id: (table) => `id(${table})`
  }
}));

describe('Convex Functions', () => {
  let mockDb;
  let mockCtx;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock database operations
    mockDb = {
      query: vi.fn().mockReturnThis(),
      get: vi.fn(),
      insert: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      collect: vi.fn(),
      filter: vi.fn().mockReturnThis(),
      withIndex: vi.fn().mockReturnThis()
    };

    mockCtx = {
      db: mockDb
    };
  });

  describe('Query Functions', () => {
    describe('getAllTomatoes', () => {
      it('should return all tomatoes from database', async () => {
        const { getAllTomatoes } = await import('../convex/tomatoes.ts');
        const expectedTomatoes = [
          { _id: '1', name: 'Cherry', variety: 'Sweet 100', price: 4.99 },
          { _id: '2', name: 'Beefsteak', variety: 'Big Beef', price: 6.99 }
        ];
        
        mockDb.collect.mockResolvedValue(expectedTomatoes);
        
        const result = await getAllTomatoes.handler(mockCtx);
        
        expect(mockDb.query).toHaveBeenCalledWith('tomatoes');
        expect(mockDb.collect).toHaveBeenCalled();
        expect(result).toEqual(expectedTomatoes);
      });

      it('should return empty array when no tomatoes exist', async () => {
        const { getAllTomatoes } = await import('../convex/tomatoes.ts');
        
        mockDb.collect.mockResolvedValue([]);
        
        const result = await getAllTomatoes.handler(mockCtx);
        
        expect(result).toEqual([]);
      });
    });

    describe('getTomatoById', () => {
      it('should return specific tomato by ID', async () => {
        const { getTomatoById } = await import('../convex/tomatoes.ts');
        const expectedTomato = { _id: '1', name: 'Cherry', variety: 'Sweet 100', price: 4.99 };
        
        mockDb.get.mockResolvedValue(expectedTomato);
        
        const result = await getTomatoById.handler(mockCtx, { id: '1' });
        
        expect(mockDb.get).toHaveBeenCalledWith('1');
        expect(result).toEqual(expectedTomato);
      });

      it('should return null for non-existent tomato', async () => {
        const { getTomatoById } = await import('../convex/tomatoes.ts');
        
        mockDb.get.mockResolvedValue(null);
        
        const result = await getTomatoById.handler(mockCtx, { id: 'non-existent' });
        
        expect(result).toBeNull();
      });
    });

    describe('getTomatoesByName', () => {
      it('should return tomatoes filtered by name', async () => {
        const { getTomatoesByName } = await import('../convex/tomatoes.ts');
        const expectedTomatoes = [
          { _id: '1', name: 'Cherry', variety: 'Sweet 100', price: 4.99 },
          { _id: '2', name: 'Cherry', variety: 'Sweet 200', price: 5.99 }
        ];
        
        mockDb.collect.mockResolvedValue(expectedTomatoes);
        
        const result = await getTomatoesByName.handler(mockCtx, { name: 'Cherry' });
        
        expect(mockDb.query).toHaveBeenCalledWith('tomatoes');
        expect(mockDb.filter).toHaveBeenCalled();
        expect(mockDb.collect).toHaveBeenCalled();
        expect(result).toEqual(expectedTomatoes);
      });
    });

    describe('getTomatoesByVariety', () => {
      it('should return tomatoes filtered by variety using index', async () => {
        const { getTomatoesByVariety } = await import('../convex/tomatoes.ts');
        const expectedTomatoes = [
          { _id: '1', name: 'Cherry', variety: 'Sweet 100', price: 4.99 }
        ];
        
        mockDb.collect.mockResolvedValue(expectedTomatoes);
        
        const result = await getTomatoesByVariety.handler(mockCtx, { variety: 'Sweet 100' });
        
        expect(mockDb.query).toHaveBeenCalledWith('tomatoes');
        expect(mockDb.withIndex).toHaveBeenCalledWith('by_variety', expect.any(Function));
        expect(mockDb.collect).toHaveBeenCalled();
        expect(result).toEqual(expectedTomatoes);
      });
    });
  });

  describe('Mutation Functions', () => {
    describe('createTomato', () => {
      it('should create a new tomato with all fields', async () => {
        const { createTomato } = await import('../convex/tomatoes.ts');
        const tomatoData = {
          name: 'Cherry Tomato',
          variety: 'Sweet 100',
          price: 4.99,
          description: 'Small sweet tomatoes',
          inStock: true
        };
        const expectedId = 'new-tomato-id';
        
        mockDb.insert.mockResolvedValue(expectedId);
        
        const result = await createTomato.handler(mockCtx, tomatoData);
        
        expect(mockDb.insert).toHaveBeenCalledWith('tomatoes', {
          name: 'Cherry Tomato',
          variety: 'Sweet 100',
          price: 4.99,
          description: 'Small sweet tomatoes',
          inStock: true,
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number)
        });
        expect(result).toBe(expectedId);
      });

      it('should create a tomato with minimal fields and defaults', async () => {
        const { createTomato } = await import('../convex/tomatoes.ts');
        const tomatoData = {
          name: 'Roma Tomato',
          variety: 'San Marzano',
          price: 3.50
        };
        const expectedId = 'new-tomato-id';
        
        mockDb.insert.mockResolvedValue(expectedId);
        
        const result = await createTomato.handler(mockCtx, tomatoData);
        
        expect(mockDb.insert).toHaveBeenCalledWith('tomatoes', {
          name: 'Roma Tomato',
          variety: 'San Marzano',
          price: 3.50,
          description: undefined,
          inStock: true, // Default value
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number)
        });
        expect(result).toBe(expectedId);
      });
    });

    describe('updateTomato', () => {
      it('should update tomato with provided fields', async () => {
        const { updateTomato } = await import('../convex/tomatoes.ts');
        const existingTomato = {
          _id: 'tomato-1',
          name: 'Cherry Tomato',
          variety: 'Sweet 100',
          price: 4.99,
          createdAt: 1000000,
          updatedAt: 1000000
        };
        const updatedTomato = {
          ...existingTomato,
          price: 5.99,
          inStock: false,
          updatedAt: expect.any(Number)
        };
        
        mockDb.get.mockResolvedValue(updatedTomato);
        
        const result = await updateTomato.handler(mockCtx, {
          id: 'tomato-1',
          price: 5.99,
          inStock: false
        });
        
        expect(mockDb.patch).toHaveBeenCalledWith('tomato-1', {
          price: 5.99,
          inStock: false,
          updatedAt: expect.any(Number)
        });
        expect(mockDb.get).toHaveBeenCalledWith('tomato-1');
        expect(result).toEqual(updatedTomato);
      });

      it('should filter out undefined values', async () => {
        const { updateTomato } = await import('../convex/tomatoes.ts');
        const updatedTomato = {
          _id: 'tomato-1',
          name: 'Updated Cherry Tomato',
          variety: 'Sweet 100',
          price: 4.99
        };
        
        mockDb.get.mockResolvedValue(updatedTomato);
        
        await updateTomato.handler(mockCtx, {
          id: 'tomato-1',
          name: 'Updated Cherry Tomato',
          variety: undefined,
          price: undefined
        });
        
        expect(mockDb.patch).toHaveBeenCalledWith('tomato-1', {
          name: 'Updated Cherry Tomato',
          updatedAt: expect.any(Number)
        });
      });

      it('should not patch if no fields to update', async () => {
        const { updateTomato } = await import('../convex/tomatoes.ts');
        const existingTomato = {
          _id: 'tomato-1',
          name: 'Cherry Tomato'
        };
        
        mockDb.get.mockResolvedValue(existingTomato);
        
        await updateTomato.handler(mockCtx, {
          id: 'tomato-1',
          name: undefined,
          variety: undefined
        });
        
        expect(mockDb.patch).not.toHaveBeenCalled();
        expect(mockDb.get).toHaveBeenCalledWith('tomato-1');
      });
    });

    describe('deleteTomato', () => {
      it('should delete tomato and return success', async () => {
        const { deleteTomato } = await import('../convex/tomatoes.ts');
        
        mockDb.delete.mockResolvedValue(undefined);
        
        const result = await deleteTomato.handler(mockCtx, { id: 'tomato-1' });
        
        expect(mockDb.delete).toHaveBeenCalledWith('tomato-1');
        expect(result).toEqual({
          success: true,
          id: 'tomato-1'
        });
      });
    });
  });

  describe('Schema Validation', () => {
    it('should have correct argument types for createTomato', async () => {
      const { createTomato } = await import('../convex/tomatoes.ts');
      
      expect(createTomato.args).toBeDefined();
      expect(createTomato.args.name).toBe('string');
      expect(createTomato.args.variety).toBe('string');
      expect(createTomato.args.price).toBe('number');
      expect(createTomato.args.description).toBe('optional(string)');
      expect(createTomato.args.inStock).toBe('optional(boolean)');
    });

    it('should have correct argument types for updateTomato', async () => {
      const { updateTomato } = await import('../convex/tomatoes.ts');
      
      expect(updateTomato.args).toBeDefined();
      expect(updateTomato.args.id).toBe('id(tomatoes)');
      expect(updateTomato.args.name).toBe('optional(string)');
      expect(updateTomato.args.variety).toBe('optional(string)');
      expect(updateTomato.args.price).toBe('optional(number)');
      expect(updateTomato.args.description).toBe('optional(string)');
      expect(updateTomato.args.inStock).toBe('optional(boolean)');
    });

    it('should have correct argument types for query functions', async () => {
      const { getTomatoById, getTomatoesByName, getTomatoesByVariety } = await import('../convex/tomatoes.ts');
      
      expect(getTomatoById.args.id).toBe('id(tomatoes)');
      expect(getTomatoesByName.args.name).toBe('string');
      expect(getTomatoesByVariety.args.variety).toBe('string');
    });
  });
});

