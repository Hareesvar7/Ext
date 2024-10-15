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
        canSelectMany: false,
        filters: {
            'JSON files': ['json'],
            'Rego files': ['rego']
        }
    }).then(fileUri => {
        if (!fileUri || fileUri.length < 2) {
            vscode.window.showErrorMessage("You need to select both a Rego file and a JSON file.");
            return;
        }
        
        const regoFilePath = fileUri[0].fsPath;
        const jsonFilePath = fileUri[1].fsPath;
        const policyInput = "data.example.allow"; // Example input; prompt user for this if needed

        const opaCommand = `opa eval -i ${jsonFilePath} -d ${regoFilePath} "${policyInput}"`;

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
