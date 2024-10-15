const validateOPA = require('./commands/validateOPA');
const showCloudServiceSelection = require('./commands/Rag'); // Import the new command

function activate(context) {
    let validateOPACommand = vscode.commands.registerCommand('extension.validateOPA', validateOPA);
    let cloudServiceCommand = vscode.commands.registerCommand('extension.showCloudServices', showCloudServiceSelection); // Register the new command

    context.subscriptions.push(validateOPACommand);
    context.subscriptions.push(cloudServiceCommand);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate,
};
