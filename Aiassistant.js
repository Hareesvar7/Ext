const vscode = require('vscode');
const getAIResponse = require('../services/openAIService');

// AI Assistant Command
function aiAssistant() {
    vscode.window.showInputBox({ prompt: 'Enter your prompt for AI Assistant' }).then(async (prompt) => {
        if (!prompt) {
            vscode.window.showErrorMessage("No prompt provided.");
            return;
        }

        try {
            const response = await getAIResponse(prompt);
            vscode.window.showInformationMessage(`AI Response: ${response}`);
        } catch (error) {
            vscode.window.showErrorMessage(`AI Error: ${error.message}`);
        }
    });
}

module.exports = aiAssistant;
