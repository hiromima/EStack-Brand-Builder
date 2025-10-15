#!/usr/bin/env python3
"""
Start Chroma server using uvicorn
"""
import os
import sys

# Set environment variables for Chroma
os.environ['IS_PERSISTENT'] = 'TRUE'
os.environ['PERSIST_DIRECTORY'] = './chroma_db'
os.environ['ALLOW_RESET'] = 'TRUE'

# Import and run the Chroma FastAPI app
try:
    from chromadb.app import app
    import uvicorn

    print("✅ Starting Chroma server on http://localhost:8000")
    print("   Press Ctrl+C to stop\n")

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("   Trying alternative import method...")

    # Alternative: use chromadb.server.fastapi
    try:
        import uvicorn

        print("✅ Starting Chroma server on http://localhost:8000")
        print("   Press Ctrl+C to stop\n")

        uvicorn.run(
            "chromadb.app:app",
            host="0.0.0.0",
            port=8000,
            log_level="info"
        )
    except Exception as e2:
        print(f"❌ Failed to start server: {e2}")
        sys.exit(1)
