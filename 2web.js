const vscode = require('vscode');
const getAIResponse = require('../services/openAIService'); // Assuming you have this function

async function aiAssistant() {
    // Show an input box to get the AI prompt from the user
    const prompt = await vscode.window.showInputBox({
        prompt: 'Enter your prompt for the AI Assistant',
        placeHolder: 'Type your question or command...',
    });

    if (!prompt) {
        vscode.window.showErrorMessage('No prompt entered.');
        return;
    }

    try {
        // Call the AI service with the user's prompt
        const aiResponse = await getAIResponse(prompt);
        showAIResponseInWebview(aiResponse);
    } catch (error) {
        vscode.window.showErrorMessage(`AI Assistant Error: ${error.message}`);
    }
}

function showAIResponseInWebview(response) {
    const panel = vscode.window.createWebviewPanel(
        'aiAssistantResults', // Identifies the type of the webview
        'AI Assistant Results', // Title of the panel
        vscode.ViewColumn.One, // Show the panel in the first column
        {
            enableScripts: true, // Allow scripts in the webview
        }
    );

    // Set the HTML content of the webview
    panel.webview.html = getAIWebviewContent(response);
}

function getAIWebviewContent(response) {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AI Assistant Results</title>
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
            <h1>AI Assistant Results</h1>
            <pre>${response}</pre>
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

module.exports = aiAssistant;
