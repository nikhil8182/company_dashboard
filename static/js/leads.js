// Global variables
let sourceChart = null;
let leadsData = [];

// Initialize page when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Update connection status
    updateConnectionStatus(true);
    
    // Fetch lead data
    fetchLeadData();
    
    // Set up refresh button
    const refreshBtn = document.getElementById('refreshLeads');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            showSpinner(true);
            fetchLeadData();
        });
    }
    
    // Set up save lead button
    const saveLeadBtn = document.getElementById('saveLeadBtn');
    if (saveLeadBtn) {
        saveLeadBtn.addEventListener('click', function() {
            saveNewLead();
        });
    }
    
    // Set up update lead button
    const updateLeadBtn = document.getElementById('updateLeadBtn');
    if (updateLeadBtn) {
        updateLeadBtn.addEventListener('click', function() {
            updateLead();
        });
    }
});

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

// Show or hide the spinner
function showSpinner(show) {
    const spinner = document.getElementById('updateSpinner');
    if (spinner) {
        spinner.classList.toggle('d-none', !show);
    }
}

// Fetch lead data from API
function fetchLeadData() {
    showSpinner(true);
    
    fetch('/api/leads')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Store the data
            leadsData = data.leads;
            
            // Update all UI components
            updateLeadsTable(data.leads);
            updateLeadStats(data.lead_stats);
            updateSourceChart(data.source_distribution);
            updateConversionFunnel(data.lead_stats);
            
            // Update campaign data display
            if (data.campaign_data) {
                updateCampaignData(data.campaign_data);
            }
            
            // Update last updated time
            document.getElementById('lastUpdated').textContent = new Date().toLocaleTimeString();
            
            // Set up auto-refresh every 60 seconds
            setTimeout(fetchLeadData, 60000);
        })
        .catch(error => {
            console.error('Error fetching lead data:', error);
            showError('Failed to load lead data. Please try again.');
            
            // Even on error, try again after 60 seconds
            setTimeout(fetchLeadData, 60000);
        })
        .finally(() => {
            showSpinner(false);
        });
}

// Format currency for display
function formatCurrency(value) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(value).replace('₹', '₹ ');
}

// Update campaign data display
function updateCampaignData(campaignData) {
    // Update summary numbers
    document.getElementById('campaignTotalSpend').textContent = formatCurrency(campaignData.total_spend || 0);
    document.getElementById('campaignTotalLeads').textContent = campaignData.total_leads || 0;
    document.getElementById('campaignAvgCpl').textContent = formatCurrency(campaignData.avg_cpl || 0);
    
    // Update campaign table
    const tableBody = document.getElementById('campaignTableBody');
    if (!tableBody) return;
    
    if (!campaignData.campaigns || campaignData.campaigns.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="3" class="text-center">No campaign data available</td></tr>';
        return;
    }
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Sort campaigns by leads (descending)
    const sortedCampaigns = [...campaignData.campaigns].sort((a, b) => b.leads - a.leads);
    
    // Add each campaign to the table
    sortedCampaigns.forEach(campaign => {
        const row = document.createElement('tr');
        
        // Determine CPL color based on average
        const avgCpl = campaignData.avg_cpl || 0;
        let cplClass = '';
        if (campaign.cpl < avgCpl * 0.8) {
            cplClass = 'text-success fw-bold';
        } else if (campaign.cpl > avgCpl * 1.2) {
            cplClass = 'text-danger fw-bold';
        }
        
        row.innerHTML = `
            <td class="text-truncate" style="max-width: 180px;" title="${campaign.campaign_name}">${campaign.campaign_name}</td>
            <td class="text-end fw-medium">${campaign.leads}</td>
            <td class="text-end ${cplClass}">${formatCurrency(campaign.cpl)}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Update the leads table
function updateLeadsTable(leads) {
    const tableBody = document.getElementById('leadsTableBody');
    
    if (!leads || leads.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No leads available</td></tr>';
        return;
    }
    
    // Clear the table
    tableBody.innerHTML = '';
    
    // Add each lead to the table
    leads.forEach(lead => {
        const row = document.createElement('tr');
        
        // Determine the badge color based on status
        let badgeClass = 'bg-secondary';
        switch(lead.status) {
            case 'New': badgeClass = 'bg-success'; break;
            case 'Contacted': badgeClass = 'bg-warning'; break;
            case 'Visit Scheduled': badgeClass = 'bg-info'; break;
            case 'Visited': badgeClass = 'bg-primary'; break;
            case 'Closed': badgeClass = 'bg-danger'; break;
        }
        
        row.innerHTML = `
            <td>${lead.id}</td>
            <td>${lead.name}</td>
            <td>${lead.source}</td>
            <td>${lead.campaign}</td>
            <td><span class="badge ${badgeClass}">${lead.status}</span></td>
            <td>${lead.date}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary view-lead" data-id="${lead.id}">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-lead" data-id="${lead.id}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-lead').forEach(button => {
        button.addEventListener('click', function() {
            const leadId = this.getAttribute('data-id');
            viewLeadDetails(leadId);
        });
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-lead').forEach(button => {
        button.addEventListener('click', function() {
            const leadId = this.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this lead?')) {
                deleteLead(leadId);
            }
        });
    });
}

