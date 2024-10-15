const vscode = require('vscode');
const validateOPA = require('./commands/validateOPA');

function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.validateOPA', validateOPA);
    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
