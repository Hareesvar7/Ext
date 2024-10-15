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
                .providers, .services {
                    display: flex;
                    justify-content: space-around;
                    margin-bottom: 20px;
                }
                .provider-button, .service-button {
                    background-color: white;
                    color: #1e1e1e;
                    border: 1px solid #ccc;
                    padding: 15px;
                    cursor: pointer;
                    border-radius: 5px;
                    flex: 1;
                    margin: 0 10px;
                    text-align: center;
                    min-width: 100px;
                    transition: background-color 0.3s;
                }
                .provider-button:hover, .service-button:hover {
                    background-color: #f0f0f0;
                }
                .service-button {
                    background-color: #fff;
                }
                .output {
                    margin-top: 20px;
                    padding: 15px;
                    background-color: #282c34;
                    color: #abb2bf;
                    border-radius: 5px;
                    white-space: pre-wrap; /* Ensures long lines are wrapped */
                    overflow: auto;
                }
            </style>
        </head>
        <body>
            <h1>Select Cloud Provider</h1>
            <div class="providers">
                <button class="provider-button" onclick="selectProvider('AWS')">AWS</button>
                <button class="provider-button" onclick="selectProvider('Azure')">Azure</button>
                <button class="provider-button" onclick="selectProvider('GCP')">GCP</button>
            </div>

            <h2>Select Service</h2>
            <div class="services" id="services-container">
                <!-- Services will be loaded here dynamically -->
            </div>

            <div id="output" class="output">
                <!-- Template output will be displayed here -->
            </div>

            <script>
                function selectProvider(provider) {
                    const servicesMap = {
                        AWS: ['EFS', 'EKS', 'S3', 'VPC', 'IAM', 'LAMBDA'],
                        Azure: ['Blob Storage', 'AKS', 'Function App', 'VNet', 'Key Vault'],
                        GCP: ['Cloud Storage', 'GKE', 'Cloud Functions', 'VPC', 'IAM'],
                    };
                    const services = servicesMap[provider];
                    const servicesContainer = document.getElementById('services-container');
                    servicesContainer.innerHTML = ''; // Clear existing buttons

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
                    if (message.command === 'showTemplate') {
                        const output = document.getElementById('output');
                        output.innerHTML = '<h2>Service Template</h2><pre>' + message.template + '</pre>';
                    }
                });
            </script>
        </body>
        </html>`;
}
