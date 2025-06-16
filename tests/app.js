// Test version of the app that doesn't start the server
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import tomatoesRouter from '../routes/tomatoes.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({
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

// Routes
app.use('/tomatoes', tomatoesRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

export default app;

