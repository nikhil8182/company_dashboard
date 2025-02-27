# Company Dashboard

A simple Flask-based dashboard application for your company.

## Setup

1. Install dependencies:
```
pip install -r requirements.txt
```

2. Run the application:
```
python app.py
```

3. Open your browser and navigate to http://127.0.0.1:5000/

## Project Structure

```
company_dashboard/
├── app.py                  # Main Flask application
├── requirements.txt        # Python dependencies
├── static/                 # Static files
│   ├── css/                
│   │   └── style.css       # Custom CSS
│   └── js/
│       └── main.js         # Custom JavaScript
└── templates/
    └── index.html          # Main dashboard template
```

## Customization

To add your company data, modify the API endpoints in `app.py` and update the frontend code accordingly.