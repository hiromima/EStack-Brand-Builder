#!/usr/bin/env python3
"""
Start Chroma server with telemetry disabled
"""
import os

# Disable telemetry to avoid dependency issues
os.environ['ANONYMIZED_TELEMETRY'] = 'False'
os.environ['IS_PERSISTENT'] = 'TRUE'
os.environ['PERSIST_DIRECTORY'] = './chroma_db'
os.environ['ALLOW_RESET'] = 'TRUE'

import uvicorn

print("✅ Starting Chroma server on http://localhost:8000")
print("   Telemetry: DISABLED")
print("   Storage: ./chroma_db")
print("   Press Ctrl+C to stop\n")

uvicorn.run(
    "chromadb.app:app",
    host="0.0.0.0",
    port=8000,
    log_level="info",
    reload=False
)
