// Global state
let activeJobs = new Map();

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    checkHealth();
    setupEventListeners();
    addDefaultCustomFields();
});

// Health check
async function checkHealth() {
    const healthIndicator = document.getElementById('health-indicator');
    const healthText = document.getElementById('health-text');
    const healthStatus = document.getElementById('health-status');
    
    try {
        const response = await fetch('/health');
        const data = await response.json();
        
        if (data.status === 'OK') {
            healthStatus.className = 'health-status ' + (data.apiKeyConfigured ? 'healthy' : 'error');
            healthText.textContent = data.apiKeyConfigured ? 'API Ready' : 'API Key Not Configured';
        } else {
            healthStatus.className = 'health-status error';
            healthText.textContent = 'Server Error';
        }
    } catch (error) {
        healthStatus.className = 'health-status error';
        healthText.textContent = 'Connection Failed';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Form submissions
    document.getElementById('enrich-company-form').addEventListener('submit', handleEnrichCompany);
    document.getElementById('enrich-lead-form').addEventListener('submit', handleEnrichLead);
    document.getElementById('find-email-form').addEventListener('submit', handleFindEmail);
    document.getElementById('find-phone-form').addEventListener('submit', handleFindPhone);
    document.getElementById('qa-agent-form').addEventListener('submit', handleQAAgent);
}

// Tab functionality
function openTab(evt, tabName) {
    // Hide all tab contents
    const tabContents = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('active');
    }
    
    // Remove active class from all tab buttons
    const tabButtons = document.getElementsByClassName('tab-button');
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove('active');
    }
    
    // Show the selected tab and mark button as active
    document.getElementById(tabName).classList.add('active');
    evt.currentTarget.classList.add('active');
}

// Custom fields management
function addDefaultCustomFields() {
    const customFieldsContainer = document.getElementById('custom-fields');
    const defaultFields = [
        { name: 'instagram_url', description: 'Instagram URL for the company' },
        { name: 'num_employees', description: 'Approximate number of employees' }
    ];
    
    // Clear existing fields
    customFieldsContainer.innerHTML = '';
    
    // Add default fields
    defaultFields.forEach(field => {
        addCustomFieldWithValues(field.name, field.description);
    });
    
    // Show empty state if no fields
    updateCustomFieldsDisplay();
}

function addCustomField() {
    addCustomFieldWithValues('', '');
}

function addCustomFieldWithValues(name = '', description = '') {
    const customFieldsContainer = document.getElementById('custom-fields');
    
    // Remove empty state if it exists
    const emptyState = customFieldsContainer.querySelector('.custom-fields-empty');
    if (emptyState) {
        emptyState.remove();
    }
    
    const fieldDiv = document.createElement('div');
    fieldDiv.className = 'custom-field';
    fieldDiv.innerHTML = `
        <input type="text" placeholder="e.g., website_url" class="field-name" value="${name}">
        <input type="text" placeholder="e.g., Company website URL" class="field-description" value="${description}">
        <button type="button" onclick="removeCustomField(this)" class="remove-field-btn">Remove</button>
    `;
    customFieldsContainer.appendChild(fieldDiv);
    
    // Focus on the first input of the new field
    if (!name) {
        fieldDiv.querySelector('.field-name').focus();
    }
    
    updateCustomFieldsDisplay();
}

function removeCustomField(button) {
    const fieldElement = button.parentElement;
    
    // Add a smooth removal animation
    fieldElement.style.transition = 'all 0.3s ease';
    fieldElement.style.opacity = '0';
    fieldElement.style.transform = 'translateX(-20px)';
    
    setTimeout(() => {
        fieldElement.remove();
        updateCustomFieldsDisplay();
    }, 300);
}

function updateCustomFieldsDisplay() {
    const customFieldsContainer = document.getElementById('custom-fields');
    const fields = customFieldsContainer.querySelectorAll('.custom-field');
    
    if (fields.length === 0) {
        customFieldsContainer.innerHTML = `
            <div class="custom-fields-empty">
                No custom fields added yet.<br>
                <small>Click "Add Field" to specify what data you want to extract.</small>
            </div>
        `;
    }
}

