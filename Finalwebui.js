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
                await runOPAEval(message.regoFilePath, message.jsonFilePath, message.policyType, panel);
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
                pre {
                    background: #282c34;
                    color: #abb2bf;
                    padding: 10px;
                    border-radius: 5px;
                    overflow: auto;
                    white-space: pre-wrap;
                }
            </style>
        </head>
        <body>
            <h1>OPA Validation</h1>
            <input type="text" id="regoFilePath" placeholder="Select .rego file path" readonly />
            <button id="selectRego">Select .rego File</button>
            <input type="text" id="jsonFilePath" placeholder="Select input JSON file path" readonly />
            <button id="selectJson">Select JSON File</button>
            <input type="text" id="policyType" placeholder="Enter policy type (e.g., data.example.allow)" />
            <button id="run">Run OPA Validation</button>
            <pre id="output"></pre>
            <script>
                const vscode = acquireVsCodeApi();

                document.getElementById('selectRego').onclick = async () => {
                    const regoFileUri = await vscode.window.showOpenDialog({
                        canSelectMany: false,
                        filters: { 'Rego Files': ['rego'] },
                    });

                    if (regoFileUri && regoFileUri.length > 0) {
                        document.getElementById('regoFilePath').value = regoFileUri[0].fsPath;
                    }
                };

                document.getElementById('selectJson').onclick = async () => {
                    const jsonFileUri = await vscode.window.showOpenDialog({
                        canSelectMany: false,
                        filters: { 'JSON Files': ['json'] },
                    });

                    if (jsonFileUri && jsonFileUri.length > 0) {
                        document.getElementById('jsonFilePath').value = jsonFileUri[0].fsPath;
                    }
                };

                document.getElementById('run').onclick = () => {
                    const regoFilePath = document.getElementById('regoFilePath').value;
                    const jsonFilePath = document.getElementById('jsonFilePath').value;
                    const policyType = document.getElementById('policyType').value;

                    vscode.postMessage({
                        command: 'runOPA',
                        regoFilePath,
                        jsonFilePath,
                        policyType
                    });
                };
            </script>
        </body>
        </html>`;
}

async function runOPAEval(regoFilePath, jsonFilePath, policyType, panel) {
    if (!regoFilePath || !jsonFilePath || !policyType) {
        vscode.window.showErrorMessage('Please select both files and enter a policy type.');
        return;
    }

    const opaCommand = `opa eval -i ${jsonFilePath} -d ${regoFilePath} "${policyType}"`;

    exec(opaCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${stderr}`);
            panel.webview.postMessage({ output: 'Error evaluating the policy.' });
            return;
        }

        panel.webview.postMessage({ output: stdout });
    });
}

module.exports = validateOPA;
