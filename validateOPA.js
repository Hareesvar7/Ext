const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Utility function to execute shell commands
const execCommand = (command, callback) => {
    exec(command, callback);
};

// Command to evaluate OPA policies
function validateOPA() {
    vscode.window.showOpenDialog({
        canSelectMany: true,
        filters: {
            'JSON files': ['json'],
            'Rego files': ['rego']
        }
    }).then(fileUris => {
        if (!fileUris || fileUris.length < 2) {
            vscode.window.showErrorMessage("You need to select at least one Rego file and one JSON file.");
            return;
        }

        // Separate selected files into Rego and JSON files
        const regoFilePath = fileUris.find(fileUri => fileUri.fsPath.endsWith('.rego'));
        const jsonFilePath = fileUris.find(fileUri => fileUri.fsPath.endsWith('.json'));

        if (!regoFilePath || !jsonFilePath) {
            vscode.window.showErrorMessage("You must select one Rego file and one JSON file.");
            return;
        }

        // Define the policy input (this could also be user-defined)
        const policyInput = "data.example.allow"; // Example policy input; adjust as necessary

        // Command to evaluate OPA
        const opaCommand = `opa eval -i ${jsonFilePath.fsPath} -d ${regoFilePath.fsPath} "${policyInput}"`;

        execCommand(opaCommand, (error, stdout, stderr) => {
            if (error) {
                vscode.window.showErrorMessage(`Error: ${stderr}`);
                return;
            }
            vscode.window.showInformationMessage(`OPA Output: ${stdout}`);
        });
    });
}

module.exports = validateOPA;
