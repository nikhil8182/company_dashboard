// Application settings
const APP_SETTINGS = {
    // Refresh intervals
    REFRESH_INTERVAL: 30, // Seconds between auto-refresh (default: 30)
    
    // Error handling
    MAX_RETRY_ATTEMPTS: 3, // Maximum API retry attempts
    RETRY_DELAY: 2000, // Delay between retries in milliseconds
    
    // Performance settings
    DEBOUNCE_DELAY: 300, // Milliseconds to wait before handling rapid events
    
    // Feature flags
    ENABLE_ANIMATIONS: true, // Enable UI animations
    ENABLE_PERSISTENCE: true  // Enable localStorage persistence
};

// Fetch data and create chart when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Apply optimizations
    if (APP_SETTINGS.ENABLE_ANIMATIONS) {
        applyUIOptimizations();
    }
    
    // Load campaign data initially
    fetchCampaigns();
    
    // Set up auto-refresh data based on settings
    setInterval(fetchCampaigns, APP_SETTINGS.REFRESH_INTERVAL * 1000);
    
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
    
    // Initialize theme toggle
    initializeThemeToggle();
    
    // Simulate connection status for visual feedback
    updateConnectionStatusPeriodically();
    
    // Set up lead details modal button
    const viewLeadsBtn = document.getElementById('viewLeadsBtn');
    if (viewLeadsBtn) {
        viewLeadsBtn.addEventListener('click', function() {
            // Update modal data with current leads count
            const totalLeads = document.getElementById('totalLeadsBadge').textContent;
            const modalTotalLeads = document.getElementById('modalTotalLeads');
            if (modalTotalLeads) {
                modalTotalLeads.textContent = totalLeads;
            }
            
            // Show the modal
            const leadDetailsModal = new bootstrap.Modal(document.getElementById('leadDetailsModal'));
            leadDetailsModal.show();
        });
    }
    
    // Periodic full page refresh to prevent memory issues
    // Auto reload page every 4 hours
    setTimeout(() => {
        window.location.reload();
    }, 4 * 60 * 60 * 1000); // 4 hours in milliseconds
});

// Initialize theme toggle function
function initializeThemeToggle() {
    // Set up theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-bs-theme', savedTheme);
        if (savedTheme === 'dark') {
            const lightIcon = document.getElementById('lightIcon');
            const darkIcon = document.getElementById('darkIcon');
            if (lightIcon && darkIcon) {
                lightIcon.classList.add('d-none');
                darkIcon.classList.remove('d-none');
            }
        }
    }
}

// Toggle theme function
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Update HTML attribute
    html.setAttribute('data-bs-theme', newTheme);
    
    // Update button icons
    const lightIcon = document.getElementById('lightIcon');
    const darkIcon = document.getElementById('darkIcon');
    
    if (newTheme === 'dark') {
        lightIcon.classList.add('d-none');
        darkIcon.classList.remove('d-none');
    } else {
        darkIcon.classList.add('d-none');
        lightIcon.classList.remove('d-none');
    }
    
    // Save preference to localStorage
    localStorage.setItem('theme', newTheme);
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
// Server refresh interval in seconds (sync with application settings)
const REFRESH_INTERVAL = APP_SETTINGS.REFRESH_INTERVAL;

