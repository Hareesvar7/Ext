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
            } else if (message.command === 'copyToClipboard') {
                vscode.env.clipboard.writeText(message.template);
                vscode.window.showInformationMessage('Template copied to clipboard!');
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
                    background-color: #1e1e1e;
                    color: #d4d4d4;
                    padding: 20px;
                }
                h1 {
                    color: #61afef;
                    text-align: center;
                }
                .dropdown {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                }
                select {
                    padding: 10px;
                    margin-right: 20px;
                    font-size: 16px;
                    color: #333;
                    background-color: white;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    width: 300px;
                    margin-bottom: 20px;
                }
                .output-box {
                    background-color: white;
                    color: black;
                    padding: 15px;
                    border-radius: 5px;
                    margin-top: 20px;
                    height: 300px;
                    white-space: pre-wrap;
                    overflow-y: scroll;
                    box-shadow: 0px 4px 6px rgba(0,0,0,0.1);
                    font-size: 14px;
                    line-height: 1.5;
                }
                .copy-button {
                    background-color: #007acc;
                    color: white;
                    border: none;
                    padding: 10px;
                    cursor: pointer;
                    border-radius: 5px;
                    margin-top: 10px;
                    transition: background-color 0.3s;
                    display: block;
                    width: 100%;
                    text-align: center;
                }
                .copy-button:hover {
                    background-color: #005f99;
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
            <button class="copy-button" id="copyButton" style="display: none;">Copy to Clipboard</button>

            <script>
                const vscode = acquireVsCodeApi();

                const serviceMap = {
                    AWS: ['EFS', 'EKS', 'S3', 'VPC', 'IAM', 'LAMBDA'],
                    Azure: ['Blob Storage', 'AKS', 'Function App', 'VNet', 'Key Vault'],
                    GCP: ['Cloud Storage', 'GKE', 'Cloud Functions', 'VPC', 'IAM']
                };

                const cloudProviderDropdown = document.getElementById('cloudProvider');
                const cloudServiceDropdown = document.getElementById('cloudService');
                const outputBox = document.getElementById('outputBox');
                const copyButton = document.getElementById('copyButton');

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
                        outputBox.textContent = message.template;
                        copyButton.style.display = 'block'; // Show the copy button
                        copyButton.onclick = () => {
                            vscode.postMessage({ 
                                command: 'copyToClipboard', 
                                template: message.template 
                            });
                        };
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
