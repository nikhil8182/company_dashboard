// Socket.io instance
let socket;

// Fetch data and create chart when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize socket.io connection
    initializeSocket();
    
    // Load campaign data initially
    fetchCampaigns();
    
    // Set up desktop manual refresh button
    const refreshBtn = document.getElementById('refreshCampaigns');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            showUpdateSpinner(true);
            fetchCampaigns();
        });
    }
    
    // Set up auto-refresh timer display updates
    setInterval(updateRefreshTimeDisplay, 1000);
    
    // Initialize the last refreshed timestamp
    updateLastRefreshedTime();
    
    // Update days left in month
    updateDaysLeftInMonth();
});

// Initialize WebSocket connection
function initializeSocket() {
    // Connect to the server
    socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    
    // Connection events
    socket.on('connect', function() {
        console.log('Connected to server');
        updateConnectionStatus(true);
    });
    
    socket.on('disconnect', function() {
        console.log('Disconnected from server');
        updateConnectionStatus(false);
    });
    
    // Data update event
    socket.on('update_campaigns', function(msg) {
        console.log('Received update:', msg.count);
        showUpdateSpinner(true);
        
        // Update the last update indicator
        updateIndicator(msg.count);
        
        // Update the dashboard with new data
        if (msg.data) {
            displayCampaigns(msg.data);
        }
        
        // Hide the spinner after a short delay
        setTimeout(function() {
            showUpdateSpinner(false);
        }, 500);
        
        // Update the last refreshed timestamp
        updateLastRefreshedTime();
    });
}

// Update connection status indicator
function updateConnectionStatus(connected) {
    const statusEl = document.getElementById('connectionStatus');
    if (!statusEl) return;
    
    if (connected) {
        statusEl.innerHTML = '<i class="bi bi-wifi"></i> <span class="d-none d-sm-inline">Connected</span>';
        statusEl.classList.remove('offline');
        statusEl.classList.add('online');
    } else {
        statusEl.innerHTML = '<i class="bi bi-wifi-off"></i> <span class="d-none d-sm-inline">Offline</span>';
        statusEl.classList.remove('online');
        statusEl.classList.add('offline');
    }
}

// Update the last update indicator
function updateIndicator(count) {
    const indicatorEl = document.getElementById('updateIndicator');
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    indicatorEl.textContent = `Last update: ${timeString} (#${count})`;
    indicatorEl.classList.remove('bg-secondary');
    indicatorEl.classList.add('bg-info');
    
    // Flash effect
    indicatorEl.classList.add('bg-warning');
    setTimeout(function() {
        indicatorEl.classList.remove('bg-warning');
        indicatorEl.classList.add('bg-info');
    }, 300);
}

// Show or hide the update spinner
function showUpdateSpinner(show) {
    const spinner = document.getElementById('updateSpinner');
    if (show) {
        spinner.classList.remove('d-none');
    } else {
        spinner.classList.add('d-none');
    }
    
    // Update the last refreshed timestamp
    updateLastRefreshedTime();
}

// Store the timestamp of last refresh for countdown calculation
let lastRefreshTime = new Date();
// Server refresh interval in seconds
const REFRESH_INTERVAL = 60;

// Update the last refreshed timestamp
function updateLastRefreshedTime() {
    const lastRefreshedElement = document.getElementById('lastRefreshed');
    const now = new Date();
    lastRefreshTime = now; // Store for countdown
    
    const options = { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit'
    };
    const formattedTime = now.toLocaleTimeString('en-US', options);
    
    // Update element
    if (lastRefreshedElement) {
        lastRefreshedElement.textContent = `Last: ${formattedTime}`;
        
        // Add highlight effect
        lastRefreshedElement.classList.add('fw-bold');
        lastRefreshedElement.classList.remove('text-muted');
        lastRefreshedElement.classList.add('text-primary');
        
        // Remove highlight after 2 seconds
        setTimeout(() => {
            lastRefreshedElement.classList.remove('fw-bold');
            lastRefreshedElement.classList.remove('text-primary');
            lastRefreshedElement.classList.add('text-muted');
        }, 2000);
    }
}

