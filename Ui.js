getWebViewContent() {
    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AI Assistant</title>
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
                textarea {
                    width: 100%;
                    height: 120px;
                    font-size: 16px;
                    padding: 10px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    background-color: #fff;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                }
                textarea:focus {
                    border-color: #4A90E2;
                    outline: none;
                    box-shadow: 0 2px 8px rgba(74, 144, 226, 0.2);
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