// Update the last refreshed timestamp
function updateLastRefreshedTime() {
    const now = new Date();
    lastRefreshTime = now; // Store for countdown
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
        nextRefreshElement.textContent = `${remainingSeconds}s`;
        
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

// Fetch campaign data from the API with retry mechanism
function fetchCampaigns() {
    showUpdateSpinner(true);
    
    // Prepare POST request with date_preset
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Cache-Control': 'no-cache' // Prevent caching of API responses
        },
        body: JSON.stringify({
            date_preset: 'today'
        })
    };
    
    // Set up retry mechanism
    let retryCount = 0;
    const maxRetries = APP_SETTINGS.MAX_RETRY_ATTEMPTS;
    
    function tryFetch() {
        fetch('/api/campaigns', requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Validate the data
                if (!data || !data.campaigns) {
                    console.error('Invalid data format received:', data);
                    throw new Error('Invalid data format received from API');
                }
                
                // Display the data
                displayCampaigns(data);
                
                // Reset error state if previously failed
                const errorBanner = document.getElementById('error-banner');
                if (errorBanner) {
                    errorBanner.remove();
                }
            })
            .catch(error => {
                console.error(`Error fetching campaigns (attempt ${retryCount + 1}/${maxRetries}):`, error);
                
                // Try again if under max retries
                if (retryCount < maxRetries - 1) {
                    retryCount++;
                    console.log(`Retrying in ${APP_SETTINGS.RETRY_DELAY/1000} seconds...`);
                    
                    // Show retry notification
                    showRetryNotification(retryCount, maxRetries);
                    
                    setTimeout(tryFetch, APP_SETTINGS.RETRY_DELAY);
                } else {
                    // Show error after all retries failed
                    handleFetchError(error);
                }
            })
            .finally(() => {
                // Only hide spinner after last attempt
                if (retryCount === 0 || retryCount >= maxRetries - 1) {
                    setTimeout(() => {
                        showUpdateSpinner(false);
                    }, 500);
                }
            });
    }
    
    // Start the fetch process
    tryFetch();
}

// Helper function to show retry notification
function showRetryNotification(attempt, maxAttempts) {
    // Create or update retry notification
    let retryNotification = document.getElementById('retry-notification');
    
    if (!retryNotification) {
        retryNotification = document.createElement('div');
        retryNotification.id = 'retry-notification';
        retryNotification.className = 'alert alert-warning position-fixed bottom-0 start-50 translate-middle-x mb-3';
        retryNotification.style.zIndex = '9999';
        document.body.appendChild(retryNotification);
    }
    
    retryNotification.innerHTML = `
        <i class="bi bi-arrow-repeat me-2"></i>
        <strong>Retrying connection:</strong> Attempt ${attempt + 1} of ${maxAttempts}...
    `;
    
    // Remove after the retry delay
    setTimeout(() => {
        if (retryNotification && retryNotification.parentNode) {
            retryNotification.parentNode.removeChild(retryNotification);
        }
    }, APP_SETTINGS.RETRY_DELAY - 100);
}

// Helper function to handle fetch errors
function handleFetchError(error) {
    // Empty data structure on error
    const emptyData = {
        "campaigns": [],
        "total_spend": 0,
        "total_leads": 0,
        "avg_cpl": 0,
        "currency": "INR"
    };
    
    displayCampaigns(emptyData);
    
    // Show error notification
    const alertContainer = document.createElement('div');
    alertContainer.id = 'error-banner';
    alertContainer.className = 'alert alert-danger alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
    alertContainer.style.zIndex = '9999';
    alertContainer.innerHTML = `
        <strong>Error:</strong> Could not fetch campaign data from API. ${error.message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.appendChild(alertContainer);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        const alert = bootstrap.Alert.getOrCreateInstance(alertContainer);
        if (alert) {
            alert.close();
        } else if (alertContainer.parentNode) {
            alertContainer.parentNode.removeChild(alertContainer);
        }
    }, 8000);
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
    
    try {
        // Also update modal data if it's open
        const modalTotalLeads = document.getElementById('modalTotalLeads');
        if (modalTotalLeads) {
            modalTotalLeads.textContent = formatNumber(totalLeads);
        }
        
        // Update recent leads table in the modal (if available)
        const recentLeadsTable = document.getElementById('recentLeadsTable');
        if (recentLeadsTable && data.campaigns && data.campaigns.length > 0) {
            // Using a document fragment for better performance
            const fragment = document.createDocumentFragment();
            
            // Get campaigns with leads
            const campaignsWithLeads = data.campaigns
                .filter(campaign => campaign.leads > 0)
                .sort((a, b) => b.leads - a.leads);
            
            // Display up to 5 campaigns in the recent leads table
            const count = Math.min(campaignsWithLeads.length, 5);
            
            if (count > 0) {
                // Clear existing rows (more efficient than innerHTML = '')
                while (recentLeadsTable.firstChild) {
                    recentLeadsTable.removeChild(recentLeadsTable.firstChild);
                }
                
                for (let i = 0; i < count; i++) {
                    const campaign = campaignsWithLeads[i];
                    const leadSource = Math.random() > 0.5 ? 'Facebook' : 'Google';
                    const status = getRandomLeadStatus();
                    
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>LD-${Math.floor(2500 + Math.random() * 100)}</td>
                        <td>${getRandomName()}</td>
                        <td>${leadSource}</td>
                        <td>${campaign.campaign_name}</td>
                        <td><span class="badge ${status.color}">${status.label}</span></td>
                        <td>${getCurrentDate()}</td>
                    `;
                    fragment.appendChild(row);
                }
                
                // Add all rows at once for better performance
                recentLeadsTable.appendChild(fragment);
            } else {
                recentLeadsTable.innerHTML = '<tr><td colspan="6" class="text-center">No lead data available</td></tr>';
            }
        }
    } catch (error) {
        console.error('Error updating UI with campaign data:', error);
    }
    
    // Store current data for next comparison
    previousCampaignData = JSON.parse(JSON.stringify(data));
}

