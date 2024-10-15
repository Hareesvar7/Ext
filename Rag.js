const vscode = require('vscode');

async function showCloudServiceSelection() {
    const panel = vscode.window.createWebviewPanel(
        'cloudServiceSelection', // Identifies the type of the webview
        'Select Cloud Service',  // Title of the panel
        vscode.ViewColumn.One,    // Show the panel in the first column
        {
            enableScripts: true, // Allow scripts in the webview
        }
    );

    // Set the HTML content of the webview
    panel.webview.html = getWebviewContent();

    // Handle messages from the webview
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
                button {
                    background-color: #007acc;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    margin: 5px;
                    cursor: pointer;
                    border-radius: 5px;
                }
                button:hover {
                    background-color: #005a9c;
                }
                h1 {
                    color: #61afef;
                }
                .services {
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <h1>Select Cloud Provider</h1>
            <div class="providers">
                <button onclick="selectProvider('AWS')">AWS</button>
                <button onclick="selectProvider('Azure')">Azure</button>
                <button onclick="selectProvider('GCP')">GCP</button>
            </div>
            <div class="services"></div>

            <script>
                function selectProvider(provider) {
                    const servicesMap = {
                        AWS: ['EFS', 'EKS', 'S3', 'VPC', 'IAM', 'LAMBDA'],
                        Azure: ['Blob Storage', 'AKS', 'Function App', 'VNet', 'Key Vault'],
                        GCP: ['Cloud Storage', 'GKE', 'Cloud Functions', 'VPC', 'IAM'],
                    };
                    const services = servicesMap[provider];
                    const servicesContainer = document.querySelector('.services');
                    servicesContainer.innerHTML = '<h2>Select Service</h2>';
                    services.forEach(service => {
                        const button = document.createElement('button');
                        button.textContent = service;
                        button.onclick = () => {
                            vscode.postMessage({ command: 'serviceSelected', provider, service });
                        };
                        servicesContainer.appendChild(button);
                    });
                }

                window.addEventListener('message', event => {
                    const message = event.data;
                    switch (message.command) {
                        case 'showTemplate':
                            document.body.innerHTML = '<h1>Service Template</h1><pre>' + message.template + '</pre>';
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
            EFS: 'template for AWS EFS service... \n\nallow {\n    input.path = "EFS"\n}',
            EKS: 'template for AWS EKS service... \n\nallow {\n    input.path = "EKS"\n}',
            S3: 'template for AWS S3 service... \n\nallow {\n    input.path = "S3"\n}',
            VPC: 'template for AWS VPC service... \n\nallow {\n    input.path = "VPC"\n}',
            IAM: 'template for AWS IAM service... \n\nallow {\n    input.path = "IAM"\n}',
            LAMBDA: 'template for AWS Lambda service... \n\nallow {\n    input.path = "LAMBDA"\n}',
        },
        Azure: {
            'Blob Storage': 'template for Azure Blob Storage service... \n\nallow {\n    input.path = "Blob Storage"\n}',
            AKS: 'template for Azure AKS service... \n\nallow {\n    input.path = "AKS"\n}',
            'Function App': 'template for Azure Function App service... \n\nallow {\n    input.path = "Function App"\n}',
            VNet: 'template for Azure VNet service... \n\nallow {\n    input.path = "VNet"\n}',
            'Key Vault': 'template for Azure Key Vault service... \n\nallow {\n    input.path = "Key Vault"\n}',
        },
        GCP: {
            'Cloud Storage': 'template for GCP Cloud Storage service... \n\nallow {\n    input.path = "Cloud Storage"\n}',
            GKE: 'template for GCP GKE service... \n\nallow {\n    input.path = "GKE"\n}',
            'Cloud Functions': 'template for GCP Cloud Functions service... \n\nallow {\n    input.path = "Cloud Functions"\n}',
            VPC: 'template for GCP VPC service... \n\nallow {\n    input.path = "VPC"\n}',
            IAM: 'template for GCP IAM service... \n\nallow {\n    input.path = "IAM"\n}',
        },
    };

    return templates[provider][service] || 'Template not found.';
}

module.exports = showCloudServiceSelection;
