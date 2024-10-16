const vscode = require('vscode');
const getAIResponse = require('../services/openAIService'); // Adjust import if using TypeScript

class AIWebView {
    constructor(panel) {
        this.panel = panel;
        this.panel.webview.onDidReceiveMessage(this.handleMessage.bind(this));
    }

    static createOrShow(context) {
        const panel = vscode.window.createWebviewPanel(
            'aiAssistant',
            'AI Assistant',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
            }
        );

        const webViewInstance = new AIWebView(panel);
        webViewInstance.initialize();
    }

    initialize() {
        this.panel.title = "AI Assistant";
        this.panel.webview.html = this.getWebViewContent();
    }

    getWebViewContent() {
        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>AI Assistant</title>
                <style>
                    body { font-family: sans-serif; padding: 20px; }
                    textarea { width: 100%; height: 100px; font-size: 16px; }
                    button { margin-top: 10px; padding: 10px; font-size: 16px; cursor: pointer; }
                    .response { margin-top: 20px; border: 1px solid #ccc; padding: 10px; border-radius: 5px; background-color: #f0f0f0; max-height: 400px; overflow-y: auto; white-space: pre-wrap; font-size: 16px; }
                    .error { color: red; }
                </style>
            </head>
            <body>
                <h1>AI Assistant</h1>
                <textarea id="prompt" placeholder="Enter your prompt..."></textarea>
                <button id="submit">Submit</button>
                <div class="response" id="response"></div>
                <script>
                    const vscode = acquireVsCodeApi();
                    document.getElementById('submit').addEventListener('click', () => {
                        const prompt = document.getElementById('prompt').value;
                        vscode.postMessage({ command: 'submitPrompt', prompt: prompt });
                    });

                    // Listen for messages from the extension
                    window.addEventListener('message', (event) => {
                        const message = event.data;
                        const responseDiv = document.getElementById('response');

                        if (message.command === 'displayResponse') {
                            responseDiv.innerHTML = '<strong>AI Response:</strong><br>' + message.response;
                        } else if (message.command === 'displayError') {
                            responseDiv.innerHTML = '<strong class="error">Error:</strong> ' + message.error;
                        }
                    });
                </script>
            </body>
            </html>`;
    }

    async handleMessage(message) {
        if (message.command === 'submitPrompt') {
            const { prompt } = message;
            try {
                const response = await getAIResponse(prompt);
                this.panel.webview.postMessage({ command: 'displayResponse', response: response });
            } catch (error) {
                this.panel.webview.postMessage({ command: 'displayError', error: error.message });
            }
        }
    }
}

function aiAssistant() {
    AIWebView.createOrShow();
}

module.exports = aiAssistant;
