const vscode = require('vscode');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

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

    panel.webview.onDidReceiveMessage(async message => {
        switch (message.command) {
            case 'runOPA':
                await runOPAEval(message.regoContent, message.jsonContent, message.policyType, panel);
                return;
        }
    });
}

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
                textarea {
                    width: 100%;
                    height: 100px;
                    padding: 10px;
                    margin-top: 10px;
                    border-radius: 5px;
                    border: 1px solid #444;
                    background-color: #282c34;
                    color: #abb2bf;
                }
                button {
                    padding: 10px;
                    margin-top: 10px;
                    width: 100%;
                    border-radius: 5px;
                    border: none;
                    background-color: #007acc;
                    color: white;
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
            </style>
        </head>
        <body>
            <h1>OPA Validation</h1>
            <textarea id="regoContent" placeholder="Enter Rego content..."></textarea>
            <textarea id="jsonContent" placeholder="Enter JSON content..."></textarea>
            <input type="text" id="policyType" placeholder="Enter policy type (e.g., data.example.allow)" />
            <button id="run">Run OPA Validation</button>
            <div id="output"></div> <!-- Output box -->
            <script>
                const vscode = acquireVsCodeApi();

                document.getElementById('run').onclick = async () => {
                    const regoContent = document.getElementById('regoContent').value;
                    const jsonContent = document.getElementById('jsonContent').value;
                    const policyType = document.getElementById('policyType').value;

                    if (!regoContent || !jsonContent || !policyType) {
                        alert('Please provide Rego content, JSON content, and a policy type.');
                        return;
                    }

                    vscode.postMessage({
                        command: 'runOPA',
                        regoContent,
                        jsonContent,
                        policyType
                    });
                };

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

async function runOPAEval(regoContent, jsonContent, policyType, panel) {
    if (!regoContent || !jsonContent || !policyType) {
        vscode.window.showErrorMessage('Please provide the contents of the .rego and .json files and enter a policy type.');
        return;
    }

    // Create temporary files to store the content
    const regoFilePath = path.join(__dirname, 'temp.rego');
    const jsonFilePath = path.join(__dirname, 'temp.json');

    fs.writeFileSync(regoFilePath, regoContent);
    fs.writeFileSync(jsonFilePath, jsonContent);

    const opaCommand = `opa eval -i ${jsonFilePath} -d ${regoFilePath} "${policyType}"`;

    exec(opaCommand, (error, stdout, stderr) => {
        // Clean up temporary files after execution
        fs.unlinkSync(regoFilePath);
        fs.unlinkSync(jsonFilePath);

        if (error) {
            console.error(`Error: ${stderr}`);
            panel.webview.postMessage({ output: 'Error evaluating the policy.' });
            return;
        }

        panel.webview.postMessage({ output: stdout });
    });
}

module.exports = validateOPA;
