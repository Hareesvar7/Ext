const vscode = require('vscode');
const getAIResponse = require('../services/openAIService');

function aiAssistant() {
    vscode.window.showInputBox({ prompt: 'Enter your prompt for the AI' }).then(async prompt => {
        if (prompt) {
            try {
                const response = await getAIResponse(prompt);
                vscode.window.showInformationMessage(`AI Response: ${response}`);
            } catch (error) {
                vscode.window.showErrorMessage(`AI Error: ${error.message}`);
            }
        }
    });
}

module.exports = aiAssistant;