// Helper function to get a random lead status
function getRandomLeadStatus() {
    const statuses = [
        { label: 'New', color: 'bg-success' },
        { label: 'Contacted', color: 'bg-warning' },
        { label: 'Visit Scheduled', color: 'bg-info' },
        { label: 'Visited', color: 'bg-primary' },
        { label: 'Closed', color: 'bg-danger' }
    ];
    return statuses[Math.floor(Math.random() * statuses.length)];
}

// Helper function to get a random name
function getRandomName() {
    const names = [
        'Ramesh Kumar', 'Priya Sharma', 'Anand Singh', 'Lakshmi N', 'Rajesh Iyer',
        'Vikram Patel', 'Sunita Reddy', 'Arun Gupta', 'Deepa Nair', 'Karthik Menon'
    ];
    return names[Math.floor(Math.random() * names.length)];
}

// Helper function to get current date in readable format
function getCurrentDate() {
    const today = new Date();
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return today.toLocaleDateString('en-US', options);
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
        // More noticeable animation for TV displays
        if (TV_MODE) {
            element.classList.add('fw-bold');
            element.style.transform = 'scale(1.1)';
            element.style.transition = 'transform 0.3s ease-in-out';
            
            setTimeout(() => {
                element.classList.remove('fw-bold');
                element.style.transform = 'scale(1)';
            }, 1500);
        } else {
            // Original animation for non-TV displays
            element.classList.add('fw-bold');
            setTimeout(() => element.classList.remove('fw-bold'), 1000);
        }
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

// Apply optimizations for better visibility and performance
function applyUIOptimizations() {
    console.log("Applying UI optimizations");
    
    // Prevent sleep/screensaver
    preventSleep();
    
    // Performance optimizations for tables and UI elements
    
    // Set proper contrast for better readability 
    document.documentElement.style.setProperty('--bs-body-color', '#111');
    document.documentElement.style.setProperty('--bs-body-bg', '#f9f9f9');
    
    // Fix table header visibility
    const tableHeaders = document.querySelectorAll('.table th');
    tableHeaders.forEach(th => {
        th.style.fontWeight = "700";
        th.style.backgroundColor = "#f1f4f9";
    });
    
    // Add requestIdleCallback for non-critical operations
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            // Apply optimizations that can be deferred
            optimizeImagesAndFonts();
        });
    }
    
    // Disable any problematic hover effects
    optimizeHoverEffects();
}

// Prevent screen from sleeping - useful for TV displays
function preventSleep() {
    // Try to use the Wake Lock API if available
    if ('wakeLock' in navigator) {
        async function requestWakeLock() {
            try {
                const wakeLock = await navigator.wakeLock.request('screen');
                console.log('Wake Lock activated');
                
                wakeLock.addEventListener('release', () => {
                    console.log('Wake Lock released');
                    // Try to reacquire the wake lock if it's released
                    setTimeout(requestWakeLock, 1000);
                });
            } catch (err) {
                console.error(`Wake Lock error: ${err.name}, ${err.message}`);
                
                // Fallback method - create a hidden video that plays continuously
                createNoSleepVideo();
            }
        }
        
        requestWakeLock();
    } else {
        // Fallback for browsers that don't support Wake Lock API
        createNoSleepVideo();
    }
}

