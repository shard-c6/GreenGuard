const axios = require('axios');
const FormData = require('form-data');

const API_BASE = 'http://localhost:5002/api';
const API_KEY = 'gg_secret_consultant_key_2026';

// A valid, base64-encoded 1x1 minimal JPEG pixel image to use as an automated test attachment
const MOCK_JPEG_BASE64 = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
const mockImageBuffer = Buffer.from(MOCK_JPEG_BASE64, 'base64');

async function testMultimodalRag() {
  console.log('🧪 Starting Automated Multimodal RAG Verification Tests...\n');

  try {
    console.log('Test 1: Sending a multimodal query with an image but WITHOUT specifying a plant...');
    console.log('Expectation: Server will automatically run PlantNet identification first, perform RAG, and query Gemini.');

    const form = new FormData();
    form.append('query', 'This is a medicinal plant. Can you check its health, identify it, and explain its traditional uses?');
    form.append('scientificName', ''); // Triggers auto-identification
    form.append('history', JSON.stringify([]));
    form.append('image', mockImageBuffer, {
      filename: 'test_leaf.jpg',
      contentType: 'image/jpeg'
    });

    const response = await axios.post(`${API_BASE}/consultant/expert`, form, {
      headers: {
        ...form.getHeaders(),
        'x-api-key': API_KEY,
        'x-test-bypass': 'true'
      }
    });

    console.log('\n✅ PASS: Endpoint successfully responded!');
    console.log('Status Code:', response.status);
    console.log('Auto-Identified Plant Info:', JSON.stringify(response.data.identifiedPlant));
    console.log('\n--- Gemini Expert Advice ---');
    console.log(response.data.answer);
    console.log('----------------------------\n');

  } catch (error) {
    console.error('❌ FAIL: Multimodal query failed.');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Error Response:', JSON.stringify(error.response.data));
    } else {
      console.error(error.message);
    }
  }

  console.log('\n----------------------------------------\n');

  try {
    console.log('Test 2: Sending a query with an image AND a focused plant context (scientificName: "Rosa")...');
    console.log('Expectation: Server skips auto-identification and does RAG for Rose, passing the image context to Gemini.');

    const form = new FormData();
    form.append('query', 'What care instructions does this Rose plant need?');
    form.append('scientificName', 'Rosa'); // Skips auto-identification, focuses Rose
    form.append('history', JSON.stringify([]));
    form.append('image', mockImageBuffer, {
      filename: 'rose_leaf.jpg',
      contentType: 'image/jpeg'
    });

    const response = await axios.post(`${API_BASE}/consultant/expert`, form, {
      headers: {
        ...form.getHeaders(),
        'x-api-key': API_KEY,
        'x-test-bypass': 'true'
      }
    });

    console.log('\n✅ PASS: Endpoint successfully responded!');
    console.log('Status Code:', response.status);
    console.log('Auto-Identified Plant (Should be null):', response.data.identifiedPlant);
    console.log('\n--- Gemini Expert Advice ---');
    console.log(response.data.answer);
    console.log('----------------------------\n');

  } catch (error) {
    console.error('❌ FAIL: Multimodal query with active focus failed.');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Error Response:', JSON.stringify(error.response.data));
    } else {
      console.error(error.message);
    }
  }

  console.log('🧪 Verification tests run complete!');
}

testMultimodalRag();