function getCustomFields() {
    const customFields = {};
    const fieldElements = document.querySelectorAll('#custom-fields .custom-field');
    
    fieldElements.forEach(field => {
        const name = field.querySelector('.field-name').value.trim();
        const description = field.querySelector('.field-description').value.trim();
        
        if (name && description) {
            customFields[name] = description;
        }
    });
    
    return customFields;
}

// API request handlers
async function handleEnrichCompany(event) {
    event.preventDefault();
    
    const targetCompany = {
        company_name: document.getElementById('company-name').value,
        address: document.getElementById('company-address').value,
        phone_number: document.getElementById('company-phone').value,
        website: document.getElementById('company-website').value
    };
    
    // Remove empty fields
    Object.keys(targetCompany).forEach(key => {
        if (!targetCompany[key]) delete targetCompany[key];
    });
    
    const requestData = {
        target_company: targetCompany,
        struct: getCustomFields(),
        find_people: document.getElementById('find-people').checked,
        research_plan: document.getElementById('research-plan').value,
        people_focus_prompt: document.getElementById('people-focus').value
    };
    
    await makeApiRequest('/api/enrich-company', requestData);
}

async function enrichCompanyAsync() {
    const targetCompany = {
        company_name: document.getElementById('company-name').value,
        address: document.getElementById('company-address').value,
        phone_number: document.getElementById('company-phone').value,
        website: document.getElementById('company-website').value
    };
    
    // Remove empty fields
    Object.keys(targetCompany).forEach(key => {
        if (!targetCompany[key]) delete targetCompany[key];
    });
    
    const requestData = {
        target_company: targetCompany,
        struct: getCustomFields(),
        find_people: document.getElementById('find-people').checked,
        research_plan: document.getElementById('research-plan').value,
        people_focus_prompt: document.getElementById('people-focus').value
    };
    
    const result = await makeApiRequest('/api/enrich-company-async', requestData);
    
    if (result && result.task_id) {
        addActiveJob(result.task_id, 'enrich_company', result.status);
        showResults({
            message: 'Async job started successfully!',
            task_id: result.task_id,
            status: result.status,
            note: 'You can check the status in the Async Jobs tab or it will be automatically monitored.'
        });
        
        // Start monitoring the job
        monitorJob(result.task_id);
    }
}

async function handleEnrichLead(event) {
    event.preventDefault();
    
    const leadInfo = {
        name: document.getElementById('lead-name').value,
        email: document.getElementById('lead-email').value,
        linkedin: document.getElementById('lead-linkedin').value,
        company: document.getElementById('lead-company').value,
        title: document.getElementById('lead-title').value,
        location: document.getElementById('lead-location').value
    };
    
    // Remove empty fields
    Object.keys(leadInfo).forEach(key => {
        if (!leadInfo[key]) delete leadInfo[key];
    });
    
    const requestData = {
        lead_info: leadInfo,
        struct: {
            name: 'The individual\'s full name',
            email: 'The individual\'s email address',
            phone: 'The individual\'s phone number',
            title: 'The individual\'s job title',
            company: 'The company the individual is associated with',
            linkedin: 'LinkedIn URL for the person',
            location: 'The individual\'s location and/or company location',
            industry: 'Industry the person operates in'
        }
    };
    
    await makeApiRequest('/api/enrich-lead', requestData);
}

