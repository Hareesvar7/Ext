const vscode = require('vscode');
const validateOPA = require('./commands/validateOPA');
const aiAssistant = require('./commands/aiAssistant');

function activate(context) {
    let validateOPADisposable = vscode.commands.registerCommand('extension.validateOPA', validateOPA);
    let aiAssistantDisposable = vscode.commands.registerCommand('extension.aiAssistant', aiAssistant);
    
    context.subscriptions.push(validateOPADisposable, aiAssistantDisposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
