/**
 * @file test_gemini_api.js
 * @description Test Gemini API connection and model
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || 'AIzaSyDdta6mijELppcFmtN85MDC8-Kh5qtQjE0';
const MODEL_NAME = 'gemini-2.0-flash-exp';

async function testGeminiAPI() {
  console.log('='.repeat(70));
  console.log('GEMINI API CONNECTION TEST');
  console.log('='.repeat(70));
  console.log();

  try {
    // Initialize Gemini
    console.log('1. Initializing Gemini API...');
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    console.log('✅ Gemini API initialized');
    console.log();

    // List available models
    console.log('2. Checking available models...');
    console.log(`   Model: ${MODEL_NAME}`);
    console.log();

    // Get model
    console.log('3. Getting model instance...');
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    console.log('✅ Model instance created');
    console.log();

    // Test simple prompt
    console.log('4. Testing simple prompt...');
    const prompt = 'Say "Hello, EStack-Brand-Builder!" in exactly 5 words.';
    console.log(`   Prompt: "${prompt}"`);
    console.log();

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    console.log('5. Response received:');
    console.log(`   ${text}`);
    console.log();

    // Test code review prompt
    console.log('6. Testing code review prompt...');
    const codePrompt = `
Review this JavaScript function for quality:

\`\`\`javascript
function add(a, b) {
  return a + b;
}
\`\`\`

Provide a brief assessment (max 2 sentences).
`;

    const codeResult = await model.generateContent(codePrompt);
    const codeResponse = codeResult.response.text();

    console.log('   Code review response:');
    console.log(`   ${codeResponse}`);
    console.log();

    // Success summary
    console.log('='.repeat(70));
    console.log('✅ GEMINI API TEST SUCCESSFUL');
    console.log('='.repeat(70));
    console.log();
    console.log('Connection Details:');
    console.log(`  - API Key: ${GEMINI_API_KEY.substring(0, 20)}...`);
    console.log(`  - Model: ${MODEL_NAME}`);
    console.log(`  - Status: ✅ Operational`);
    console.log();
    console.log('Free Tier Limits:');
    console.log('  - 60 requests/minute');
    console.log('  - 1,000 requests/day');
    console.log('  - Cost: $0.00');
    console.log();

    return {
      success: true,
      model: MODEL_NAME,
      apiKey: GEMINI_API_KEY,
      response: text
    };

  } catch (error) {
    console.error('❌ GEMINI API TEST FAILED');
    console.error('Error:', error.message);
    console.error();

    if (error.message.includes('API key')) {
      console.error('💡 Tip: Check your API key at:');
      console.error('   https://makersuite.google.com/app/apikey');
    } else if (error.message.includes('model')) {
      console.error('💡 Tip: Model may not be available. Try:');
      console.error('   - gemini-pro');
      console.error('   - gemini-2.0-flash-exp');
      console.error('   - gemini-1.5-pro');
    } else if (error.message.includes('quota')) {
      console.error('💡 Tip: You may have exceeded the free tier quota');
      console.error('   Wait a few minutes and try again');
    }

    console.error();
    throw error;
  }
}

// Run test
testGeminiAPI()
  .then(result => {
    console.log('Test completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Test failed:', error.message);
    process.exit(1);
  });
