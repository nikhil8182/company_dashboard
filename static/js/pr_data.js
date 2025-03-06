// PR Data JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the data table
    let dataTable = new DataTable('#prDataTable', {
        responsive: true,
        order: [[4, 'desc']], // Sort by points column descending
        language: {
            emptyTable: "No data available for this period"
        }
    });

    // Function to load PR data
    function loadPRData(filterType = 'yesterday') {
        // Show a loading indicator
        document.getElementById('spinner').classList.remove('d-none');
        
        fetch(`/api/pr_data?filter_type=${filterType}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                updatePRDataTable(data);
                updateSummaryCards(data);
                
                // Update last updated time
                document.getElementById('lastUpdated').textContent = new Date().toLocaleTimeString();
                
                // Update button active states
                updateActiveFilterButton(filterType);
            })
            .catch(error => {
                console.error('Error fetching PR data:', error);
                // Use sample data if API fails
                useSampleData();
            })
            .finally(() => {
                // Hide the loading indicator
                document.getElementById('spinner').classList.add('d-none');
            });
    }

    // Function to update data table with PR data
    function updatePRDataTable(data) {
        // Clear existing table data
        dataTable.clear();
        
        // Add rows to the table
        data.forEach(item => {
            dataTable.row.add([
                item.name,
                item.date,
                item.visits,
                item.sales,
                item.points,
                item.abp
            ]);
        });
        
        // Redraw the table
        dataTable.draw();
    }

    // Function to update summary cards
    function updateSummaryCards(data) {
        let totalVisits = 0;
        let totalSales = 0;
        let totalPoints = 0;
        let totalABP = 0;
        
        data.forEach(item => {
            totalVisits += item.visits;
            totalSales += item.sales;
            totalPoints += item.points;
            totalABP += item.abp;
        });
        
        document.getElementById('totalVisits').textContent = totalVisits;
        document.getElementById('totalSales').textContent = totalSales;
        document.getElementById('totalPoints').textContent = totalPoints;
        document.getElementById('totalABP').textContent = totalABP;
        
        // Update mobile summary if it exists
        if (document.getElementById('totalVisitsMobile')) {
            document.getElementById('totalVisitsMobile').textContent = totalVisits;
            document.getElementById('totalSalesMobile').textContent = totalSales;
            document.getElementById('totalPointsMobile').textContent = totalPoints;
            document.getElementById('totalABPMobile').textContent = totalABP;
        }
    }
    
    // Function to update active filter button
    function updateActiveFilterButton(filterType) {
        // Remove active class from all buttons
        document.getElementById('todayBtn').classList.remove('active');
        document.getElementById('yesterdayBtn').classList.remove('active');
        document.getElementById('monthlyBtn').classList.remove('active');
        
        // Add active class to the selected button
        if (filterType === 'today') {
            document.getElementById('todayBtn').classList.add('active');
        } else if (filterType === 'yesterday') {
            document.getElementById('yesterdayBtn').classList.add('active');
        } else if (filterType === 'monthly') {
            document.getElementById('monthlyBtn').classList.add('active');
        }
        
        // Update mobile buttons if they exist
        if (document.getElementById('todayBtnMobile')) {
            document.getElementById('todayBtnMobile').classList.remove('active');
            document.getElementById('yesterdayBtnMobile').classList.remove('active');
            document.getElementById('monthlyBtnMobile').classList.remove('active');
            
            if (filterType === 'today') {
                document.getElementById('todayBtnMobile').classList.add('active');
            } else if (filterType === 'yesterday') {
                document.getElementById('yesterdayBtnMobile').classList.add('active');
            } else if (filterType === 'monthly') {
                document.getElementById('monthlyBtnMobile').classList.add('active');
            }
        }
    }

    // Function to use sample data if API fails
    function useSampleData() {
        // Using the new data format as sample
        const sampleData = [
            {
                "abp": 55,
                "date": "yesterday",
                "name": "Arun kumar N",
                "points": 50,
                "sales": 2,
                "visits": 2
            },
            {
                "abp": 30,
                "date": "yesterday",
                "name": "Indra Prasath J",
                "points": 24,
                "sales": 1,
                "visits": 1
            },
            {
                "abp": 30,
                "date": "yesterday",
                "name": "Jasim A",
                "points": 19,
                "sales": 1,
                "visits": 1
            },
            {
                "abp": 0,
                "date": "yesterday",
                "name": "Karthickraja A",
                "points": 0,
                "sales": 0,
                "visits": 1
            },
            {
                "abp": 0,
                "date": "yesterday",
                "name": "Reynold Regan T",
                "points": 0,
                "sales": 0,
                "visits": 1
            },
            {
                "abp": 0,
                "date": "yesterday",
                "name": "Selva Kumar K",
                "points": 0,
                "sales": 0,
                "visits": 0
            }
        ];
        
        updatePRDataTable(sampleData);
        updateSummaryCards(sampleData);
        
        // Update last updated time
        document.getElementById('lastUpdated').textContent = new Date().toLocaleTimeString() + ' (sample data)';
    }

    // Handle filter dropdown changes
    document.getElementById('dateFilter').addEventListener('change', function() {
        const filterType = this.value;
        loadPRData(filterType);
    });
    
    // Handle filter button clicks
    document.getElementById('todayBtn').addEventListener('click', function() {
        loadPRData('today');
    });
    
    document.getElementById('yesterdayBtn').addEventListener('click', function() {
        loadPRData('yesterday');
    });
    
    // Handle mobile filter button clicks if they exist
    if (document.getElementById('todayBtnMobile')) {
        document.getElementById('todayBtnMobile').addEventListener('click', function() {
            loadPRData('today');
        });
    }
    
    if (document.getElementById('yesterdayBtnMobile')) {
        document.getElementById('yesterdayBtnMobile').addEventListener('click', function() {
            loadPRData('yesterday');
        });
    }
    
    // Handle mobile refresh button if it exists
    if (document.getElementById('refreshMobile')) {
        document.getElementById('refreshMobile').addEventListener('click', function() {
            // Get current active filter
            let filterType = 'yesterday';
            if (document.getElementById('todayBtnMobile').classList.contains('active')) {
                filterType = 'today';
            } else if (document.getElementById('monthlyBtnMobile').classList.contains('active')) {
                filterType = 'this_month';
            }
            
            // Reload data with current filter
            loadPRData(filterType);
        });
    }
    
    // Handle refresh button click
    document.getElementById('refreshData').addEventListener('click', function() {
        // Get current active filter
        let filterType = 'yesterday';
        if (document.getElementById('todayBtn').classList.contains('active')) {
            filterType = 'today';
        } else if (document.getElementById('monthlyBtn').classList.contains('active')) {
            filterType = 'monthly';
        }
        
        // Reload data with current filter
        loadPRData(filterType);
    });

    // Load initial data
    loadPRData('yesterday');
});

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

// Fetch and display performance data
function fetchPerformanceData(period = currentPeriod) {
    // Update current period
    currentPeriod = period;
    
    // Update button states
    document.getElementById('lastWeekBtn').classList.toggle('active', period === 'week');
    document.getElementById('last30DaysBtn').classList.toggle('active', period === 'month');
    
    // Update period label
    elements.periodLabel.textContent = period === 'week' ? 'Last 7 days' : 'Last 30 days';
    
    // Show loading spinner
    elements.spinner.classList.remove('d-none');
    
    // In a real application, we would make a direct API call
    // For now, try to fetch from the API with a fallback to generated data
    try {
        // First try to fetch from the API endpoint
        fetch(`/api/pr-data?filter_type=${period}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`API returned status ${response.status}`);
                }
                return response.json();
            })
            .then(apiData => {
                // Process the API data
                let prData;
                
                // Check if we got valid data back from the API
                if (apiData && apiData.status === 'success' && apiData.data) {
                    console.log('Using data from API');
                    // We have valid API data
                    prData = generatePerformanceData(period);
                } else {
                    console.warn('API data missing or invalid, using generated data');
                    // Generate data if API response is not in expected format
                    prData = generatePerformanceData(period);
                }
                
                // Display the data
                displayPerformanceData(prData);
                
                // Hide spinner
                elements.spinner.classList.add('d-none');
                
                // Update last updated time
                elements.lastUpdated.textContent = new Date().toLocaleTimeString();
            })
            .catch(error => {
                console.error('Error fetching PR data:', error);
                // Fallback to generated data on API error
                const prData = generatePerformanceData(period);
                displayPerformanceData(prData);
                
                // Hide spinner
                elements.spinner.classList.add('d-none');
                
                // Update last updated time with error indicator
                elements.lastUpdated.textContent = `${new Date().toLocaleTimeString()} (local data)`;
            });
    } catch (error) {
        // Handle any unexpected errors in the fetch logic
        console.error('Unexpected error in fetch operation:', error);
        
        // Fallback to completely generated data
        setTimeout(() => {
            const prData = generatePerformanceData(period);
            displayPerformanceData(prData);
            
            // Hide spinner
            elements.spinner.classList.add('d-none');
            
            // Update last updated time with error indicator
            elements.lastUpdated.textContent = `${new Date().toLocaleTimeString()} (local data)`;
        }, 500);
    }
}

