const vscode = require('vscode');
const { getStorageServiceTemplate } = require('./ServiceTemplate');

async function showCloudStorageSelection(context) {
    const panel = vscode.window.createWebviewPanel(
        'cloudStorageSelection', 
        'Select Cloud Storage and Generate Template', 
        vscode.ViewColumn.One, 
        {
            enableScripts: true
        }
    );

    panel.webview.html = getWebviewContent();

    panel.webview.onDidReceiveMessage(
        (message) => {
            if (message.command === 'generateTemplate') {
                const template = getStorageServiceTemplate(message.cloud, message.service);
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
        <title>Select Cloud Storage</title>
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
            .dropdown {
                margin-bottom: 15px;
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
        <h1>Select Cloud Provider and Service</h1>

        <div class="dropdown">
            <label for="cloudProvider">Select Cloud Provider:</label>
            <select id="cloudProvider">
                <option value="AWS">AWS</option>
                <option value="Azure">Azure</option>
                <option value="GCP">GCP</option>
            </select>
        </div>

        <div class="dropdown">
            <label for="service">Select Service:</label>
            <select id="service">
                <option value="">--Select a service--</option>
            </select>
        </div>

        <button onclick="generateTemplate()">Generate Template</button>

        <div class="output-box" id="outputBox"></div>

        <script>
            const servicesMap = {
                AWS: ['EFS', 'EKS', 'S3', 'VPC', 'IAM', 'LAMBDA'],
                Azure: ['Blob Storage', 'AKS', 'Function App', 'VNet', 'Key Vault'],
                GCP: ['Cloud Storage', 'GKE', 'Cloud Functions', 'VPC', 'IAM']
            };

            document.getElementById('cloudProvider').addEventListener('change', function() {
                const provider = this.value;
                const serviceDropdown = document.getElementById('service');
                serviceDropdown.innerHTML = '<option value="">--Select a service--</option>';
                servicesMap[provider].forEach(service => {
                    const option = document.createElement('option');
                    option.value = service;
                    option.textContent = service;
                    serviceDropdown.appendChild(option);
                });
            });

            function generateTemplate() {
                const cloudProvider = document.getElementById('cloudProvider').value;
                const service = document.getElementById('service').value;
                if (cloudProvider && service) {
                    vscode.postMessage({ command: 'generateTemplate', cloud: cloudProvider, service: service });
                } else {
                    alert('Please select both a cloud provider and a service.');
                }
            }

            window.addEventListener('message', event => {
                const message = event.data;
                if (message.command === 'showTemplate') {
                    const outputBox = document.getElementById('outputBox');
                    outputBox.innerHTML = '<h2>OPA Policy Template</h2><pre>' + message.template + '</pre>';
                }
            });
        </script>
    </body>
    </html>`;
}

module.exports = {
    showCloudStorageSelection
};
