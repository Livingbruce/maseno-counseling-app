// Test script to verify API functions work
const testApi = require('./api/health.js');

// Mock request and response
const mockReq = {
  method: 'GET',
  url: 'https://example.com/api/health',
  headers: {
    host: 'example.com'
  }
};

const mockRes = {
  statusCode: 200,
  headers: {},
  setHeader: function(name, value) {
    this.headers[name] = value;
  },
  status: function(code) {
    this.statusCode = code;
    return this;
  },
  json: function(data) {
    console.log('Response:', JSON.stringify(data, null, 2));
  },
  end: function() {
    console.log('Response ended');
  }
};

console.log('Testing API health endpoint...');
testApi(mockReq, mockRes);
