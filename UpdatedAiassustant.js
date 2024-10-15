// src/commands/aiAssistant.js
const vscode = require('vscode');
const getAIResponse = require('../services/openAIService'); // Adjust import if using TypeScript

async function aiAssistant() {
    const prompt = await vscode.window.showInputBox({ prompt: 'Enter your prompt for the AI' });

    if (prompt) {
        try {
            const response = await getAIResponse(prompt);
            vscode.window.showInformationMessage(`AI Response: ${response}`);
        } catch (error) {
            vscode.window.showErrorMessage(`AI Error: ${error.message}`); // Show error in VS Code
        }
    } else {
        vscode.window.showErrorMessage('Prompt cannot be empty.');
    }
}

module.exports = aiAssistant;
