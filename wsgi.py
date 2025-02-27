"""
WSGI entry point for production deployment with Gunicorn
"""

import os
from app import app

if __name__ == "__main__":
    app.run()