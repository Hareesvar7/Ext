const vscode = require('vscode');

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

    panel.webview.onDidReceiveMessage(
        async (message) => {
            switch (message.command) {
                case 'serviceSelected':
                    const template = getServiceTemplate(message.provider, message.service);
                    panel.webview.postMessage({ command: 'showTemplate', template });
                    break;
            }
        },
        undefined,
        context.subscriptions // Use context.subscriptions for cleanup
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
                    display: flex;
                    flex-direction: column;
                    align-items: center; /* Center align the contents */
                }
                h1 {
                    color: #61afef;
                    margin-bottom: 20px; /* Add margin to separate title from dropdowns */
                }
                select {
                    padding: 10px;
                    margin: 10px;
                    border-radius: 5px;
                    border: 1px solid #007acc;
                    background-color: white;
                    color: black;
                    width: 200px; /* Set fixed width for dropdowns */
                    font-size: 16px;
                }
                .output-box {
                    background-color: white;
                    color: black;
                    padding: 10px;
                    border-radius: 5px;
                    margin-top: 20px;
                    overflow: auto;
                    height: 200px;
                    width: 100%; /* Ensure it takes the full width */
                    white-space: pre-wrap;
                    box-shadow: 0px 4px 6px rgba(0,0,0,0.1);
                }
            </style>
        </head>
        <body>
            <h1>NIST Management Policies</h1>
            <select id="cloudProvider" onchange="updateServices()">
                <option value="">Select Cloud Provider</option>
                <option value="AWS">AWS</option>
                <option value="Azure">Azure</option>
                <option value="GCP">GCP</option>
            </select>

            <select id="cloudService" onchange="serviceSelected()" disabled>
                <option value="">Select Service</option>
            </select>
            
            <div class="output-box" id="outputBox"></div>

            <script>
                const servicesMap = {
                    AWS: ['EFS', 'EKS', 'S3', 'VPC', 'IAM', 'LAMBDA'],
                    Azure: ['Blob Storage', 'AKS', 'Function App', 'VNet', 'Key Vault'],
                    GCP: ['Cloud Storage', 'GKE', 'Cloud Functions', 'VPC', 'IAM'],
                };

                function updateServices() {
                    const providerSelect = document.getElementById('cloudProvider');
                    const serviceSelect = document.getElementById('cloudService');
                    const selectedProvider = providerSelect.value;

                    // Clear previous options
                    serviceSelect.innerHTML = '<option value="">Select Service</option>';
                    serviceSelect.disabled = false; // Enable service dropdown

                    if (selectedProvider) {
                        const services = servicesMap[selectedProvider];
                        services.forEach(service => {
                            const option = document.createElement('option');
                            option.value = service;
                            option.textContent = service;
                            serviceSelect.appendChild(option);
                        });
                    } else {
                        serviceSelect.disabled = true; // Disable service dropdown if no provider is selected
                    }
                }

                function serviceSelected() {
                    const providerSelect = document.getElementById('cloudProvider');
                    const serviceSelect = document.getElementById('cloudService');
                    const provider = providerSelect.value;
                    const service = serviceSelect.value;

                    if (provider && service) {
                        vscode.postMessage({ command: 'serviceSelected', provider, service });
                    }
                }

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

function getServiceTemplate(provider, service) {
    const templates = {
        AWS: {
            EFS: `
# AWS EFS Policy
allow {
    input.path = "EFS"
    input.method = "GET"
}
            `,
            EKS: `
# AWS EKS Policy
allow {
    input.path = "EKS"
    input.method = "POST"
}
            `,
            S3: `
# AWS S3 Policy
allow {
    input.path = "S3"
    input.method = "GET"
}
            `,
            VPC: `
# AWS VPC Policy
allow {
    input.path = "VPC"
    input.method = "POST"
}
            `,
            IAM: `
# AWS IAM Policy
allow {
    input.path = "IAM"
    input.method = "GET"
}
            `,
            LAMBDA: `
# AWS Lambda Policy
allow {
    input.path = "LAMBDA"
    input.method = "POST"
}
            `,
        },
        Azure: {
            'Blob Storage': `
# Azure Blob Storage Policy
allow {
    input.path = "Blob Storage"
    input.method = "GET"
}
            `,
            AKS: `
# Azure AKS Policy
allow {
    input.path = "AKS"
    input.method = "POST"
}
            `,
            'Function App': `
# Azure Function App Policy
allow {
    input.path = "Function App"
    input.method = "GET"
}
            `,
            VNet: `
# Azure VNet Policy
allow {
    input.path = "VNet"
    input.method = "POST"
}
            `,
            'Key Vault': `
# Azure Key Vault Policy
allow {
    input.path = "Key Vault"
    input.method = "GET"
}
            `,
        },
        GCP: {
            'Cloud Storage': `
# GCP Cloud Storage Policy
allow {
    input.path = "Cloud Storage"
    input.method = "GET"
}
            `,
            GKE: `
# GCP GKE Policy
allow {
    input.path = "GKE"
    input.method = "POST"
}
            `,
            'Cloud Functions': `
# GCP Cloud Functions Policy
allow {
    input.path = "Cloud Functions"
    input.method = "GET"
}
            `,
            VPC: `
# GCP VPC Policy
allow {
    input.path = "VPC"
    input.method = "POST"
}
            `,
            IAM: `
# GCP IAM Policy
allow {
    input.path = "IAM"
    input.method = "GET"
}
            `,
        },
    };

    return templates[provider][service] || 'Template not found.';
}

module.exports = showCloudServiceSelection;
