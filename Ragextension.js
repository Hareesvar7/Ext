// src/extension.js
const vscode = require('vscode');
const showCloudServiceSelection = require('./commands/cloudServiceSelection');

function activate(context) {
    const disposable = vscode.commands.registerCommand('extension.showCloudServiceSelection', () => {
        showCloudServiceSelection(context);
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate,
};