// Update the lead statistics cards
function updateLeadStats(stats) {
    if (!stats) return;
    
    // Update the counts in each card
    document.getElementById('totalLeads').textContent = stats.total;
    document.getElementById('newLeads').textContent = stats.new;
    document.getElementById('contactedLeads').textContent = stats.contacted;
    document.getElementById('visitScheduledLeads').textContent = stats.visit_scheduled;
    document.getElementById('visitedLeads').textContent = stats.visited;
    document.getElementById('closedLeads').textContent = stats.closed;
    
    // Calculate and update progress percentages
    const total = stats.total;
    if (total > 0) {
        document.getElementById('newLeadsProgress').style.width = `${(stats.new / total) * 100}%`;
        document.getElementById('contactedLeadsProgress').style.width = `${(stats.contacted / total) * 100}%`;
        document.getElementById('visitScheduledLeadsProgress').style.width = `${(stats.visit_scheduled / total) * 100}%`;
        document.getElementById('visitedLeadsProgress').style.width = `${(stats.visited / total) * 100}%`;
        document.getElementById('closedLeadsProgress').style.width = `${(stats.closed / total) * 100}%`;
    }
}

// Update the source distribution chart
function updateSourceChart(sourceData) {
    if (!sourceData) return;
    
    const ctx = document.getElementById('sourceChart').getContext('2d');
    
    // Destroy previous chart if it exists
    if (sourceChart) {
        sourceChart.destroy();
    }
    
    // Create new chart
    sourceChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Facebook', 'Google', 'Other'],
            datasets: [{
                label: 'Lead Sources',
                data: [sourceData.facebook, sourceData.google, sourceData.other],
                backgroundColor: [
                    'rgba(66, 103, 178, 0.8)',  // Facebook blue
                    'rgba(219, 68, 55, 0.8)',   // Google red
                    'rgba(108, 117, 125, 0.8)'  // Gray for Other
                ],
                borderColor: [
                    'rgba(66, 103, 178, 1)',
                    'rgba(219, 68, 55, 1)',
                    'rgba(108, 117, 125, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Update the conversion funnel
function updateConversionFunnel(stats) {
    if (!stats) return;
    
    const total = stats.new;
    if (total === 0) return;
    
    // Update the funnel bars with actual values and widths
    document.getElementById('funnelNewBar').textContent = stats.new;
    document.getElementById('funnelNewBar').style.width = '100%';
    
    document.getElementById('funnelContactedBar').textContent = stats.contacted;
    document.getElementById('funnelContactedBar').style.width = `${(stats.contacted / stats.new) * 100}%`;
    
    document.getElementById('funnelVisitScheduledBar').textContent = stats.visit_scheduled;
    document.getElementById('funnelVisitScheduledBar').style.width = `${(stats.visit_scheduled / stats.new) * 100}%`;
    
    document.getElementById('funnelVisitedBar').textContent = stats.visited;
    document.getElementById('funnelVisitedBar').style.width = `${(stats.visited / stats.new) * 100}%`;
    
    document.getElementById('funnelClosedBar').textContent = stats.closed;
    document.getElementById('funnelClosedBar').style.width = `${(stats.closed / stats.new) * 100}%`;
}

// Show error message
function showError(message) {
    const alertContainer = document.createElement('div');
    alertContainer.className = 'alert alert-danger alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
    alertContainer.style.zIndex = '9999';
    alertContainer.innerHTML = `
        <strong>Error:</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.appendChild(alertContainer);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        const alert = bootstrap.Alert.getOrCreateInstance(alertContainer);
        alert.close();
    }, 5000);
}

// View lead details
function viewLeadDetails(leadId) {
    // Find the lead in our data
    const lead = leadsData.find(lead => lead.id === leadId);
    
    if (!lead) {
        showError('Lead not found');
        return;
    }
    
    // Populate the modal with lead details
    document.getElementById('detailLeadId').textContent = lead.id;
    document.getElementById('detailLeadName').textContent = lead.name;
    document.getElementById('detailLeadPhone').textContent = lead.phone;
    document.getElementById('detailLeadEmail').textContent = lead.email;
    document.getElementById('detailLeadSource').textContent = lead.source;
    document.getElementById('detailLeadCampaign').textContent = lead.campaign;
    document.getElementById('detailLeadStatus').value = lead.status;
    document.getElementById('detailLeadDate').textContent = lead.date;
    document.getElementById('detailLeadNotes').value = lead.notes;
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('leadDetailsModal'));
    modal.show();
}

// Save a new lead
function saveNewLead() {
    // In a real application, this would make an API call to save the lead
    // For this example, we'll just show a success message and refresh the data
    
    // Validate form
    const name = document.getElementById('leadName').value.trim();
    const phone = document.getElementById('leadPhone').value.trim();
    const source = document.getElementById('leadSource').value;
    
    if (!name || !phone || !source) {
        showError('Please fill in all required fields');
        return;
    }
    
    // Show success message
    const alertContainer = document.createElement('div');
    alertContainer.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
    alertContainer.style.zIndex = '9999';
    alertContainer.innerHTML = `
        <strong>Success:</strong> Lead added successfully!
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.appendChild(alertContainer);
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
        const alert = bootstrap.Alert.getOrCreateInstance(alertContainer);
        alert.close();
    }, 3000);
    
    // Close the modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addLeadModal'));
    modal.hide();
    
    // Clear the form
    document.getElementById('addLeadForm').reset();
    
    // Refresh the data
    fetchLeadData();
}

// Update a lead
function updateLead() {
    // In a real application, this would make an API call to update the lead
    // For this example, we'll just show a success message
    
    // Show success message
    const alertContainer = document.createElement('div');
    alertContainer.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
    alertContainer.style.zIndex = '9999';
    alertContainer.innerHTML = `
        <strong>Success:</strong> Lead updated successfully!
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.appendChild(alertContainer);
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
        const alert = bootstrap.Alert.getOrCreateInstance(alertContainer);
        alert.close();
    }, 3000);
    
    // Close the modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('leadDetailsModal'));
    modal.hide();
    
    // Refresh the data
    fetchLeadData();
}

// Delete a lead
function deleteLead(leadId) {
    // In a real application, this would make an API call to delete the lead
    // For this example, we'll just show a success message
    
    // Show success message
    const alertContainer = document.createElement('div');
    alertContainer.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
    alertContainer.style.zIndex = '9999';
    alertContainer.innerHTML = `
        <strong>Success:</strong> Lead ${leadId} deleted successfully!
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.appendChild(alertContainer);
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
        const alert = bootstrap.Alert.getOrCreateInstance(alertContainer);
        alert.close();
    }, 3000);
    
    // Refresh the data
    fetchLeadData();
}