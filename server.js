require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const API_BASE_URL = process.env.API_BASE_URL || 'https://api.sixtyfour.ai';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Helper function to make API requests
async function makeApiRequest(endpoint, data, isAsync = false) {
  const apiKey = process.env.SIXTYFOUR_API_KEY;
  
  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new Error('Please set your SIXTYFOUR_API_KEY in the .env file');
  }

  const config = {
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    }
  };

  const url = `${API_BASE_URL}${endpoint}`;
  const response = await axios.post(url, data, config);
  return response.data;
}

// Helper function to check job status
async function checkJobStatus(taskId) {
  const apiKey = process.env.SIXTYFOUR_API_KEY;
  
  const config = {
    headers: {
      'x-api-key': apiKey
    }
  };

  const url = `${API_BASE_URL}/job-status/${taskId}`;
  const response = await axios.get(url, config);
  return response.data;
}

// Routes

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Enrich Company endpoint
app.post('/api/enrich-company', async (req, res) => {
  try {
    const result = await makeApiRequest('/enrich-company', req.body);
    res.json(result);
  } catch (error) {
    console.error('Error in enrich-company:', error.message);
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data || null
    });
  }
});

// Enrich Company Async endpoint
app.post('/api/enrich-company-async', async (req, res) => {
  try {
    const result = await makeApiRequest('/enrich-company-async', req.body, true);
    res.json(result);
  } catch (error) {
    console.error('Error in enrich-company-async:', error.message);
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data || null
    });
  }
});

// Enrich Lead endpoint
app.post('/api/enrich-lead', async (req, res) => {
  try {
    const result = await makeApiRequest('/enrich-lead', req.body);
    res.json(result);
  } catch (error) {
    console.error('Error in enrich-lead:', error.message);
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data || null
    });
  }
});

// Find Email endpoint
app.post('/api/find-email', async (req, res) => {
  try {
    const result = await makeApiRequest('/find-email', req.body);
    res.json(result);
  } catch (error) {
    console.error('Error in find-email:', error.message);
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data || null
    });
  }
});

// Find Phone endpoint
app.post('/api/find-phone', async (req, res) => {
  try {
    const result = await makeApiRequest('/find-phone', req.body);
    res.json(result);
  } catch (error) {
    console.error('Error in find-phone:', error.message);
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data || null
    });
  }
});

// QA Agent endpoint
app.post('/api/qa-agent', async (req, res) => {
  try {
    console.log('QA Agent request body:', JSON.stringify(req.body, null, 2));
    const result = await makeApiRequest('/qa-agent', req.body);
    res.json(result);
  } catch (error) {
    console.error('Error in qa-agent:', error.message);
    console.error('Request body was:', JSON.stringify(req.body, null, 2));
    console.error('Error response:', error.response?.data);
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data || null
    });
  }
});

// Job Status endpoint
app.get('/api/job-status/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const result = await checkJobStatus(taskId);
    res.json(result);
  } catch (error) {
    console.error('Error in job-status:', error.message);
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data || null
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    apiKeyConfigured: process.env.SIXTYFOUR_API_KEY && process.env.SIXTYFOUR_API_KEY !== 'your_api_key_here'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

app.listen(PORT, () => {
  console.log(`🚀 SixtyFour AI Tester running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: https://docs.sixtyfour.ai`);
  console.log(`🔑 API Key configured: ${process.env.SIXTYFOUR_API_KEY && process.env.SIXTYFOUR_API_KEY !== 'your_api_key_here' ? 'Yes' : 'No - Please update .env file'}`);
});
