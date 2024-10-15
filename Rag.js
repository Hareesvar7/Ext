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
                    margin-bottom: 20px; /* Add margin to separate title from buttons */
                }
                .providers, .services {
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                    margin-bottom: 20px;
                    flex-wrap: wrap; 
                }
                .provider-button, .service-button {
                    background-color: white;
                    color: #007acc;
                    border: none;
                    padding: 15px;
                    cursor: pointer;
                    border-radius: 5px;
                    flex: 1;
                    margin: 10px;
                    transition: background-color 0.3s, color 0.3s;
                    max-width: 150px;
                    text-align: center;
                    box-shadow: 0px 4px 6px rgba(0,0,0,0.1);
                }
                .provider-button:hover, .service-button:hover {
                    background-color: #007acc;
                    color: white;
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
            <div class="providers">
                <button class="provider-button" onclick="selectProvider('AWS')">AWS</button>
                <button class="provider-button" onclick="selectProvider('Azure')">Azure</button>
                <button class="provider-button" onclick="selectProvider('GCP')">GCP</button>
            </div>
            <div class="services"></div>
            <div class="output-box" id="outputBox"></div>

            <script>
                function selectProvider(provider) {
                    const servicesMap = {
                        AWS: ['EFS', 'EKS', 'S3', 'VPC', 'IAM', 'LAMBDA'],
                        Azure: ['Blob Storage', 'AKS', 'Function App', 'VNet', 'Key Vault'],
                        GCP: ['Cloud Storage', 'GKE', 'Cloud Functions', 'VPC', 'IAM'],
                    };
                    const services = servicesMap[provider];
                    const servicesContainer = document.querySelector('.services');
                    servicesContainer.innerHTML = ''; // Clear previous buttons

                    services.forEach(service => {
                        const button = document.createElement('button');
                        button.className = 'service-button';
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