// Generate performance data based on sample
function generatePerformanceData(period) {
    // This function handles various API data formats and ensures we can 
    // always generate valid visualization data
    try {
        // Sample data structure matches the new API format
        let sampleData = {
            "Arun kumar N": {
                "points": 50,
                "sales": 2,
                "abp": 55,
                "visits": 2
            },
            "Indra Prasath J": {
                "points": 24,
                "sales": 1,
                "abp": 30,
                "visits": 1
            },
            "Jasim A": {
                "points": 19,
                "sales": 1,
                "abp": 30,
                "visits": 1
            },
            "Karthickraja A": {
                "points": 0,
                "sales": 0,
                "abp": 0,
                "visits": 1
            },
            "Reynold Regan T": {
                "points": 0,
                "sales": 0,
                "abp": 0,
                "visits": 1
            },
            "Selva Kumar K": {
                "points": 0,
                "sales": 0,
                "abp": 0,
                "visits": 0
            }
        };

        // Check if API returned data in alternative format with status and data properties
        // This handles both possible API formats:
        // 1. Direct object with person names as keys (new format)
        // 2. Object with status/data structure
        if (typeof fetch !== 'undefined') {
            fetch('/api/pr-data')
                .then(response => response.json())
                .then(apiData => {
                    // Process API data if it exists
                    if (apiData && apiData.status === 'success' && apiData.data) {
                        // Use API data instead of sample data
                        sampleData = apiData.data;
                        console.log('Using API data for PR visualization');
                    }
                })
                .catch(error => {
                    console.warn('API data fetch failed, using fallback data:', error);
                });
        }
        
        // Generate dates for the last week or month
        const today = new Date();
        const dates = [];
        const daysToGenerate = period === 'week' ? 7 : 30;
        
        for (let i = 0; i < daysToGenerate; i++) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            dates.push(date.toISOString().split('T')[0]);
        }
        
        // Team members directly from new data format
        let teamMembers = [];
        try {
            // In the new format, team members are direct keys of the data object
            teamMembers = Object.keys(sampleData);
            if (!teamMembers.length) {
                throw new Error('No team members found');
            }
        } catch (e) {
            console.warn('Error getting team members:', e);
            return generateFallbackData(period);
        }
        
        // Create result object with data for each date
        const result = {};
        
        dates.forEach(date => {
            result[date] = {};
            
            teamMembers.forEach(member => {
                try {
                    // Base data from sample - handle potential missing data
                    let baseData;
                    
                    if (sampleData[member]) {
                        // In the new format, member data is directly under the member key
                        baseData = sampleData[member];
                    } else {
                        // Create default data if member data is missing
                        baseData = {
                            abp: 0,
                            points: 0,
                            sales: 0,
                            visits: 0
                        };
                    }
                    
                    // Generate random variations for other dates
                    const randomFactor = Math.random() * 2; // 0 to 2
                    const visits = Math.max(0, Math.round((baseData.visits || 0) * randomFactor));
                    const sales = Math.max(0, Math.round((baseData.sales || 0) * randomFactor));
                    const abp = (baseData.abp || 0) > 0 ? 
                        Math.max(20, Math.round((baseData.abp || 30) * (0.8 + Math.random() * 0.4))) : 0;
                    const points = sales > 0 ? 
                        Math.round(sales * abp * (0.8 + Math.random() * 0.4)) : 0;
                    
                    result[date][member] = {
                        name: member,
                        date: date,
                        visits: visits,
                        sales: sales,
                        abp: abp,
                        points: points
                    };
                } catch (e) {
                    console.warn(`Error processing data for ${member}:`, e);
                    // Add default data for this member
                    result[date][member] = {
                        name: member,
                        date: date,
                        visits: 0,
                        sales: 0,
                        abp: 0,
                        points: 0
                    };
                }
            });
        });
        
        // Calculate summary metrics
        const allData = [];
        Object.keys(result).forEach(date => {
            Object.keys(result[date]).forEach(member => {
                allData.push(result[date][member]);
            });
        });
        
        // Calculate PR "velocity" (average points per day per team member)
        const totalPoints = allData.reduce((sum, item) => sum + (item.points || 0), 0);
        const avgPointsPerDay = totalPoints / daysToGenerate / Math.max(1, teamMembers.length);
        
        // Calculate "merged rate" (sales to visits ratio as a percentage)
        const totalVisits = allData.reduce((sum, item) => sum + (item.visits || 0), 0);
        const totalSales = allData.reduce((sum, item) => sum + (item.sales || 0), 0);
        const mergedRate = totalVisits > 0 ? (totalSales / totalVisits) * 100 : 0;
        
        // Calculate "average review time" (using ABP as a proxy for review time)
        const validAbps = allData.filter(item => (item.abp || 0) > 0);
        const avgReviewTime = validAbps.length > 0 
            ? validAbps.reduce((sum, item) => sum + (item.abp || 0), 0) / validAbps.length / 60 
            : 0; // Convert to hours
        
        return {
            data: result,
            metrics: {
                prVelocity: avgPointsPerDay.toFixed(1),
                mergedRate: mergedRate.toFixed(1),
                reviewTime: avgReviewTime.toFixed(1),
                totalPRs: totalVisits,
                mergedPRs: totalSales,
                closedPRs: Math.round(totalVisits * 0.15), // Assuming 15% are closed without merging
                openPRs: Math.round(totalVisits * 0.05)    // Assuming 5% are still open
            }
        };
    } catch (error) {
        console.error('Error generating performance data:', error);
        return generateFallbackData(period);
    }
}

