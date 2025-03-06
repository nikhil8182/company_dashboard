// TC Data JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the data table
    let dataTable = new DataTable('#tcDataTable', {
        responsive: true,
        order: [[5, 'desc']], // Sort by points column descending
        language: {
            emptyTable: "No data available for this period"
        }
    });

    // Function to load TC data
    function loadTCData(filterType = 'yesterday') {
        fetch(`/api/tc_data?filter_type=${filterType}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                updateTCDataTable(data);
                updateSummaryCards(data);
            })
            .catch(error => {
                console.error('Error fetching TC data:', error);
                // Use sample data if API fails
                useSampleData();
            });
    }

    // Function to update data table with TC data
    function updateTCDataTable(data) {
        // Clear existing table data
        dataTable.clear();
        
        // Add rows to the table
        data.forEach(item => {
            dataTable.row.add([
                item.name,
                item.date,
                item.calls,
                item.connects,
                item.demos,
                item.points
            ]);
        });
        
        // Redraw the table
        dataTable.draw();
    }

    // Function to update summary cards
    function updateSummaryCards(data) {
        let totalCalls = 0;
        let totalConnects = 0;
        let totalDemos = 0;
        let totalPoints = 0;
        
        data.forEach(item => {
            totalCalls += item.calls;
            totalConnects += item.connects;
            totalDemos += item.demos;
            totalPoints += item.points;
        });
        
        document.getElementById('totalCalls').textContent = totalCalls;
        document.getElementById('totalConnects').textContent = totalConnects;
        document.getElementById('totalDemos').textContent = totalDemos;
        document.getElementById('totalPoints').textContent = totalPoints;
    }

    // Function to use sample data if API fails
    function useSampleData() {
        const sampleData = [
            {
                "calls": 45,
                "connects": 15,
                "date": "2025-03-05",
                "demos": 3,
                "name": "Arun kumar N",
                "points": 60
            },
            {
                "calls": 38,
                "connects": 12,
                "date": "2025-03-05",
                "demos": 2,
                "name": "Indra Prasath J",
                "points": 42
            },
            {
                "calls": 52,
                "connects": 18,
                "date": "2025-03-05",
                "demos": 4,
                "name": "Jasim A",
                "points": 80
            },
            {
                "calls": 30,
                "connects": 8,
                "date": "2025-03-05",
                "demos": 1,
                "name": "Karthickraja A",
                "points": 22
            },
            {
                "calls": 25,
                "connects": 5,
                "date": "2025-03-05",
                "demos": 0,
                "name": "Reynold Regan T",
                "points": 5
            },
            {
                "calls": 33,
                "connects": 10,
                "date": "2025-03-05",
                "demos": 2,
                "name": "Selva Kumar K",
                "points": 38
            }
        ];
        
        updateTCDataTable(sampleData);
        updateSummaryCards(sampleData);
    }

    // Handle filter changes
    document.getElementById('dateFilter').addEventListener('change', function() {
        const filterType = this.value;
        loadTCData(filterType);
    });

    // Load initial data
    loadTCData('yesterday');
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

// Current period filter (default: week)
let currentPeriod = 'week';

// Fetch and display test coverage data
function fetchTestData(period = currentPeriod) {
    // Update current period
    currentPeriod = period;
    
    // Update button states
    document.getElementById('lastWeekBtn').classList.toggle('active', period === 'week');
    document.getElementById('last30DaysBtn').classList.toggle('active', period === 'month');
    
    // Update period label
    elements.periodLabel.textContent = period === 'week' ? 'Last 7 days' : 'Last 30 days';
    
    // Show loading spinner
    elements.spinner.classList.remove('d-none');
    
    // In a real application, this would be an API call
    // For this example, we'll simulate fetching data
    setTimeout(() => {
        // Mock test data
        const mockTestData = generateMockTestData(period);
        displayTestData(mockTestData);
        
        // Hide spinner
        elements.spinner.classList.add('d-none');
        
        // Update last updated time
        elements.lastUpdated.textContent = new Date().toLocaleTimeString();
    }, 1000);
}

// Generate mock test coverage data
function generateMockTestData(period) {
    const count = period === 'week' ? 50 : 100;
    const tests = [];
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - (period === 'week' ? 7 : 30));
    
    const statuses = ['passed', 'failed', 'skipped', 'running'];
    const components = ['Auth', 'API', 'UI', 'Database', 'Frontend', 'Backend', 'Utils', 'Config'];
    
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let skippedTests = 0;
    let totalDuration = 0;
    let flakyTests = 0;
    
    // Generate random tests
    for (let i = 0; i < count; i++) {
        // Generate random date between start date and today
        const date = new Date(startDate.getTime() + Math.random() * (today.getTime() - startDate.getTime()));
        
        // Random status with weighted distribution
        const statusRoll = Math.random();
        let status;
        if (statusRoll < 0.75) {
            status = 'passed';
            passedTests++;
        } else if (statusRoll < 0.9) {
            status = 'failed';
            failedTests++;
            
            // 30% of failed tests are flaky
            if (Math.random() < 0.3) {
                flakyTests++;
            }
        } else if (statusRoll < 0.98) {
            status = 'skipped';
            skippedTests++;
        } else {
            status = 'running';
        }
        
        totalTests++;
        
        // Random duration (seconds)
        const duration = Math.floor(Math.random() * 300);
        totalDuration += duration;
        
        // Random coverage (percentage)
        const coverage = Math.floor(Math.random() * 100);
        
        // Generate test name with pattern
        const testNameParts = [
            ['test', 'validate', 'verify', 'check'],
            ['User', 'Admin', 'Product', 'Order', 'Payment', 'Auth', 'Config'],
            ['Creation', 'Deletion', 'Update', 'Validation', 'Authentication', 'Authorization']
        ];
        
        const testName = `${testNameParts[0][Math.floor(Math.random() * testNameParts[0].length)]}${testNameParts[1][Math.floor(Math.random() * testNameParts[1].length)]}${testNameParts[2][Math.floor(Math.random() * testNameParts[2].length)]}`;
        
        // Create test object
        tests.push({
            name: testName,
            lastRun: date.toISOString(),
            status: status,
            duration: duration,
            coverage: coverage,
            component: components[Math.floor(Math.random() * components.length)]
        });
    }
    
    // Sort by date (newest first)
    tests.sort((a, b) => new Date(b.lastRun) - new Date(a.lastRun));
    
    // Calculate overall metrics
    const codeCoverage = Math.floor(Math.random() * 20 + 70); // Between 70-90%
    const testSuccess = (passedTests / totalTests * 100).toFixed(1);
    const avgDuration = Math.floor(totalDuration / totalTests);
    
    return {
        tests: tests,
        metrics: {
            totalTests: totalTests,
            passedTests: passedTests,
            failedTests: failedTests,
            skippedTests: skippedTests,
            codeCoverage: codeCoverage,
            testSuccess: testSuccess,
            avgDuration: avgDuration,
            flakyTests: flakyTests
        }
    };
}

// Display test coverage data
function displayTestData(data) {
    // Update summary metrics
    elements.codeCoverage.textContent = `${data.metrics.codeCoverage}%`;
    elements.testSuccess.textContent = `${data.metrics.testSuccess}%`;
    elements.testDuration.textContent = formatDuration(data.metrics.avgDuration);
    elements.flakyTests.textContent = data.metrics.flakyTests;
    
    // Update totals
    elements.totalTests.textContent = data.metrics.totalTests;
    elements.passedTests.textContent = data.metrics.passedTests;
    elements.failedTests.textContent = data.metrics.failedTests;
    elements.skippedTests.textContent = data.metrics.skippedTests;
    
    // Update test table
    elements.tableBody.innerHTML = '';
    
    if (data.tests.length > 0) {
        data.tests.forEach(test => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>
                    <div class="d-flex align-items-center">
                        <span>${test.name}</span>
                    </div>
                </td>
                <td>${formatDate(test.lastRun)}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <span class="test-status ${test.status === 'passed' ? 'test-passed' : test.status === 'failed' ? 'test-failed' : test.status === 'running' ? 'test-running' : 'test-skipped'}"></span>
                        <span>${test.status.charAt(0).toUpperCase() + test.status.slice(1)}</span>
                    </div>
                </td>
                <td>${formatDuration(test.duration)}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="progress flex-grow-1" style="height: 5px;">
                            <div class="progress-bar ${test.coverage >= 80 ? 'bg-success' : test.coverage >= 60 ? 'bg-info' : test.coverage >= 40 ? 'bg-warning' : 'bg-danger'}" 
                                 style="width: ${test.coverage}%"></div>
                        </div>
                        <span class="ms-2">${test.coverage}%</span>
                    </div>
                </td>
                <td>${test.component}</td>
            `;
            
            elements.tableBody.appendChild(row);
        });
    } else {
        elements.tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No test data available</td></tr>';
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
    // Cache DOM elements
    elements = {
        codeCoverage: document.getElementById('codeCoverage'),
        testSuccess: document.getElementById('testSuccess'),
        testDuration: document.getElementById('testDuration'),
        flakyTests: document.getElementById('flakyTests'),
        totalTests: document.getElementById('totalTests'),
        passedTests: document.getElementById('passedTests'),
        failedTests: document.getElementById('failedTests'),
        skippedTests: document.getElementById('skippedTests'),
        tableBody: document.getElementById('testTableBody'),
        lastUpdated: document.getElementById('lastUpdated'),
        spinner: document.getElementById('spinner'),
        periodLabel: document.getElementById('periodLabel')
    };
    
    // Set up theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-bs-theme', savedTheme);
        if (savedTheme === 'dark') {
            document.getElementById('lightIcon').classList.add('d-none');
            document.getElementById('darkIcon').classList.remove('d-none');
        }
    }
    
    // Initial data fetch
    fetchTestData('week');
    
    // Set up period filter buttons
    document.getElementById('lastWeekBtn').addEventListener('click', () => fetchTestData('week'));
    document.getElementById('last30DaysBtn').addEventListener('click', () => fetchTestData('month'));
    
    // Set up refresh button
    document.getElementById('refreshData').addEventListener('click', () => fetchTestData(currentPeriod));
    
    // Auto-refresh every 5 minutes
    setInterval(() => fetchTestData(currentPeriod), 300000);
});