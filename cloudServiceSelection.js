const vscode = require('vscode');
const { getServiceTemplate } = require('../services/ServiceTemplate');

async function showCloudServiceSelection(context) {
    const panel = vscode.window.createWebviewPanel(
        'cloudServiceSelection', 
        'Select Cloud Service', 
        vscode.ViewColumn.One,  
        {
            enableScripts: true, 
        }
    );

    panel.webview.html = getWebviewContent();

    // Listen to messages from the webview
    panel.webview.onDidReceiveMessage(
        async (message) => {
            if (message.command === 'serviceSelected') {
                const template = getServiceTemplate(message.provider, message.service);
                panel.webview.postMessage({ command: 'showTemplate', template });
            }
        },
        undefined,
        context.subscriptions
    );
}

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
                h1, h2 {
                    color: #61afef;
                }
                .dropdown {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 20px;
                }
                select {
                    padding: 10px;
                    margin-right: 20px;
                    font-size: 16px;
                    color: #333;
                    background-color: white;
                    border: 1px solid #ccc;
                    border-radius: 5px;
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
            <div class="dropdown">
                <select id="cloudProvider">
                    <option value="" disabled selected>Select Cloud Provider</option>
                    <option value="AWS">AWS</option>
                    <option value="Azure">Azure</option>
                    <option value="GCP">GCP</option>
                </select>

                <select id="cloudService">
                    <option value="" disabled selected>Select Cloud Service</option>
                </select>
            </div>
            <div class="output-box" id="outputBox">Service template will appear here.</div>

            <script>
                const vscode = acquireVsCodeApi();

                const serviceMap = {
                    AWS: ['EFS', 'EKS', 'S3', 'VPC', 'IAM', 'LAMBDA'],
                    Azure: ['Blob Storage', 'AKS', 'Function App', 'VNet', 'Key Vault'],
                    GCP: ['Cloud Storage', 'GKE', 'Cloud Functions', 'VPC', 'IAM']
                };

                const cloudProviderDropdown = document.getElementById('cloudProvider');
                const cloudServiceDropdown = document.getElementById('cloudService');

                cloudProviderDropdown.addEventListener('change', (event) => {
                    const provider = event.target.value;
                    const services = serviceMap[provider] || [];

                    cloudServiceDropdown.innerHTML = '<option value="" disabled selected>Select Cloud Service</option>';
                    services.forEach(service => {
                        const option = document.createElement('option');
                        option.value = service;
                        option.textContent = service;
                        cloudServiceDropdown.appendChild(option);
                    });
                });

                cloudServiceDropdown.addEventListener('change', () => {
                    const provider = cloudProviderDropdown.value;
                    const service = cloudServiceDropdown.value;

                    vscode.postMessage({
                        command: 'serviceSelected',
                        provider: provider,
                        service: service
                    });
                });

                window.addEventListener('message', event => {
                    const message = event.data;
                    if (message.command === 'showTemplate') {
                        const outputBox = document.getElementById('outputBox');
                        outputBox.textContent = message.template;
                    }
                });
            </script>
        </body>
        </html>
    `;
}

module.exports = {
    showCloudServiceSelection
};
