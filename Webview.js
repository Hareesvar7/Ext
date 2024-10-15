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

    // Execute the OPA command
    const opaCommand = `opa eval -i ${jsonFilePath} -d ${regoFilePath} "data.example.allow"`;

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