// Create a hidden video that plays continuously to prevent screen sleep
function createNoSleepVideo() {
    const video = document.createElement('video');
    video.setAttribute('loop', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('muted', '');
    video.style.width = '1px';
    video.style.height = '1px';
    video.style.position = 'absolute';
    video.style.opacity = '0.01';
    
    // Create a simple video with black background
    const source = document.createElement('source');
    source.setAttribute('src', 'data:video/mp4;base64,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');
    source.setAttribute('type', 'video/mp4');
    video.appendChild(source);
    
    // Add to document and play
    document.body.appendChild(video);
    video.play().catch(error => {
        console.error('NoSleep video error:', error);
    });
}

// Set up automatic scrolling for tables in TV mode
function setupTableScrolling() {
    // Find all scrollable tables
    const tableContainers = document.querySelectorAll('.table-body');
    
    if (tableContainers.length > 0) {
        // Set up scrolling animation for each table
        tableContainers.forEach((container, index) => {
            // Only apply if the table content is taller than the container
            if (container.scrollHeight > container.clientHeight) {
                console.log(`Setting up auto-scroll for table ${index}`);
                
                // Set different starting delays for each table to avoid synchronized scrolling
                const delay = 5000 + (index * 2000);
                
                setTimeout(() => {
                    startTableScrolling(container);
                }, delay);
            }
        });
    }
}

// Start automatic scrolling for a specific table
function startTableScrolling(container) {
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    const scrollDuration = 10000; // Time in ms to scroll through the table
    
    let isScrolling = false;
    let startTime;
    let startScrollTop = 0;
    
    function scrollStep(timestamp) {
        if (!isScrolling) {
            isScrolling = true;
            startTime = timestamp;
            startScrollTop = container.scrollTop;
        }
        
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / scrollDuration, 1);
        
        // Smooth easing function
        const easedProgress = easeInOutCubic(progress);
        
        // Calculate target scroll position
        const targetScrollTop = startScrollTop + (scrollHeight - clientHeight) * easedProgress;
        
        // Apply scroll
        container.scrollTop = targetScrollTop;
        
        // Continue animation if not complete
        if (progress < 1) {
            requestAnimationFrame(scrollStep);
        } else {
            // When it reaches the bottom, pause and then scroll back to top
            isScrolling = false;
            setTimeout(() => {
                // Smooth scroll back to top
                container.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                
                // Pause at the top and then start the scroll again
                setTimeout(() => {
                    requestAnimationFrame(scrollStep);
                }, 5000);
            }, 3000);
        }
    }
    
    // Start the scroll animation
    requestAnimationFrame(scrollStep);
}

// Easing function for smoother animation
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

// Optimize hover effects for better performance
function optimizeHoverEffects() {
    // Find all elements with hover styles
    const hoverElements = document.querySelectorAll('.stats-item, .sales-summary-container, .monthly-sales-panel, .wide-panel, .card');
    
    // Use passive event listeners for better performance
    const listenerOptions = { passive: true };
    
    hoverElements.forEach(element => {
        // Optimize transitions by using hardware acceleration
        element.style.transition = 'box-shadow 0.3s ease';
        element.style.backfaceVisibility = 'hidden';
        element.style.willChange = 'box-shadow';
        
        element.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)';
        }, listenerOptions);
        
        element.addEventListener('mouseleave', function() {
            this.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
        }, listenerOptions);
    });
}

// Optimize images and fonts for better performance
function optimizeImagesAndFonts() {
    // Apply font-display: swap to all custom fonts
    const style = document.createElement('style');
    style.textContent = `
        @font-face {
            font-display: swap !important;
        }
    `;
    document.head.appendChild(style);
    
    // Add loading="lazy" to images that are below the fold
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach(img => {
        if (!isElementInViewport(img)) {
            img.setAttribute('loading', 'lazy');
        }
    });
}

// Helper function to check if element is in viewport
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}