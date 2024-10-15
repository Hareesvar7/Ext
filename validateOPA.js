const vscode = require('vscode');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

async function validateOPA() {
    // Show file picker to select the .rego file
    const regoFileUri = await vscode.window.showOpenDialog({
        canSelectMany: false,
        filters: { 'Rego Files': ['rego'] },
    });

    if (!regoFileUri || regoFileUri.length === 0) {
        vscode.window.showErrorMessage('No file selected.');
        return;
    }

    const regoFilePath = regoFileUri[0].fsPath;

    // Show file picker to select the input JSON file
    const jsonFileUri = await vscode.window.showOpenDialog({
        canSelectMany: false,
        filters: { 'JSON Files': ['json'] },
    });

    if (!jsonFileUri || jsonFileUri.length === 0) {
        vscode.window.showErrorMessage('No file selected.');
        return;
    }

    const jsonFilePath = jsonFileUri[0].fsPath;

    // Show webview to get the policy type from the user
    showPolicyInputWebview(regoFilePath, jsonFilePath);
}

function showPolicyInputWebview(regoFilePath, jsonFilePath) {
    const panel = vscode.window.createWebviewPanel(
        'policyInput', // Identifies the type of the webview
        'Input Policy Type', // Title of the panel
        vscode.ViewColumn.One, // Show the panel in the first column
        {
            enableScripts: true, // Allow scripts in the webview
        }
    );

    // Set the HTML content of the webview
    panel.webview.html = getPolicyInputWebviewContent(regoFilePath, jsonFilePath);
}

function getPolicyInputWebviewContent(regoFilePath, jsonFilePath) {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Input Policy Type</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    background-color: #1e1e1e;
                    color: #d4d4d4;
                }
                input {
                    width: 100%;
                    padding: 10px;
                    margin-top: 10px;
                    border-radius: 5px;
                    border: 1px solid #444;
                }
                button {
                    padding: 10px;
                    margin-top: 20px;
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
                    white-space: pre-wrap; /* Ensures long lines are wrapped */
                    margin-top: 20px;
                    height: 300px; /* Fixed height for the output box */
                }
            </style>
        </head>
        <body>
            <h1>Input Policy Type</h1>
            <input type="text" id="policyType" placeholder="Enter policy type (e.g., data.example.allow)" />
            <button id="run">Run OPA Validation</button>
            <div id="output"></div> <!-- Output box for displaying results -->
            <script>
                const vscode = acquireVsCodeApi();

                document.getElementById('run').onclick = () => {
                    const policyType = document.getElementById('policyType').value;

                    if (!policyType) {
                        alert('Please enter a policy type.');
                        return;
                    }

                    // Send message to main process to run OPA evaluation
                    vscode.postMessage({
                        command: 'runOPA',
                        policyType
                    });
                };

                window.addEventListener('message', event => {
                    const message = event.data;
                    if (message.output) {
                        document.getElementById('output').innerText = message.output; // Display output in the output box
                    }
                });
            </script>
        </body>
        </html>`;
}

async function runOPAEval(regoFilePath, jsonFilePath, policyType, panel) {
    if (!policyType) {
        vscode.window.showErrorMessage('Please provide a policy type.');
        return;
    }

    // Execute the OPA command
    const opaCommand = `opa eval -i ${jsonFilePath} -d ${regoFilePath} "${policyType}"`;

    exec(opaCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${stderr}`);
            panel.webview.postMessage({ output: 'Error evaluating the policy.' });
            return;
        }

        // Show results in the output box
        panel.webview.postMessage({ output: stdout });
    });
}

function showResultsInWebview(output) {
    const panel = vscode.window.createWebviewPanel(
        'opaResults', // Identifies the type of the webview
        'OPA Validation Results', // Title of the panel
        vscode.ViewColumn.One, // Show the panel in the first column
        {
            enableScripts: true, // Allow scripts in the webview
        }
    );

    // Set the HTML content of the webview
    panel.webview.html = getWebviewContent(output);
}

function getWebviewContent(output) {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>OPA Validation Results</title>
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
                .button {
                    background-color: #007acc;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    margin-top: 20px;
                    cursor: pointer;
                    border-radius: 5px;
                }
                .button:hover {
                    background-color: #005a9c;
                }
            </style>
        </head>
        <body>
            <h1>OPA Validation Results</h1>
            <pre>${output}</pre>
            <button class="button" onclick="copyToClipboard()">Copy to Clipboard</button>
            <script>
                function copyToClipboard() {
                    const outputText = document.querySelector('pre').innerText;
                    navigator.clipboard.writeText(outputText).then(() => {
                        alert('Output copied to clipboard!');
                    }, () => {
                        alert('Failed to copy output.');
                    });
                }
            </script>
        </body>
        </html>`;
}

module.exports = validateOPA;
