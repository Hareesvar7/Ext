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

    // Show a webview for entering the policy type
    showPolicyTypeInputWebview(regoFilePath, jsonFilePath);
}

// Function to show the policy type input webview
function showPolicyTypeInputWebview(regoFilePath, jsonFilePath) {
    const panel = vscode.window.createWebviewPanel(
        'policyTypeInput', // Identifies the type of the webview
        'Enter Policy Type', // Title of the panel
        vscode.ViewColumn.One, // Show the panel in the first column
        {
            enableScripts: true, // Allow scripts in the webview
        }
    );

    // Set the HTML content of the webview
    panel.webview.html = getPolicyTypeInputWebviewContent();

    // Handle the message from the webview
    panel.webview.onDidReceiveMessage(async (message) => {
        if (message.command === 'evaluate') {
            const policyType = message.policyType;
            // Execute the OPA command with the user-provided policy type
            const opaCommand = `opa eval -i ${jsonFilePath} -d ${regoFilePath} "${policyType}"`;

            exec(opaCommand, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error: ${stderr}`);
                    vscode.window.showErrorMessage('Error evaluating the policy.');
                    return;
                }

                // Show results in a webview
                showResultsInWebview(stdout);
            });
        }
    });
}

// Function to get the HTML content for policy type input
function getPolicyTypeInputWebviewContent() {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Enter Policy Type</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    background-color: #1e1e1e;
                    color: #d4d4d4;
                }
                input {
                    padding: 10px;
                    width: 100%;
                    margin-top: 10px;
                    border-radius: 5px;
                    border: 1px solid #444;
                }
                button {
                    background-color: #007acc;
                    color: white;
                    border: none;
                    padding: 10px;
                    margin-top: 20px;
                    border-radius: 5px;
                    cursor: pointer;
                }
                button:hover {
                    background-color: #005a9c;
                }
            </style>
        </head>
        <body>
            <h1>Enter Policy Type</h1>
            <input type="text" id="policyType" placeholder="Enter policy type (e.g., data.example.allow)" />
            <button id="evaluate">Evaluate Policy</button>
            <script>
                const vscode = acquireVsCodeApi();

                document.getElementById('evaluate').onclick = () => {
                    const policyType = document.getElementById('policyType').value;
                    vscode.postMessage({
                        command: 'evaluate',
                        policyType
                    });
                };
            </script>
        </body>
        </html>`;
}

// Function to show results in a webview
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

// Function to get the HTML content for displaying results
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