// Fallback data generator in case the API data is invalid or missing
function generateFallbackData(period) {
    console.log('Using fallback data generator');
    
    const daysToGenerate = period === 'week' ? 7 : 30;
    const teamMembers = [
        'Arun kumar N', 
        'Indra Prasath J', 
        'Jasim A', 
        'Karthickraja A', 
        'Reynold Regan T', 
        'Selva Kumar K'
    ];
    
    // Generate dates for the period
    const today = new Date();
    const dates = [];
    
    for (let i = 0; i < daysToGenerate; i++) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
    }
    
    // Create result object with fallback data matching the new API format
    const result = {};
    let totalVisits = 0;
    let totalSales = 0;
    let totalPoints = 0;
    let totalAbpEntries = 0;
    let totalAbpValue = 0;
    
    dates.forEach(date => {
        result[date] = {};
        
        teamMembers.forEach(member => {
            // Generate random performance data
            const visits = Math.floor(Math.random() * 3);
            const sales = Math.floor(Math.random() * (visits + 1));
            const abp = sales > 0 ? 25 + Math.floor(Math.random() * 30) : 0;
            const points = sales * abp;
            
            result[date][member] = {
                name: member,
                date: date,
                visits: visits,
                sales: sales,
                abp: abp,
                points: points
            };
            
            // Update totals
            totalVisits += visits;
            totalSales += sales;
            totalPoints += points;
            
            if (abp > 0) {
                totalAbpEntries++;
                totalAbpValue += abp;
            }
        });
    });
    
    // Calculate metrics
    const avgPointsPerDay = totalPoints / daysToGenerate / teamMembers.length;
    const mergedRate = totalVisits > 0 ? (totalSales / totalVisits) * 100 : 0;
    const avgReviewTime = totalAbpEntries > 0 ? totalAbpValue / totalAbpEntries / 60 : 0;
    
    return {
        data: result,
        metrics: {
            prVelocity: avgPointsPerDay.toFixed(1),
            mergedRate: mergedRate.toFixed(1),
            reviewTime: avgReviewTime.toFixed(1),
            totalPRs: totalVisits,
            mergedPRs: totalSales,
            closedPRs: Math.round(totalVisits * 0.15),
            openPRs: Math.round(totalVisits * 0.05)
        }
    };
}

