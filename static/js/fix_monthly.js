// Script to fix monthly button
document.addEventListener('DOMContentLoaded', function() {
    console.log("Monthly button fix loading...");
    
    // Direct DOM manipulation to ensure monthly button works
    const monthlyBtn = document.getElementById('monthlyBtn');
    if (monthlyBtn) {
        console.log("Found monthly button, attaching new click handler");
        
        // Remove existing click handlers by cloning the element
        const newMonthlyBtn = monthlyBtn.cloneNode(true);
        monthlyBtn.parentNode.replaceChild(newMonthlyBtn, monthlyBtn);
        
        // Add new click handler
        newMonthlyBtn.addEventListener('click', function(e) {
            console.log("Monthly button clicked");
            
            // Remove active class from all buttons
            document.getElementById('todayBtn').classList.remove('active');
            document.getElementById('yesterdayBtn').classList.remove('active');
            newMonthlyBtn.classList.add('active');
            
            // Determine which page we're on
            const isPrPage = window.location.pathname.includes('pr_data');
            
            // Make the API call
            const apiUrl = isPrPage ? 
                '/api/pr_data?filter_type=this_month' : 
                '/api/tc_data?filter_type=this_month';
                
            console.log("Fetching monthly data from: " + apiUrl);
            
            // Show spinner if it exists
            const spinner = document.getElementById('spinner');
            if (spinner) spinner.classList.remove('d-none');
            
            fetch(apiUrl)
                .then(response => {
                    if (\!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("Monthly data received");
                    
                    // Call the appropriate update functions
                    if (isPrPage && typeof updatePRDataTable === 'function') {
                        updatePRDataTable(data);
                        updateSummaryCards(data);
                    } else if (\!isPrPage && typeof updateTCDataTable === 'function') {
                        updateTCDataTable(data);
                        updateSummaryCards(data);
                    } else {
                        console.error("Could not find update functions");
                        location.reload(); // Reload as fallback
                    }
                    
                    // Update last updated timestamp
                    const lastUpdated = document.getElementById('lastUpdated');
                    if (lastUpdated) lastUpdated.textContent = new Date().toLocaleTimeString();
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Error loading monthly data. Please try again.');
                })
                .finally(() => {
                    // Hide spinner
                    if (spinner) spinner.classList.add('d-none');
                });
        });
        
        console.log("Monthly button handler attached");
    } else {
        console.warn("Monthly button not found");
    }
});
