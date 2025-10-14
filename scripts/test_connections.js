#!/usr/bin/env node

/**
 * @file test_connections.js
 * @description Test connections to Vector Store and Knowledge Graph
 * @version 1.0.0
 */

import 'dotenv/config';
import { VectorStore } from '../src/knowledge/VectorStore.js';
import { KnowledgeGraph } from '../src/knowledge/KnowledgeGraph.js';

async function testConnections() {
  console.log('\n' + '='.repeat(60));
  console.log('Connection Test: Vector Store & Knowledge Graph');
  console.log('='.repeat(60) + '\n');

  let vectorSuccess = false;
  let graphSuccess = false;

  // Test Vector Store (Pinecone)
  console.log('🔍 Testing Vector Store (Pinecone)...\n');
  try {
    const vectorStore = new VectorStore();
    vectorSuccess = await vectorStore.testConnection();
  } catch (error) {
    console.error('❌ VectorStore test failed:', error.message);
  }

  console.log('\n' + '-'.repeat(60) + '\n');

  // Test Knowledge Graph (Neo4j)
  console.log('🔍 Testing Knowledge Graph (Neo4j)...\n');
  try {
    const knowledgeGraph = new KnowledgeGraph();
    graphSuccess = await knowledgeGraph.testConnection();
    await knowledgeGraph.close();
  } catch (error) {
    console.error('❌ KnowledgeGraph test failed:', error.message);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Test Summary');
  console.log('='.repeat(60));
  console.log(`Vector Store (Pinecone): ${vectorSuccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Knowledge Graph (Neo4j): ${graphSuccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log('='.repeat(60) + '\n');

  if (vectorSuccess && graphSuccess) {
    console.log('✅ All connections successful!');
    process.exit(0);
  } else {
    console.log('❌ Some connections failed. Please check your configuration.');
    process.exit(1);
  }
}

// Run tests
testConnections().catch(error => {
  console.error('\n❌ Unexpected error:', error);
  process.exit(1);
});