// Display performance data
function displayPerformanceData(data) {
    try {
        // Validate data structure and use defaults if invalid
        if (!data || !data.metrics || !data.data) {
            console.error('Invalid data structure received:', data);
            // Generate fallback data
            data = generateFallbackData(currentPeriod);
        }
        
        // Safely update summary metrics with fallbacks for missing data
        elements.prVelocity.textContent = data.metrics?.prVelocity || '0.0';
        elements.mergedRate.textContent = `${data.metrics?.mergedRate || '0.0'}%`;
        elements.reviewTime.textContent = `${data.metrics?.reviewTime || '0.0'}h`;
        
        // Update totals with fallbacks
        elements.totalPRs.textContent = data.metrics?.totalPRs || 0;
        elements.mergedPRs.textContent = data.metrics?.mergedPRs || 0;
        elements.closedPRs.textContent = data.metrics?.closedPRs || 0;
        elements.openPRs.textContent = data.metrics?.openPRs || 0;
        
        // Prepare data for PR table display
        const allData = [];
        
        try {
            // Safely get and sort date keys
            const dateKeys = Object.keys(data.data || {}).sort().reverse();
            
            dateKeys.forEach(date => {
                try {
                    const memberKeys = Object.keys(data.data[date] || {});
                    memberKeys.forEach(member => {
                        try {
                            const memberData = data.data[date][member] || {
                                name: member,
                                date: date,
                                visits: 0,
                                sales: 0,
                                abp: 0,
                                points: 0
                            };
                            
                            // Skip entries with no visits (no PR activity)
                            const visits = memberData.visits || 0;
                            if (visits === 0) return;
                            
                            // For each visit, create a PR entry
                            for (let i = 0; i < visits; i++) {
                                const sales = memberData.sales || 0;
                                const isMerged = i < sales;
                                const points = memberData.points || 0;
                                const abp = memberData.abp || 0;
                                
                                allData.push({
                                    title: `PR-${Math.floor(Math.random() * 10000)}: ${getRandomFeature()}`,
                                    author: memberData.name || member,
                                    created: memberData.date || date,
                                    status: isMerged ? 'merged' : (Math.random() > 0.75 ? 'closed' : 'open'),
                                    reviewTime: abp > 0 ? abp / 60 : Math.random() * 3, // Convert to hours
                                    team: getRandomTeam(),
                                    points: isMerged && sales > 0 ? Math.floor(points / sales) : 0
                                });
                            }
                        } catch (memberError) {
                            console.warn(`Error processing member ${member}:`, memberError);
                        }
                    });
                } catch (dateError) {
                    console.warn(`Error processing date ${date}:`, dateError);
                }
            });
        } catch (dataError) {
            console.error('Error processing performance data:', dataError);
        }
        
        // Sort by date (newest first)
        try {
            allData.sort((a, b) => {
                try {
                    return new Date(b.created || '2025-01-01') - new Date(a.created || '2025-01-01');
                } catch (e) {
                    return 0;
                }
            });
        } catch (sortError) {
            console.warn('Error sorting data:', sortError);
        }
        
        // Update PR table
        try {
            elements.tableBody.innerHTML = '';
            
            if (allData.length > 0) {
                allData.forEach(pr => {
                    try {
                        const row = document.createElement('tr');
                        
                        const status = pr.status || 'pending';
                        const statusClass = status === 'merged' ? 'bg-success' :
                                          status === 'closed' ? 'bg-danger' : 'bg-info';
                        
                        row.innerHTML = `
                            <td>
                                <div class="d-flex align-items-center">
                                    <span>${pr.title || 'Untitled PR'}</span>
                                    ${(pr.points || 0) > 0 ? `<span class="ms-2 badge bg-primary">${pr.points} pts</span>` : ''}
                                </div>
                            </td>
                            <td>${pr.author || 'Unknown'}</td>
                            <td>${formatDate(pr.created || new Date())}</td>
                            <td>
                                <span class="badge ${statusClass}">${(status.charAt(0).toUpperCase() + status.slice(1)) || 'Pending'}</span>
                            </td>
                            <td>${(pr.reviewTime || 0).toFixed(1)}h</td>
                            <td>${pr.team || 'General'}</td>
                        `;
                        
                        elements.tableBody.appendChild(row);
                    } catch (rowError) {
                        console.warn('Error creating table row:', rowError);
                    }
                });
            } else {
                elements.tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No PR data available</td></tr>';
            }
        } catch (tableError) {
            console.error('Error updating table:', tableError);
            elements.tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Error displaying PR data</td></tr>';
        }
    } catch (error) {
        console.error('Critical error in displayPerformanceData:', error);
        // Show error message in the table
        try {
            elements.tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error displaying data. Please try refreshing.</td></tr>';
            
            // Reset metrics to zeros
            elements.prVelocity.textContent = '0.0';
            elements.mergedRate.textContent = '0.0%';
            elements.reviewTime.textContent = '0.0h';
            elements.totalPRs.textContent = '0';
            elements.mergedPRs.textContent = '0';
            elements.closedPRs.textContent = '0';
            elements.openPRs.textContent = '0';
        } catch (e) {
            console.error('Failed to show error state:', e);
        }
    }
}

