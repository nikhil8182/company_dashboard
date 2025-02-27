from flask import Flask, render_template, jsonify
import requests
import threading
import time
import random
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
socketio = SocketIO(app, cors_allowed_origins="*")

# API URLs
CAMPAIGNS_API_URL = "http://65.2.187.240:9000/campaigns"

# Flag to control background thread
thread_stop_event = threading.Event()

# Get campaign data from API
def get_campaign_data():
    # Sample data for development/fallback
    sample_data = {
        "campaigns": [
            {
                "campaign_name": "Tamil New",
                "spend": 652.8,
                "impressions": 3599,
                "clicks": 43,
                "leads": 6,
                "cpl": 108.8
            },
            {
                "campaign_name": "TC Hiring campaign - Current",
                "spend": 530.72,
                "impressions": 11059,
                "clicks": 67,
                "leads": 13,
                "cpl": 40.82
            },
            {
                "campaign_name": "PR Current",
                "spend": 543.17,
                "impressions": 9112,
                "clicks": 55,
                "leads": 8,
                "cpl": 67.9
            },
            {
                "campaign_name": "Tamil Ad Campaign Preference",
                "spend": 780.73,
                "impressions": 5872,
                "clicks": 46,
                "leads": 5,
                "cpl": 156.15
            },
            {
                "campaign_name": "No Chennai Campaign - Question Media",
                "spend": 1413.11,
                "impressions": 16675,
                "clicks": 80,
                "leads": 5,
                "cpl": 282.62
            },
            {
                "campaign_name": "Whole Tamil Nadu - Question Media",
                "spend": 838.11,
                "impressions": 9933,
                "clicks": 73,
                "leads": 1,
                "cpl": 838.11
            },
            {
                "campaign_name": "Thasleem  AD Campaign New",
                "spend": 1751.88,
                "impressions": 14065,
                "clicks": 62,
                "leads": 7,
                "cpl": 250.27
            },
            {
                "campaign_name": "Bangalore Campaign",
                "spend": 335.07,
                "impressions": 1635,
                "clicks": 14,
                "leads": 3,
                "cpl": 111.69
            },
            {
                "campaign_name": "Common Campaign New",
                "spend": 794.62,
                "impressions": 5693,
                "clicks": 33,
                "leads": 4,
                "cpl": 198.66
            },
            {
                "campaign_name": "Akshya New Campaign",
                "spend": 812.66,
                "impressions": 8748,
                "clicks": 52,
                "leads": 5,
                "cpl": 162.53
            },
            {
                "campaign_name": "FEB SH 4000rs Campaign",
                "spend": 1504.08,
                "impressions": 6892,
                "clicks": 37,
                "leads": 2,
                "cpl": 752.04
            },
            {
                "campaign_name": "Boom Barrier 25/02",
                "spend": 315.16,
                "impressions": 2526,
                "clicks": 11,
                "leads": 0,
                "cpl": 0
            }
        ],
        "total_spend": 10272.11,
        "total_leads": 59,
        "avg_cpl": 174.1,
        "currency": "INR"
    }
    
    # Try to get data from API
    try:
        response = requests.get(CAMPAIGNS_API_URL)
        if response.status_code == 200:
            return response.json()
    except Exception as e:
        print(f"Error fetching campaigns: {e}")
    
    # Simulate small random changes to make the data appear "live"
    # Adjust total values
    sample_data["total_leads"] = max(0, sample_data["total_leads"] + random.randint(-1, 2))
    sample_data["total_spend"] = round(sample_data["total_spend"] * (1 + random.uniform(-0.01, 0.02)), 2)
    
    # Adjust campaign values
    for campaign in sample_data["campaigns"]:
        # 30% chance of changing values
        if random.random() < 0.3:
            # Adjust leads (small changes)
            campaign["leads"] = max(0, campaign["leads"] + random.choice([0, 0, 0, 1, -1]))
            
            # Adjust spend (small percentage changes)
            spend_change = random.uniform(-0.02, 0.03)  # -2% to +3%
            campaign["spend"] = round(campaign["spend"] * (1 + spend_change), 2)
            
            # Adjust impressions and clicks
            impression_change = random.uniform(-0.01, 0.05)  # -1% to +5%
            campaign["impressions"] = max(0, int(campaign["impressions"] * (1 + impression_change)))
            
            click_change = random.uniform(-0.02, 0.04)  # -2% to +4%
            campaign["clicks"] = max(0, int(campaign["clicks"] * (1 + click_change)))
            
            # Recalculate CPL
            if campaign["leads"] > 0:
                campaign["cpl"] = round(campaign["spend"] / campaign["leads"], 2)
            else:
                campaign["cpl"] = 0
    
    # Recalculate total metrics...
    total_spend = sum(campaign["spend"] for campaign in sample_data["campaigns"])
    total_leads = sum(campaign["leads"] for campaign in sample_data["campaigns"])
    
    sample_data["total_spend"] = round(total_spend, 2)
    sample_data["total_leads"] = total_leads
    
    if total_leads > 0:
        sample_data["avg_cpl"] = round(total_spend / total_leads, 2)
    else:
        sample_data["avg_cpl"] = 0
    
    return sample_data

# Background thread that sends data to clients
def background_thread():
    count = 0
    while not thread_stop_event.is_set():
        socketio.sleep(60)  # Send update every 60 seconds (1 minute)
        count += 1
        try:
            # Get updated campaign data
            campaign_data = get_campaign_data()
            # Emit the data to all connected clients
            socketio.emit('update_campaigns', {'data': campaign_data, 'count': count})
        except Exception as e:
            print(f"Error in background thread: {e}")

# Route for main page
@app.route('/')
def index():
    return render_template('index.html', title='Company Dashboard')

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
@app.route('/api/campaigns')
def get_campaigns():
    try:
        return jsonify(get_campaign_data())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Socket.IO event handlers
@socketio.on('connect')
def connect():
    global thread
    print('Client connected')
    
    # Start background thread if not already running
    if not thread_stop_event.is_set():
        thread = socketio.start_background_task(background_thread)

@socketio.on('disconnect')
def disconnect():
    print('Client disconnected')

# Run the app
if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=7700, allow_unsafe_werkzeug=True)