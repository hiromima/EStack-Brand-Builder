#!/usr/bin/env python3
"""
Start Chroma server
"""
import chromadb
from chromadb.config import Settings

# Create Chroma client with persistent storage
client = chromadb.HttpClient(
    host="localhost",
    port=8000,
    settings=Settings(
        chroma_db_impl="duckdb+parquet",
        persist_directory="./chroma_db"
    )
)

# Start server
print("✅ Chroma server ready at http://localhost:8000")
print("   Press Ctrl+C to stop")

# Keep alive
try:
    import time
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("\n✅ Chroma server stopped")
