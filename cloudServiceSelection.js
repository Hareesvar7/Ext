// src/commands/cloudServiceSelection.js
const vscode = require('vscode');
const serviceTemplates = require('../services/serviceTemplates');

// Function to show the cloud service selection webview
async function showCloudServiceSelection(context) {
    const panel = vscode.window.createWebviewPanel(
        'cloudServiceSelection',
        'NIST Management Policies',
        vscode.ViewColumn.One,
        {
            enableScripts: true,
        }
    );

    panel.webview.html = getWebviewContent();

    // Handle messages from the webview
    panel.webview.onDidReceiveMessage(
        (message) => handleWebviewMessage(message, panel),
        undefined,
        context.subscriptions // Use context.subscriptions for cleanup
    );
}

// Function to generate the webview HTML content
function getWebviewContent() {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Select Cloud Service</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    background-color: #1e1e1e;
                    color: #d4d4d4;
                }
                h1 {
                    color: #61afef;
                }
                select, button {
                    padding: 10px;
                    margin: 10px;
                    border-radius: 5px;
                    border: 1px solid #007acc;
                    background-color: white;
                    color: #007acc;
                }
                .output-box {
                    background-color: white;
                    color: black;
                    padding: 10px;
                    border-radius: 5px;
                    margin-top: 20px;
                    overflow: auto;
                    height: 200px;
                    white-space: pre-wrap;
                    box-shadow: 0px 4px 6px rgba(0,0,0,0.1);
                }
            </style>
        </head>
        <body>
            <h1>NIST Management Policies</h1>
            <select id="cloudProvider">
                <option value="" disabled selected>Select Cloud Provider</option>
                <option value="AWS">AWS</option>
                <option value="Azure">Azure</option>
                <option value="GCP">GCP</option>
            </select>

            <select id="serviceSelect" disabled>
                <option value="" disabled selected>Select Service</option>
            </select>

            <div class="output-box" id="outputBox"></div>

            <script>
                const cloudProviderSelect = document.getElementById('cloudProvider');
                const serviceSelect = document.getElementById('serviceSelect');

                const servicesMap = {
                    AWS: ['EFS', 'EKS', 'S3', 'VPC', 'IAM', 'LAMBDA'],
                    Azure: ['Blob Storage', 'AKS', 'Function App', 'VNet', 'Key Vault'],
                    GCP: ['Cloud Storage', 'GKE', 'Cloud Functions', 'VPC', 'IAM'],
                };

                cloudProviderSelect.onchange = () => {
                    const provider = cloudProviderSelect.value;
                    serviceSelect.innerHTML = '<option value="" disabled selected>Select Service</option>';
                    servicesMap[provider].forEach(service => {
                        const option = document.createElement('option');
                        option.value = service;
                        option.textContent = service;
                        serviceSelect.appendChild(option);
                    });
                    serviceSelect.disabled = false;
                };

                serviceSelect.onchange = () => {
                    const provider = cloudProviderSelect.value;
                    const service = serviceSelect.value;
                    vscode.postMessage({ command: 'serviceSelected', provider, service });
                };

                window.addEventListener('message', event => {
                    const message = event.data;
                    switch (message.command) {
                        case 'showTemplate':
                            const outputBox = document.getElementById('outputBox');
                            outputBox.innerHTML = '<h2>Service Template</h2><pre>' + message.template + '</pre>';
                            break;
                    }
                });
            </script>
        </body>
        </html>`;
}

// Function to handle messages from the webview
function handleWebviewMessage(message, panel) {
    switch (message.command) {
        case 'serviceSelected':
            const template = getServiceTemplate(message.provider, message.service);
            panel.webview.postMessage({ command: 'showTemplate', template });
            break;
    }
}

// Function to get the service template based on provider and service
function getServiceTemplate(provider, service) {
    return serviceTemplates[provider][service] || 'Template not found.';
}

module.exports = showCloudServiceSelection;