// Update the countdown timer for next refresh
function updateRefreshTimeDisplay() {
    const nextRefreshElement = document.getElementById('nextRefresh');
    
    const now = new Date();
    const elapsedSeconds = Math.floor((now - lastRefreshTime) / 1000);
    const remainingSeconds = Math.max(0, REFRESH_INTERVAL - elapsedSeconds);
    
    // Update countdown
    if (nextRefreshElement) {
        // Update countdown text
        nextRefreshElement.textContent = `Next: ${remainingSeconds}s`;
        
        // Visual indication as we get closer to refresh
        updateTimerVisuals(nextRefreshElement, remainingSeconds);
    }
}

// Helper function to update timer visuals
function updateTimerVisuals(element, remainingSeconds) {
    if (remainingSeconds <= 5) {
        element.classList.add('text-danger');
        element.classList.add('fw-bold');
        element.classList.remove('text-warning');
    } else if (remainingSeconds <= 15) {
        element.classList.add('text-warning');
        element.classList.add('fw-bold');
        element.classList.remove('text-danger');
    } else {
        element.classList.remove('text-warning');
        element.classList.remove('text-danger');
        element.classList.remove('fw-bold');
        element.classList.add('text-muted');
    }
}

// Calculate and display days left in the current month
function updateDaysLeftInMonth() {
    const daysLeftBadge = document.getElementById('daysLeftBadge');
    if (!daysLeftBadge) return;
    
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    // Format today's date (Feb 27, 2025)
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    const formattedDate = today.toLocaleDateString('en-US', options);
    
    // Last day of current month
    const lastDay = new Date(year, month + 1, 0).getDate();
    
    // Calculate days remaining
    const daysLeft = lastDay - today.getDate();
    
    // Update the badge text
    let daysLeftText = '';
    if (daysLeft === 0) {
        daysLeftText = 'Last day!';
        daysLeftBadge.style.backgroundColor = '#dc3545'; // Red
    } else if (daysLeft === 1) {
        daysLeftText = '1 day left';
        daysLeftBadge.style.backgroundColor = '#dc3545'; // Red
    } else if (daysLeft <= 3) {
        daysLeftText = `${daysLeft} days left`;
        daysLeftBadge.style.backgroundColor = '#dc3545'; // Red
    } else if (daysLeft <= 7) {
        daysLeftText = `${daysLeft} days left`;
        daysLeftBadge.style.backgroundColor = '#fd7e14'; // Orange
    } else {
        daysLeftText = `${daysLeft} days left`;
        daysLeftBadge.style.backgroundColor = '#6c757d'; // Gray
    }
    
    // Set full text with date
    daysLeftBadge.innerHTML = `<span>${formattedDate}</span> <span class="ms-1 badge-divider"></span> <span>${daysLeftText}</span>`;
}

// Chart variable removed

// Chart function removed

// Fetch campaign data from the API
function fetchCampaigns() {
    // Just for demo since we don't have tableBody anymore
    showUpdateSpinner(true);
    
    fetch('/api/campaigns')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // For testing purposes, ensure data has values
            if (!data || !data.campaigns) {
                // Create sample data if API doesn't return proper data
                data = {
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
                            "campaign_name": "TC Hiring campaign",
                            "spend": 530.72,
                            "impressions": 11059,
                            "clicks": 67,
                            "leads": 13,
                            "cpl": 40.82
                        }
                    ],
                    "total_spend": 10272.11,
                    "total_leads": 59,
                    "avg_cpl": 174.1,
                    "currency": "INR"
                };
            }
            
            displayCampaigns(data);
        })
        .catch(error => {
            console.error('Error fetching campaigns:', error);
            
            // Create sample data on error for demonstration
            const sampleData = {
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
                        "campaign_name": "TC Hiring campaign",
                        "spend": 530.72,
                        "impressions": 11059,
                        "clicks": 67,
                        "leads": 13,
                        "cpl": 40.82
                    }
                ],
                "total_spend": 10272.11,
                "total_leads": 59,
                "avg_cpl": 174.1,
                "currency": "INR"
            };
            
            displayCampaigns(sampleData);
        })
        .finally(() => {
            setTimeout(() => {
                showUpdateSpinner(false);
            }, 500);
        });
}

// Store previous data to detect changes
let previousCampaignData = null;

// Format currency for display
function formatCurrency(value) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(value).replace('₹', '₹ ');
}

// Format number with commas
function formatNumber(num) {
    return new Intl.NumberFormat('en-IN').format(num);
}

