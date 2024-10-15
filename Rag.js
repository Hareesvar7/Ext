const vscode = require('vscode');

async function showCloudServiceSelection() {
    const cloudProviders = ['AWS', 'Azure', 'GCP'];
    const selectedCloudProvider = await vscode.window.showQuickPick(cloudProviders, {
        placeHolder: 'Select a cloud provider',
    });

    if (!selectedCloudProvider) {
        vscode.window.showErrorMessage('No cloud provider selected.');
        return;
    }

    const services = getServicesByProvider(selectedCloudProvider);
    const selectedService = await vscode.window.showQuickPick(services, {
        placeHolder: `Select a service for ${selectedCloudProvider}`,
    });

    if (!selectedService) {
        vscode.window.showErrorMessage('No service selected.');
        return;
    }

    const template = getServiceTemplate(selectedCloudProvider, selectedService);
    showTemplateInOutput(template);
}

function getServicesByProvider(provider) {
    const serviceMap = {
        AWS: ['EFS', 'EKS', 'S3', 'VPC', 'IAM', 'LAMBDA'],
        Azure: ['Blob Storage', 'AKS', 'Function App', 'VNet', 'Key Vault'],
        GCP: ['Cloud Storage', 'GKE', 'Cloud Functions', 'VPC', 'IAM'],
    };
    return serviceMap[provider] || [];
}

function getServiceTemplate(provider, service) {
    const templates = {
        AWS: {
            EFS: 'AWS EFS Template Content...',
            EKS: 'AWS EKS Template Content...',
            S3: 'AWS S3 Template Content...',
            VPC: 'AWS VPC Template Content...',
            IAM: 'AWS IAM Template Content...',
            LAMBDA: 'AWS Lambda Template Content...',
        },
        Azure: {
            'Blob Storage': 'Azure Blob Storage Template Content...',
            AKS: 'Azure AKS Template Content...',
            'Function App': 'Azure Function App Template Content...',
            VNet: 'Azure VNet Template Content...',
            'Key Vault': 'Azure Key Vault Template Content...',
        },
        GCP: {
            'Cloud Storage': 'GCP Cloud Storage Template Content...',
            GKE: 'GCP GKE Template Content...',
            'Cloud Functions': 'GCP Cloud Functions Template Content...',
            VPC: 'GCP VPC Template Content...',
            IAM: 'GCP IAM Template Content...',
        },
    };

    return templates[provider][service] || 'Template not found.';
}

function showTemplateInOutput(template) {
    const panel = vscode.window.createWebviewPanel(
        'cloudServiceTemplate', // Identifies the type of the webview
        'Cloud Service Template', // Title of the panel
        vscode.ViewColumn.One, // Show the panel in the first column
        {
            enableScripts: true, // Allow scripts in the webview
        }
    );

    panel.webview.html = getWebviewContent(template);
}

function getWebviewContent(template) {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cloud Service Template</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    background-color: #1e1e1e;
                    color: #d4d4d4;
                }
                pre {
                    background: #282c34;
                    color: #abb2bf;
                    padding: 10px;
                    border-radius: 5px;
                    overflow: auto;
                    white-space: pre-wrap; /* Ensures long lines are wrapped */
                }
                h1 {
                    color: #61afef;
                }
            </style>
        </head>
        <body>
            <h1>Service Template</h1>
            <pre>${template}</pre>
        </body>
        </html>`;
}

module.exports = showCloudServiceSelection;