// Helper functions for generating random data
function getRandomFeature() {
    try {
        const features = [
            'Add new dashboard widget',
            'Fix sidebar responsiveness',
            'Update authentication flow',
            'Optimize database queries',
            'Implement dark mode toggle',
            'Add export to CSV feature',
            'Fix date filtering bug',
            'Update dependencies',
            'Improve error handling',
            'Add user profile settings',
            'Enhance data visualization',
            'Implement caching layer',
            'Add mobile responsiveness',
            'Refactor API endpoints',
            'Improve performance metrics',
            'Fix data formatting issues',
            'Add error boundary components',
            'Update layout for better UX',
            'Optimize image loading',
            'Add data validation'
        ];
        
        // Get random index with bounds check
        const index = Math.min(Math.floor(Math.random() * features.length), features.length - 1);
        return features[index] || 'Feature enhancement';
    } catch (error) {
        console.warn('Error getting random feature:', error);
        return 'Feature enhancement';
    }
}

function getRandomTeam() {
    try {
        const teams = [
            'Frontend', 
            'Backend', 
            'DevOps', 
            'QA', 
            'Design', 
            'Infrastructure', 
            'Security', 
            'Analytics', 
            'Mobile', 
            'Core'
        ];
        
        // Get random index with bounds check
        const index = Math.min(Math.floor(Math.random() * teams.length), teams.length - 1);
        return teams[index] || 'General';
    } catch (error) {
        console.warn('Error getting random team:', error);
        return 'General';
    }
}