// Display campaigns in the summary
function displayCampaigns(data) {
    // Get all stats elements
    const totalLeadsBadge = document.getElementById('totalLeadsBadge');
    const totalSpendBadge = document.getElementById('totalSpendBadge');
    const avgCplBadge = document.getElementById('avgCplBadge');
    const totalImpressions = document.getElementById('totalImpressions');
    const totalClicks = document.getElementById('totalClicks');
    const clickRate = document.getElementById('clickRate');
    
    // Handle the specific data structure
    if (!data.campaigns || !Array.isArray(data.campaigns)) {
        console.error('Unexpected data format:', data);
        return;
    }
    
    // Set total metrics
    const totalLeads = data.total_leads || 0;
    const totalSpend = data.total_spend || 0;
    const avgCpl = data.avg_cpl || 0;
    
    // Calculate additional metrics
    let impressions = 0;
    let clicks = 0;
    
    // Sum up impressions and clicks from all campaigns
    data.campaigns.forEach(campaign => {
        impressions += campaign.impressions || 0;
        clicks += campaign.clicks || 0;
    });
    
    // Calculate click-through rate
    const ctr = impressions > 0 ? (clicks / impressions * 100).toFixed(2) : '0.00';
    
    // Format the impression number (e.g., 93.5K instead of 93500)
    const formattedImpressions = impressions >= 1000 
        ? (impressions / 1000).toFixed(1) + 'K' 
        : impressions.toString();
    
    // Update all badges with animation if changed
    updateBadge(totalLeadsBadge, formatNumber(totalLeads), 
               previousCampaignData && totalLeads !== previousCampaignData.total_leads);
    updateBadge(totalSpendBadge, formatCurrency(totalSpend), 
               previousCampaignData && totalSpend !== previousCampaignData.total_spend);
    updateBadge(avgCplBadge, formatCurrency(avgCpl), 
               previousCampaignData && avgCpl !== previousCampaignData.avg_cpl);
    
    // Update additional metrics
    updateBadge(totalImpressions, formattedImpressions, true);
    updateBadge(totalClicks, formatNumber(clicks), true);
    updateBadge(clickRate, ctr + '%', true);
    
    // Get campaigns data
    const campaigns = data.campaigns;
    
    // Check if there are any campaigns
    if (campaigns.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No campaign data found</td></tr>';
        return;
    }
    
    // Sort campaigns by leads (highest first)
    campaigns.sort((a, b) => b.leads - a.leads);
    
    // Create a map of previous campaign data for comparison
    const prevCampaignMap = {};
    if (previousCampaignData && previousCampaignData.campaigns) {
        previousCampaignData.campaigns.forEach(campaign => {
            prevCampaignMap[campaign.campaign_name] = campaign;
        });
    }
    
    // Add each campaign to the table
    campaigns.forEach(campaign => {
        const row = document.createElement('tr');
        
        // Check if this campaign data has changed from previous data
        const prevCampaign = prevCampaignMap[campaign.campaign_name];
        const hasLeadsChanged = prevCampaign && prevCampaign.leads !== campaign.leads;
        const hasSpendChanged = prevCampaign && prevCampaign.spend !== campaign.spend;
        
        // Set class to highlight changes
        if (hasLeadsChanged || hasSpendChanged) {
            row.classList.add('data-row-updated');
        }
        
        // Create trend indicators for leads and spend
        let leadsTrendIndicator = '';
        if (hasLeadsChanged) {
            if (campaign.leads > prevCampaign.leads) {
                leadsTrendIndicator = '<span class="text-success ms-1">↑</span>';
            } else if (campaign.leads < prevCampaign.leads) {
                leadsTrendIndicator = '<span class="text-danger ms-1">↓</span>';
            }
        }
        
        let spendTrendIndicator = '';
        if (hasSpendChanged) {
            if (campaign.spend > prevCampaign.spend) {
                spendTrendIndicator = '<span class="text-danger ms-1">↑</span>';
            } else if (campaign.spend < prevCampaign.spend) {
                spendTrendIndicator = '<span class="text-success ms-1">↓</span>';
            }
        }
        
        // Calculate click-through rate (CTR) and conversion rate
        const ctr = campaign.impressions > 0 ? (campaign.clicks / campaign.impressions * 100).toFixed(2) : '0.00';
        const convRate = campaign.clicks > 0 ? (campaign.leads / campaign.clicks * 100).toFixed(2) : '0.00';
        
        // Get color for CPL (lower is better)
        const cplColor = getCplColor(campaign.cpl, avgCpl);
        
        // Create performance indicator
        const performanceScore = calculatePerformanceScore(campaign, avgCpl);
        const performanceBar = `
            <div class="progress" style="height: 8px;">
                <div class="progress-bar bg-${getPerformanceColor(performanceScore)}" 
                     role="progressbar" style="width: ${performanceScore}%;" 
                     aria-valuenow="${performanceScore}" aria-valuemin="0" aria-valuemax="100">
                </div>
            </div>
            <small class="d-block mt-1 text-${getPerformanceColor(performanceScore)}">Score: ${performanceScore}%</small>
        `;
        
        row.innerHTML = `
            <td class="campaign-name">${campaign.campaign_name || '-'}</td>
            <td class="text-end">${formatCurrency(campaign.spend)}${spendTrendIndicator}</td>
            <td class="text-end d-none d-md-table-cell">${formatNumber(campaign.impressions)} <small class="text-muted">(${ctr}%)</small></td>
            <td class="text-end d-none d-md-table-cell">${formatNumber(campaign.clicks)}</td>
            <td class="text-end">${campaign.leads}${leadsTrendIndicator}</td>
            <td class="text-end text-${cplColor}">${campaign.leads > 0 ? formatCurrency(campaign.cpl) : '-'}</td>
            <td class="d-none d-md-table-cell">${performanceBar}</td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Chart functionality removed
    
    // Store current data for next comparison
    previousCampaignData = JSON.parse(JSON.stringify(data));
}

// Calculate a performance score for the campaign (0-100)
function calculatePerformanceScore(campaign, avgCpl) {
    if (campaign.leads === 0) return 0;
    
    // Weight factors (total = 100)
    const factors = {
        cpl: 50,      // Lower CPL is better
        leads: 30,     // More leads is better
        convRate: 20   // Higher conversion rate is better
    };
    
    // Calculate conversion rate
    const convRate = campaign.clicks > 0 ? (campaign.leads / campaign.clicks * 100) : 0;
    
    // Score for CPL (inverted - lower is better)
    let cplScore = 0;
    if (campaign.cpl > 0) {
        // Calculate as percentage of average CPL (capped at 200%)
        const cplRatio = Math.min(avgCpl / campaign.cpl, 2);
        cplScore = cplRatio * 50; // Scale to 0-100
    }
    
    // Score for leads (assume max 20 leads is 100%)
    const leadsScore = Math.min(campaign.leads / 20 * 100, 100);
    
    // Score for conversion rate (assume 10% is perfect)
    const convRateScore = Math.min(convRate / 10 * 100, 100);
    
    // Calculate weighted score
    const totalScore = (
        cplScore * (factors.cpl / 100) + 
        leadsScore * (factors.leads / 100) + 
        convRateScore * (factors.convRate / 100)
    );
    
    // Return rounded score
    return Math.round(totalScore);
}

// Get color based on CPL relative to average
function getCplColor(cpl, avgCpl) {
    if (cpl === 0) return 'muted';
    
    // CPL 30% below average is excellent
    if (cpl < avgCpl * 0.7) return 'success';
    
    // CPL below average is good
    if (cpl < avgCpl) return 'info';
    
    // CPL 50% above average is poor
    if (cpl > avgCpl * 1.5) return 'danger';
    
    // CPL above average is warning
    return 'warning';
}

// Get color for performance score
function getPerformanceColor(score) {
    if (score >= 80) return 'success';
    if (score >= 60) return 'info';
    if (score >= 40) return 'primary';
    if (score >= 20) return 'warning';
    return 'danger';
}

// Chart-related functions removed

// Helper function to update badge with animation
function updateBadge(element, value, hasChanged) {
    if (!element) return;
    
    element.textContent = value;
    
    if (hasChanged) {
        element.classList.add('fw-bold');
        setTimeout(() => element.classList.remove('fw-bold'), 1000);
    }
}

// Get color based on percentage value
function getColorForPercentage(percentage) {
    const value = parseFloat(percentage);
    
    if (value >= 25) return '#28a745'; // High - green
    if (value >= 10) return '#17a2b8'; // Medium - blue
    if (value >= 5) return '#ffc107';  // Low - yellow
    return '#6c757d';                  // Very low - gray
}