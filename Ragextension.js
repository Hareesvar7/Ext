const vscode = require('vscode');
const validateOPA = require('./services/validateOPA'); // Path to your validateOPA service
const showCloudServiceSelection = require('./services/Rag'); // Path to your Rag service

function activate(context) {
    // Command to validate OPA
    let validateCommand = vscode.commands.registerCommand('yourExtension.validateOPA', () => {
        validateOPA(); // Call your validateOPA function
    });

    // Command to show cloud service selection
    let cloudServiceCommand = vscode.commands.registerCommand('yourExtension.showCloudServiceSelection', () => {
        showCloudServiceSelection(context); // Pass context to the Rag function
    });

    context.subscriptions.push(validateCommand);
    context.subscriptions.push(cloudServiceCommand);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
