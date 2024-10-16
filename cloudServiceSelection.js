const vscode = require('vscode');
const { getStorageServiceTemplate } = require('./ServiceTemplate');

async function showCloudServiceSelection(context) {
    const panel = vscode.window.createWebviewPanel(
        'cloudServiceSelection', 
        'Select Cloud Service and Generate Template', 
        vscode.ViewColumn.One, 
        {
            enableScripts: true
        }
    );

    panel.webview.html = getWebviewContent();

    // Handle messages from the webview (when user selects service)
    panel.webview.onDidReceiveMessage(
        (message) => {
            if (message.command === 'generateTemplate') {
                const template = getStorageServiceTemplate(message.cloud, message.service);
                
                if (template) {
                    // Send the generated template back to the webview
                    panel.webview.postMessage({ command: 'showTemplate', template });
                } else {
                    // If no template is found, show a message to the user
                    vscode.window.showWarningMessage('No template found for the selected service.');
                }
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
                <option value="">--Select a cloud provider--</option>
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

        <button id="generateTemplateButton" disabled>Generate Template</button>

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
                if (provider) {
                    servicesMap[provider].forEach(service => {
                        const option = document.createElement('option');
                        option.value = service;
                        option.textContent = service;
                        serviceDropdown.appendChild(option);
                    });
                }
                toggleGenerateButton();
            });

            document.getElementById('service').addEventListener('change', function() {
                toggleGenerateButton();
            });

            function toggleGenerateButton() {
                const cloudProvider = document.getElementById('cloudProvider').value;
                const service = document.getElementById('service').value;
                const generateButton = document.getElementById('generateTemplateButton');
                generateButton.disabled = !(cloudProvider && service);
            }

            document.getElementById('generateTemplateButton').addEventListener('click', function() {
                const cloudProvider = document.getElementById('cloudProvider').value;
                const service = document.getElementById('service').value;
                vscode.postMessage({ command: 'generateTemplate', cloud: cloudProvider, service: service });
            });

            // Listen for messages from the extension
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
    showCloudServiceSelection
};
