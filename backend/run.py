"""
run.py - Entry point for EV ChargeHub backend server
Run this file to start the FastAPI development server.
Usage: python run.py
"""
import uvicorn

if __name__ == '__main__':
    # Start the FastAPI app using uvicorn ASGI server
    # host='0.0.0.0' makes it accessible on all network interfaces
    # reload=True enables hot-reload on code changes (development only)
    uvicorn.run('app.main:app', host='0.0.0.0', port=8000, reload=True)