async function handleFindEmail(event) {
    event.preventDefault();
    
    const leadData = {
        name: document.getElementById('email-person-name').value,
        company: document.getElementById('email-company-name').value,
        title: document.getElementById('email-person-title').value,
        linkedin: document.getElementById('email-linkedin').value
    };
    
    // Add domain if provided
    const domain = document.getElementById('email-domain').value;
    if (domain) {
        leadData.domain = domain;
    }
    
    // Remove empty fields from lead data
    Object.keys(leadData).forEach(key => {
        if (!leadData[key]) delete leadData[key];
    });
    
    const requestData = {
        lead: leadData,
        bruteforce: document.getElementById('email-bruteforce').checked,
        only_company_emails: document.getElementById('email-company-only').checked
    };
    
    await makeApiRequest('/api/find-email', requestData);
}

async function handleFindPhone(event) {
    event.preventDefault();
    
    const leadData = {
        name: document.getElementById('phone-person-name').value,
        company: document.getElementById('phone-company-name').value,
        location: document.getElementById('phone-location').value
    };
    
    // Remove empty fields from lead data
    Object.keys(leadData).forEach(key => {
        if (!leadData[key]) delete leadData[key];
    });
    
    const requestData = {
        lead: leadData
    };
    
    await makeApiRequest('/api/find-phone', requestData);
}

async function handleQAAgent(event) {
    event.preventDefault();
    
    const question = document.getElementById('qa-question').value;
    const context = document.getElementById('qa-context').value;
    
    // Based on common API patterns, try the most likely format first
    const requestData = {
        question: question
    };
    
    // Add context if provided
    if (context && context.trim()) {
        requestData.context = context.trim();
    }
    
    await makeApiRequest('/api/qa-agent', requestData);
}

// Generic API request function
async function makeApiRequest(endpoint, data) {
    const loadingElement = document.getElementById('loading');
    const resultsElement = document.getElementById('results');
    
    try {
        // Show loading
        loadingElement.classList.remove('hidden');
        resultsElement.textContent = 'Request in progress...';
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        // Hide loading
        loadingElement.classList.add('hidden');
        
        if (response.ok) {
            showResults(result);
            return result;
        } else {
            showError(result);
            return null;
        }
    } catch (error) {
        loadingElement.classList.add('hidden');
        showError({ error: 'Network error', message: error.message });
        return null;
    }
}

// Job management
function addActiveJob(taskId, taskType, status) {
    activeJobs.set(taskId, {
        taskId,
        taskType,
        status,
        timestamp: new Date()
    });
    updateJobsList();
}

function updateJobStatus(taskId, status, result = null) {
    if (activeJobs.has(taskId)) {
        const job = activeJobs.get(taskId);
        job.status = status;
        if (result) {
            job.result = result;
        }
        activeJobs.set(taskId, job);
        updateJobsList();
    }
}

function updateJobsList() {
    const jobsList = document.getElementById('jobs-list');
    
    if (activeJobs.size === 0) {
        jobsList.innerHTML = '<p class="no-jobs">No active jobs</p>';
        return;
    }
    
    jobsList.innerHTML = '';
    
    activeJobs.forEach((job, taskId) => {
        const jobElement = document.createElement('div');
        jobElement.className = 'job-item';
        jobElement.innerHTML = `
            <div class="job-info">
                <div class="job-id">Task ID: ${taskId}</div>
                <div>Type: ${job.taskType}</div>
                <div>Started: ${job.timestamp.toLocaleTimeString()}</div>
            </div>
            <div class="job-actions">
                <span class="job-status ${job.status}">${job.status}</span>
                <button onclick="checkSpecificJobStatus('${taskId}')" class="btn-secondary" style="margin-left: 10px; padding: 6px 12px; font-size: 12px;">Check</button>
                ${job.status === 'completed' ? `<button onclick="showJobResult('${taskId}')" class="btn-primary" style="margin-left: 5px; padding: 6px 12px; font-size: 12px;">View Result</button>` : ''}
            </div>
        `;
        jobsList.appendChild(jobElement);
    });
}

async function checkJobStatus() {
    const taskId = document.getElementById('task-id').value.trim();
    console.log('Task ID from input:', taskId);
    
    if (!taskId) {
        showError({ error: 'Validation Error', message: 'Please enter a Task ID' });
        return;
    }
    
    // Show loading state
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.classList.remove('hidden');
    }
    
    await checkSpecificJobStatus(taskId);
    
    // Hide loading state
    if (loadingElement) {
        loadingElement.classList.add('hidden');
    }
}

