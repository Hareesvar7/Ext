const vscode = require('vscode');
const axios = require('axios');

// Function to create the validation panel
async function validateOPA() {
    const panel = vscode.window.createWebviewPanel(
        'opaValidation', // Identifies the type of the webview
        'OPA Validation', // Title of the panel
        vscode.ViewColumn.One, // Show the panel in the first column
        {
            enableScripts: true, // Allow scripts in the webview
        }
    );

    panel.webview.html = getWebviewContent();

    // Handle messages from the webview
    panel.webview.onDidReceiveMessage(async (message) => {
        switch (message.command) {
            case 'runOPA':
                await runOPAEval(message.regoContent, message.jsonContent, message.policyType, panel);
                return;
        }
    });
}

// Function to get the HTML content for the webview
function getWebviewContent() {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>OPA Validation</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    background-color: #1e1e1e;
                    color: #d4d4d4;
                }
                input, button {
                    padding: 10px;
                    margin-top: 10px;
                    width: 100%;
                    border-radius: 5px;
                    border: 1px solid #444;
                }
                button {
                    background-color: #007acc;
                    color: white;
                    border: none;
                }
                button:hover {
                    background-color: #005a9c;
                }
                h1 {
                    color: #61afef;
                }
                #output {
                    background: #282c34;
                    color: #abb2bf;
                    padding: 10px;
                    border-radius: 5px;
                    overflow: auto;
                    white-space: pre-wrap;
                    height: 300px; /* Set height for the output box */
                    margin-top: 20px; /* Add margin for spacing */
                }
                .loading {
                    color: yellow;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <h1>OPA Validation</h1>
            <input type="file" id="regoFile" accept=".rego" />
            <input type="file" id="jsonFile" accept=".json" />
            <input type="text" id="policyType" placeholder="Enter policy type (e.g., data.example.allow)" />
            <button id="run">Run OPA Validation</button>
            <div id="output"></div> <!-- Output box -->
            <script>
                const vscode = acquireVsCodeApi();

                document.getElementById('run').onclick = async () => {
                    const regoFileInput = document.getElementById('regoFile');
                    const jsonFileInput = document.getElementById('jsonFile');

                    if (regoFileInput.files.length === 0 || jsonFileInput.files.length === 0) {
                        alert('Please select both .rego and .json files.');
                        return;
                    }

                    const regoFile = regoFileInput.files[0];
                    const jsonFile = jsonFileInput.files[0];
                    const policyType = document.getElementById('policyType').value;

                    const regoContent = await readFileContent(regoFile);
                    const jsonContent = await readFileContent(jsonFile);

                    document.getElementById('output').innerHTML = '<div class="loading">Running OPA validation...</div>';
                    
                    vscode.postMessage({
                        command: 'runOPA',
                        regoContent,
                        jsonContent,
                        policyType
                    });
                };

                async function readFileContent(file) {
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = () => reject(new Error('Failed to read file'));
                        reader.readAsText(file);
                    });
                }

                window.addEventListener('message', event => {
                    const message = event.data;
                    if (message.output) {
                        document.getElementById('output').innerText = message.output;
                    }
                });
            </script>
        </body>
        </html>`;
}

// Function to handle OPA evaluation
async function runOPAEval(regoContent, jsonContent, policyType, panel) {
    if (!regoContent || !jsonContent || !policyType) {
        vscode.window.showErrorMessage('Please provide the contents of the .rego and .json files and enter a policy type.');
        return;
    }

    // Prepare the request payload
    const formData = new FormData();
    formData.append('regoFile', new Blob([regoContent], { type: 'text/plain' }), 'temp_policy.rego');
    formData.append('jsonFile', new Blob([jsonContent], { type: 'application/json' }), 'temp_plan.json');
    formData.append('policyInput', policyType); // Send the policy type

    try {
        const response = await axios.post('http://localhost:5000/evaluate', formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });

        panel.webview.postMessage({ output: response.data.output }); // Send the output back to the webview
    } catch (error) {
        console.error("Error during OPA evaluation:", error);
        panel.webview.postMessage({ output: 'Error evaluating the policy.' });
    }
}

module.exports = validateOPA;
