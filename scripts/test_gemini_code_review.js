/**
 * @file test_gemini_code_review.js
 * @description Test Gemini API for actual code review scenarios
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDdta6mijELppcFmtN85MDC8-Kh5qtQjE0';
const MODEL_NAME = 'gemini-2.0-flash-exp';

// Test code samples
const testCases = [
  {
    name: 'Quality Control Agent',
    file: 'src/agents/quality/QualityControlAgent.js',
    focus: 'BaseAgent compliance, error handling, and code quality'
  },
  {
    name: 'Documentation Agent',
    file: 'src/agents/support/DocumentationAgent.js',
    focus: 'Code structure, JSDoc parsing, and documentation generation'
  },
  {
    name: 'Technical Agent',
    file: 'src/agents/support/TechnicalAgent.js',
    focus: 'Security analysis, performance checks, and static analysis'
  }
];

async function reviewCodeWithGemini(code, fileName, focus) {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const prompt = `
You are a senior code reviewer for the EStack-Brand-Builder project.

Review this code file: ${fileName}

Focus areas: ${focus}

Code to review (first 100 lines):
\`\`\`javascript
${code}
\`\`\`

Provide:
1. Overall quality score (1-10)
2. Key strengths (2-3 points)
3. Improvement suggestions (2-3 points)
4. Critical issues (if any)

Keep response under 200 words.
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function runCodeReviewTests() {
  console.log('='.repeat(70));
  console.log('GEMINI CODE REVIEW TEST - ESTACK-BRAND-BUILDER');
  console.log('='.repeat(70));
  console.log();

  const results = [];

  for (const testCase of testCases) {
    console.log(`\n${'─'.repeat(70)}`);
    console.log(`📄 Reviewing: ${testCase.name}`);
    console.log(`   File: ${testCase.file}`);
    console.log(`   Focus: ${testCase.focus}`);
    console.log('─'.repeat(70));
    console.log();

    try {
      // Read file
      const code = fs.readFileSync(testCase.file, 'utf8');
      const codePreview = code.split('\n').slice(0, 100).join('\n');

      console.log('🤖 Requesting Gemini review...');
      const startTime = Date.now();

      const review = await reviewCodeWithGemini(codePreview, testCase.file, testCase.focus);
      const duration = Date.now() - startTime;

      console.log();
      console.log('✅ Review completed');
      console.log(`⏱️  Response time: ${duration}ms`);
      console.log();
      console.log('📊 Gemini Review:');
      console.log('─'.repeat(70));
      console.log(review);
      console.log('─'.repeat(70));

      results.push({
        name: testCase.name,
        success: true,
        duration,
        review: review.substring(0, 200)
      });

      // Rate limit delay
      console.log();
      console.log('⏳ Waiting 2 seconds (rate limit protection)...');
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.error(`❌ Review failed: ${error.message}`);
      results.push({
        name: testCase.name,
        success: false,
        error: error.message
      });
    }
  }

  // Summary
  console.log();
  console.log('='.repeat(70));
  console.log('TEST SUMMARY');
  console.log('='.repeat(70));
  console.log();

  const successful = results.filter(r => r.success).length;
  const total = results.length;

  console.log(`Total Reviews: ${total}`);
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${total - successful}`);
  console.log(`Success Rate: ${((successful / total) * 100).toFixed(1)}%`);
  console.log();

  if (successful === total) {
    console.log('🎉 All code reviews completed successfully!');
    console.log();
    console.log('Gemini Integration Status:');
    console.log('  - API Connection: ✅ Operational');
    console.log('  - Model: gemini-2.0-flash-exp');
    console.log('  - Cost: $0.00 (Free Tier)');
    console.log('  - Rate Limits: 60/min, 1,000/day');
    console.log();
    console.log('✅ Ready for GitHub Actions integration!');
  } else {
    console.log('⚠️  Some reviews failed. Check errors above.');
  }

  console.log();
  console.log('='.repeat(70));

  return successful === total ? 0 : 1;
}

// Run tests
runCodeReviewTests()
  .then(exitCode => process.exit(exitCode))
  .catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