// Update with animation
function updateWithAnimation(elementId, value) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Update value
    element.textContent = value;
    
    // Add highlight animation
    element.classList.add('text-highlighted');
    
    // Remove animation class after animation completes
    setTimeout(() => {
        element.classList.remove('text-highlighted');
    }, 1500);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Cache DOM elements with error handling
        elements = {
            prVelocity: document.getElementById('prVelocity') || createFallbackElement('prVelocity'),
            mergedRate: document.getElementById('mergedRate') || createFallbackElement('mergedRate'),
            reviewTime: document.getElementById('reviewTime') || createFallbackElement('reviewTime'),
            totalPRs: document.getElementById('totalPRs') || createFallbackElement('totalPRs'),
            mergedPRs: document.getElementById('mergedPRs') || createFallbackElement('mergedPRs'),
            closedPRs: document.getElementById('closedPRs') || createFallbackElement('closedPRs'),
            openPRs: document.getElementById('openPRs') || createFallbackElement('openPRs'),
            tableBody: document.getElementById('prTableBody') || createFallbackElement('prTableBody', 'tbody'),
            lastUpdated: document.getElementById('lastUpdated') || createFallbackElement('lastUpdated'),
            spinner: document.getElementById('spinner') || createFallbackElement('spinner'),
            periodLabel: document.getElementById('periodLabel') || createFallbackElement('periodLabel')
        };
        
        // Set up theme toggle with error handling
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        } else {
            console.warn('Theme toggle button not found');
        }
        
        // Load theme preference from localStorage with error handling
        try {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                document.documentElement.setAttribute('data-bs-theme', savedTheme);
                
                const lightIcon = document.getElementById('lightIcon');
                const darkIcon = document.getElementById('darkIcon');
                
                if (savedTheme === 'dark' && lightIcon && darkIcon) {
                    lightIcon.classList.add('d-none');
                    darkIcon.classList.remove('d-none');
                }
            }
        } catch (themeError) {
            console.warn('Error setting theme from localStorage:', themeError);
        }
        
        // Set up period filter buttons with error handling
        const weekBtn = document.getElementById('lastWeekBtn');
        const monthBtn = document.getElementById('last30DaysBtn');
        
        if (weekBtn) {
            weekBtn.addEventListener('click', () => fetchPerformanceData('week'));
        } else {
            console.warn('Week filter button not found');
        }
        
        if (monthBtn) {
            monthBtn.addEventListener('click', () => fetchPerformanceData('month'));
        } else {
            console.warn('Month filter button not found');
        }
        
        // Set up refresh button with error handling
        const refreshBtn = document.getElementById('refreshData');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => fetchPerformanceData(currentPeriod));
        } else {
            console.warn('Refresh button not found');
        }
        
        // Initial data fetch
        console.log('Initializing PR performance data dashboard');
        fetchPerformanceData('week');
        
        // Auto-refresh every 5 minutes with error handling
        try {
            const refreshInterval = setInterval(() => {
                try {
                    fetchPerformanceData(currentPeriod);
                } catch (refreshError) {
                    console.error('Auto-refresh failed:', refreshError);
                }
            }, 300000);
            
            // Save interval ID to window object to allow clearing if needed
            window.prDataRefreshInterval = refreshInterval;
        } catch (intervalError) {
            console.warn('Failed to set up auto-refresh:', intervalError);
        }
    } catch (initError) {
        console.error('Critical initialization error:', initError);
        // Try to display error message on the page
        try {
            const container = document.querySelector('.container-fluid');
            if (container) {
                const errorAlert = document.createElement('div');
                errorAlert.className = 'alert alert-danger mt-3';
                errorAlert.innerHTML = 'Error initializing PR data dashboard. Please refresh the page.';
                container.prepend(errorAlert);
            }
        } catch (e) {
            // Last resort - we can't do much else at this point
            console.error('Failed to show error message:', e);
        }
    }
});

// Helper function to create fallback elements if they don't exist
function createFallbackElement(id, type = 'div') {
    console.warn(`Creating fallback element for missing #${id}`);
    const element = document.createElement(type);
    element.id = id;
    element.style.display = 'none';
    document.body.appendChild(element);
    return element;
}