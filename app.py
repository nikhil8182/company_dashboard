from flask import Flask, render_template, jsonify, request
import requests
import random
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'

# API URLs
CAMPAIGNS_API_URL = "http://65.2.187.240:9000/campaigns"
DEFAULT_DATE_PRESET = "today"

# Get campaign data from API
def get_campaign_data():
    # Try to get data from API using POST request with date_preset
    try:
        headers = {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        }
        payload = {
            'date_preset': DEFAULT_DATE_PRESET
        }
        
        response = requests.post(CAMPAIGNS_API_URL, headers=headers, json=payload)
        
        if response.status_code == 200:
            print(f"Successfully fetched campaign data from API: {response.status_code}")
            return response.json()
        else:
            print(f"API returned non-200 status: {response.status_code}")
            print(f"Response: {response.text}")
            raise Exception(f"API error: {response.status_code}")
    except Exception as e:
        print(f"Error fetching campaigns: {e}")
        # Create an empty data structure with proper format
        empty_data = {
            "campaigns": [],
            "total_spend": 0,
            "total_leads": 0,
            "avg_cpl": 0,
            "currency": "INR"
        }
        return empty_data

# Route for main page
@app.route('/')
def index():
    return render_template('index.html', title='Company Dashboard')

# Route for leads page
@app.route('/leads')
def leads():
    return render_template('leads.html', title='Lead Management')

# API route for initial chart data
@app.route('/api/data')
def get_data():
    # Placeholder for your data
    data = {
        'labels': ['January', 'February', 'March', 'April', 'May'],
        'values': [10, 25, 15, 30, 20]
    }
    return jsonify(data)

# API route for campaign data
@app.route('/api/campaigns', methods=['GET', 'POST'])
def get_campaigns():
    try:
        # Get date_preset from request if available
        date_preset = DEFAULT_DATE_PRESET
        if request.method == 'POST' and request.is_json:
            data = request.get_json()
            if 'date_preset' in data:
                date_preset = data['date_preset']
                print(f"Using date_preset from request: {date_preset}")
        
        # Pass the date_preset to the API call
        campaign_data = get_campaign_data()
        
        # Add campaign_id if missing (for campaign exclusion feature)
        if campaign_data and 'campaigns' in campaign_data:
            for i, campaign in enumerate(campaign_data['campaigns']):
                if 'campaign_id' not in campaign:
                    campaign['campaign_id'] = f"campaign-{i}"
        
        return jsonify(campaign_data)
    except Exception as e:
        print(f"Error in /api/campaigns route: {e}")
        return jsonify({"error": str(e)}), 500

# API route for leads data
@app.route('/api/leads', methods=['GET', 'POST'])
def get_leads():
    try:
        # Fetch real campaign data from the API
        try:
            headers = {
                'accept': 'application/json',
                'Content-Type': 'application/json'
            }
            payload = {
                'date_preset': DEFAULT_DATE_PRESET
            }
            
            response = requests.post(CAMPAIGNS_API_URL, headers=headers, json=payload)
            
            if response.status_code == 200:
                print(f"Successfully fetched campaign data from API: {response.status_code}")
                campaign_data = response.json()
            else:
                print(f"API returned non-200 status: {response.status_code}")
                print(f"Response: {response.text}")
                raise Exception(f"API error: {response.status_code}")
        except Exception as e:
            print(f"Error fetching campaigns: {e}")
            # Create an empty data structure with proper format
            campaign_data = {
                "campaigns": [],
                "total_spend": 0,
                "total_leads": 0,
                "avg_cpl": 0,
                "currency": "INR"
            }
        
        # Convert campaign data to leads data
        leads = []
        facebook_count = 0
        google_count = 0
        other_count = 0
        
        # Determine status based on campaign name and assign to leads
        statuses = ["New", "Contacted", "Visit Scheduled", "Visited", "Closed"]
        
        # Generate leads from campaigns
        for i, campaign in enumerate(campaign_data.get("campaigns", [])):
            campaign_name = campaign.get("campaign_name", "Unknown Campaign")
            leads_count = campaign.get("leads", 0)
            
            # For each lead in the campaign
            for j in range(leads_count):
                # Determine source (alternating between Facebook and Google)
                source = ""
                if i % 3 == 0:
                    source = "Facebook"
                    facebook_count += 1
                elif i % 3 == 1:
                    source = "Google"
                    google_count += 1
                else:
                    source = "Other"
                    other_count += 1
                
                # Determine random name
                names = ["Ramesh Kumar", "Priya Sharma", "Anand Singh", "Lakshmi N", "Rajesh Iyer", 
                         "Vikram Patel", "Sunita Reddy", "Arun Gupta", "Deepa Nair", "Karthik Menon"]
                name = names[random.randint(0, len(names) - 1)]
                
                # Determine status - distribute evenly
                status_index = (i + j) % len(statuses)
                status = statuses[status_index]
                
                # Generate a random date in February 2025
                day = random.randint(1, 28)
                date = f"Feb {day}, 2025"
                
                # Create lead
                lead = {
                    "id": f"LD-{2500 + (i * 10) + j}",
                    "name": name,
                    "phone": f"+91 {random.randint(7000000000, 9999999999)}",
                    "email": f"{name.lower().replace(' ', '.')}@example.com",
                    "source": source,
                    "campaign": campaign_name,
                    "status": status,
                    "date": date,
                    "notes": f"Interest in {campaign_name}"
                }
                leads.append(lead)
        
        # Calculate lead stats
        total = len(leads)
        new_count = len([lead for lead in leads if lead["status"] == "New"])
        contacted_count = len([lead for lead in leads if lead["status"] == "Contacted"])
        visit_scheduled_count = len([lead for lead in leads if lead["status"] == "Visit Scheduled"])
        visited_count = len([lead for lead in leads if lead["status"] == "Visited"])
        closed_count = len([lead for lead in leads if lead["status"] == "Closed"])
        
        # Prepare response
        leads_data = {
            "leads": leads,
            "lead_stats": {
                "total": total,
                "new": new_count,
                "contacted": contacted_count,
                "visit_scheduled": visit_scheduled_count,
                "visited": visited_count,
                "closed": closed_count
            },
            "source_distribution": {
                "facebook": facebook_count,
                "google": google_count,
                "other": other_count
            },
            "campaign_data": campaign_data  # Include original campaign data
        }
        
        return jsonify(leads_data)
    except Exception as e:
        print(f"Error in /api/leads route: {e}")
        return jsonify({"error": str(e)}), 500

# API endpoint to test if API is available
@app.route('/api/test-connection')
def test_connection():
    try:
        headers = {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        }
        payload = {
            'date_preset': DEFAULT_DATE_PRESET
        }
        
        response = requests.post(CAMPAIGNS_API_URL, headers=headers, json=payload)
        
        return jsonify({
            'status': 'success',
            'api_status': response.status_code,
            'api_url': CAMPAIGNS_API_URL
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e),
            'api_url': CAMPAIGNS_API_URL
        }), 500

# Add compression to Flask app
from flask_compress import Compress
compress = Compress(app)

# Run the app
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=7700)