async function checkSpecificJobStatus(taskId) {
    console.log(`Checking job status for task ID: ${taskId}`);
    
    try {
        const response = await fetch(`/api/job-status/${taskId}`);
        console.log(`Response status: ${response.status}`);
        
        const result = await response.json();
        console.log('Job status result:', result);
        
        if (response.ok) {
            updateJobStatus(taskId, result.status, result.result);
            
            // Show the complete result
            if (result.status === 'completed' && result.result) {
                showResults({
                    taskId: taskId,
                    status: result.status,
                    message: `✅ Job ${taskId} completed successfully!`,
                    completedResult: result.result
                });
            } else {
                showResults({
                    taskId: taskId,
                    status: result.status,
                    message: `Job status: ${result.status}`,
                    rawResponse: result
                });
            }
        } else {
            console.error('Job status check failed:', result);
            showError({
                error: 'Job Status Check Failed',
                taskId: taskId,
                details: result
            });
        }
    } catch (error) {
        console.error('Network error checking job status:', error);
        showError({ 
            error: 'Network error', 
            message: error.message,
            taskId: taskId
        });
    }
}

async function monitorJob(taskId) {
    const checkInterval = setInterval(async () => {
        try {
            const response = await fetch(`/api/job-status/${taskId}`);
            const result = await response.json();
            
            if (response.ok) {
                updateJobStatus(taskId, result.status, result.result);
                
                if (result.status === 'completed' || result.status === 'failed') {
                    clearInterval(checkInterval);
                    
                    if (result.status === 'completed' && result.result) {
                        // Show notification or update UI
                        console.log(`Job ${taskId} completed!`);
                    }
                }
            }
        } catch (error) {
            console.error('Error monitoring job:', error);
            clearInterval(checkInterval);
        }
    }, 10000); // Check every 10 seconds
    
    // Stop monitoring after 10 minutes
    setTimeout(() => clearInterval(checkInterval), 600000);
}

function showJobResult(taskId) {
    const job = activeJobs.get(taskId);
    if (job && job.result) {
        showResults(job.result);
    }
}

// Results display functions
function showResults(data) {
    const resultsElement = document.getElementById('results');
    resultsElement.textContent = JSON.stringify(data, null, 2);
    resultsElement.scrollTop = 0;
}

function showError(error) {
    const resultsElement = document.getElementById('results');
    resultsElement.textContent = JSON.stringify(error, null, 2);
    resultsElement.scrollTop = 0;
}

function clearResults() {
    const resultsElement = document.getElementById('results');
    resultsElement.textContent = 'No results yet. Submit a form above to see API responses.';
}

function copyResults() {
    const resultsElement = document.getElementById('results');
    const text = resultsElement.textContent;
    
    if (text && text !== 'No results yet. Submit a form above to see API responses.') {
        navigator.clipboard.writeText(text).then(() => {
            const copyButton = document.querySelector('.btn-copy');
            const originalText = copyButton.textContent;
            copyButton.textContent = 'Copied!';
            copyButton.style.background = '#059669';
            
            setTimeout(() => {
                copyButton.textContent = originalText;
                copyButton.style.background = '#10b981';
            }, 2000);
        }).catch(() => {
            alert('Failed to copy to clipboard');
        });
    } else {
        alert('No results to copy');
    }
}

// Make functions globally available
window.openTab = openTab;
window.addCustomField = addCustomField;
window.removeCustomField = removeCustomField;
window.enrichCompanyAsync = enrichCompanyAsync;
window.checkJobStatus = checkJobStatus;
window.checkSpecificJobStatus = checkSpecificJobStatus;
window.showJobResult = showJobResult;
window.clearResults = clearResults;
window.copyResults = copyResults;
