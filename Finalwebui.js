const vscode = require('vscode');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

async function validateOPA() {
    const panel = vscode.window.createWebviewPanel(
        'opaValidator', 
        'OPA Validator', 
        vscode.ViewColumn.One, 
        { enableScripts: true }
    );

    // Load webview content
    panel.webview.html = getWebviewContent();

    // Handle messages from the webview
    panel.webview.onDidReceiveMessage(
        (message) => {
            if (message.command === 'submitFiles') {
                const regoContent = message.regoContent;
                const jsonContent = message.jsonContent;

                // Create temporary files for the received content
                const regoTempPath = path.join(__dirname, 'tempPolicy.rego');
                const jsonTempPath = path.join(__dirname, 'tempInput.json');

                fs.writeFileSync(regoTempPath, regoContent);
                fs.writeFileSync(jsonTempPath, jsonContent);

                // Build the OPA command
                const opaCommand = `opa eval -i ${jsonTempPath} -d ${regoTempPath} "data.example.allow"`;

                // Execute the OPA command
                exec(opaCommand, (error, stdout, stderr) => {
                    if (error) {
                        panel.webview.postMessage({ command: 'displayError', error: stderr });
                        return;
                    }

                    panel.webview.postMessage({ command: 'displayResponse', response: stdout });
                });
            }
        },
        undefined,
        []
    );
}

// Function to generate the webview content
function getWebviewContent() {
    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>OPA Validator</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    padding: 20px;
                    background-color: #f4f7fa;
                    color: #333;
                }
                h1 {
                    font-size: 24px;
                    color: #4A90E2;
                    text-align: center;
                    margin-bottom: 20px;
                }
                label {
                    font-size: 16px;
                    color: #333;
                    margin-bottom: 10px;
                    display: block;
                }
                input[type="file"] {
                    font-size: 16px;
                    padding: 8px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    background-color: #fff;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                    margin-bottom: 20px;
                    display: block;
                    width: 100%;
                }
                button {
                    width: 100%;
                    padding: 12px;
                    margin-top: 10px;
                    background-color: #4A90E2;
                    color: #fff;
                    font-size: 16px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                }
                button:hover {
                    background-color: #357ABD;
                }
                .response {
                    margin-top: 20px;
                    padding: 20px;
                    border-radius: 8px;
                    background-color: #ffffff;
                    border: 1px solid #d1d5db;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                    max-height: 400px;
                    overflow-y: auto;
                    white-space: pre-wrap;
                    font-size: 16px;
                    color: #333;
                }
                .error {
                    color: red;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <h1>OPA Validator</h1>
            <label for="regoFile">Select Rego File:</label>
            <input type="file" id="regoFile" accept=".rego">
            <label for="jsonFile">Select JSON Input File:</label>
            <input type="file" id="jsonFile" accept=".json">
            <button id="submit">Validate Policy</button>
            <div class="response" id="response"></div>
            <script>
                const vscode = acquireVsCodeApi();
                document.getElementById('submit').addEventListener('click', () => {
                    const regoFileInput = document.getElementById('regoFile').files[0];
                    const jsonFileInput = document.getElementById('jsonFile').files[0];

                    if (!regoFileInput || !jsonFileInput) {
                        vscode.postMessage({ command: 'displayError', error: 'Both files must be selected.' });
                        return;
                    }

                    const reader = new FileReader();

                    reader.onload = function(event) {
                        const regoFileContent = event.target.result;

                        const jsonReader = new FileReader();
                        jsonReader.onload = function(e) {
                            const jsonFileContent = e.target.result;

                            vscode.postMessage({
                                command: 'submitFiles',
                                regoContent: regoFileContent,
                                jsonContent: jsonFileContent
                            });
                        };
                        jsonReader.readAsText(jsonFileInput);
                    };

                    reader.readAsText(regoFileInput);
                });

                // Listen for messages from the extension
                window.addEventListener('message', (event) => {
                    const message = event.data;
                    const responseDiv = document.getElementById('response');

                    if (message.command === 'displayResponse') {
                        responseDiv.innerHTML = '<strong>OPA Validation Results:</strong><br>' + message.response;
                    } else if (message.command === 'displayError') {
                        responseDiv.innerHTML = '<strong class="error">Error:</strong> ' + message.error;
                    }
                });
            </script>
        </body>
        </html>`;
}

module.exports = validateOPA;
