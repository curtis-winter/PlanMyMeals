import axios from 'axios';

async function testOllamaConnection() {
  try {
    console.log('Testing Ollama connection...');
    
    // Test the /api/ai/test-connection endpoint
    const response = await axios.get('http://localhost:3112/api/ai/test-connection?url=http://localhost:11434');
    
    console.log('Connection test result:', response.data);
    
    if (response.data.success) {
      console.log('Successfully connected to Ollama!');
      console.log('Available models:', response.data.models.map(m => m.name));
    } else {
      console.log('Failed to connect to Ollama:', response.data.error);
    }
  } catch (error) {
    console.error('Error testing Ollama connection:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testOllamaConnection();