import express from 'express';
import { ConvexHttpClient } from 'convex/browser';

const router = express.Router();

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.CONVEX_URL || 'https://your-convex-deployment.convex.cloud');

// GET /tomatoes - Get all tomatoes
router.get('/', async (req, res) => {
  try {
    const tomatoes = await convex.query('tomatoes:getAllTomatoes');
    res.json({
      success: true,
      data: tomatoes,
      count: tomatoes.length
    });
  } catch (error) {
    console.error('Error fetching tomatoes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tomatoes'
    });
  }
});

// GET /tomatoes/search/name/:name - Search tomatoes by name
router.get('/search/name/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const tomatoes = await convex.query('tomatoes:getTomatoesByName', { name });
    
    res.json({
      success: true,
      data: tomatoes,
      count: tomatoes.length
    });
  } catch (error) {
    console.error('Error searching tomatoes by name:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search tomatoes'
    });
  }
});

// GET /tomatoes/search/variety/:variety - Search tomatoes by variety
router.get('/search/variety/:variety', async (req, res) => {
  try {
    const { variety } = req.params;
    const tomatoes = await convex.query('tomatoes:getTomatoesByVariety', { variety });
    
    res.json({
      success: true,
      data: tomatoes,
      count: tomatoes.length
    });
  } catch (error) {
    console.error('Error searching tomatoes by variety:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search tomatoes'
    });
  }
});

// GET /tomatoes/:id - Get a specific tomato by ID (must be after search routes)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tomato = await convex.query('tomatoes:getTomatoById', { id });
    
    if (!tomato) {
      return res.status(404).json({
        success: false,
        error: 'Tomato not found'
      });
    }
    
    res.json({
      success: true,
      data: tomato
    });
  } catch (error) {
    console.error('Error fetching tomato:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tomato'
    });
  }
});

// POST /tomatoes - Create a new tomato
router.post('/', async (req, res) => {
  try {
    const { name, variety, price, description, inStock } = req.body;
    
    // Validation
    if (!name || !variety || price === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Name, variety, and price are required fields'
      });
    }
    
    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({
        success: false,
        error: 'Price must be a non-negative number'
      });
    }
    
    const tomatoId = await convex.mutation('tomatoes:createTomato', {
      name,
      variety,
      price,
      description,
      inStock
    });
    
    // Get the created tomato to return it
    const createdTomato = await convex.query('tomatoes:getTomatoById', { id: tomatoId });
    
    res.status(201).json({
      success: true,
      data: createdTomato,
      message: 'Tomato created successfully'
    });
  } catch (error) {
    console.error('Error creating tomato:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create tomato'
    });
  }
});

// PUT /tomatoes/:id - Update a tomato
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, variety, price, description, inStock } = req.body;
    
    // Check if tomato exists
    const existingTomato = await convex.query('tomatoes:getTomatoById', { id });
    if (!existingTomato) {
      return res.status(404).json({
        success: false,
        error: 'Tomato not found'
      });
    }
    
    // Validate price if provided
    if (price !== undefined && (typeof price !== 'number' || price < 0)) {
      return res.status(400).json({
        success: false,
        error: 'Price must be a non-negative number'
      });
    }
    
    const updatedTomato = await convex.mutation('tomatoes:updateTomato', {
      id,
      name,
      variety,
      price,
      description,
      inStock
    });
    
    res.json({
      success: true,
      data: updatedTomato,
      message: 'Tomato updated successfully'
    });
  } catch (error) {
    console.error('Error updating tomato:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update tomato'
    });
  }
});

// DELETE /tomatoes/:id - Delete a tomato
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if tomato exists
    const existingTomato = await convex.query('tomatoes:getTomatoById', { id });
    if (!existingTomato) {
      return res.status(404).json({
        success: false,
        error: 'Tomato not found'
      });
    }
    
    await convex.mutation('tomatoes:deleteTomato', { id });
    
    res.json({
      success: true,
      message: 'Tomato deleted successfully',
      data: { id }
    });
  } catch (error) {
    console.error('Error deleting tomato:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete tomato'
    });
  }
});

export default router;

