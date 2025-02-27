# Company Dashboard

A professional Flask-based dashboard application for monitoring company performance.

## Features

- Real-time performance metrics
- Campaign performance tracking 
- Team member performance monitoring
- Light/dark mode support
- Responsive design for all devices

## Production Setup

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/company_dashboard.git
cd company_dashboard

# Build and run with Docker Compose
docker-compose up -d
```

The application will be available at http://localhost:7700

### Manual Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/company_dashboard.git
cd company_dashboard

# Set up a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run with Gunicorn (production)
gunicorn --config gunicorn.conf.py wsgi:app

# Or run with Flask (development)
python app.py
```

## Project Structure

```
company_dashboard/
├── app.py                  # Main Flask application
├── wsgi.py                 # WSGI entry point for production
├── gunicorn.conf.py        # Gunicorn configuration
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Docker Compose configuration
├── requirements.txt        # Python dependencies
├── .github/                # CI/CD workflows
├── static/                 # Static files
│   ├── css/                
│   │   └── style.css       # Custom CSS
│   └── js/
│       └── main.js         # Custom JavaScript
└── templates/
    ├── index.html          # Main dashboard template
    └── error.html          # Error page template
```

## Environment Variables

The following environment variables can be set:

- `FLASK_ENV`: Set to `production` for production environment (default) or `development`
- `SECRET_KEY`: Secret key for securing Flask sessions
- `PORT`: Port to run the application on (default: 7700)

## Security Considerations

The application implements the following security measures:

- HTTPS enforcement with HSTS
- Content Security Policy (CSP)
- XSS Protection
- Secure cookies
- Input validation
- Error handling

## Performance Optimizations

- Flask-Compress for HTTP compression
- Static asset caching
- Optimized JavaScript
- Efficient DOM operations
- Request retry mechanism

## License

MIT