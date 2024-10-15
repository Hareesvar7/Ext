const vscode = require('vscode');
const { exec } = require('child_process');

function validateOPA() {
    vscode.window.showOpenDialog({
        canSelectMany: false,
        filters: {
            'JSON files': ['json'],
            'Rego files': ['rego']
        }
    }).then(fileUri => {
        if (fileUri && fileUri[0]) {
            const filePath = fileUri[0].fsPath;
            exec(`opa eval --data ${filePath}`, (error, stdout, stderr) => {
                if (error) {
                    vscode.window.showErrorMessage(`Error: ${stderr}`);
                    return;
                }
                vscode.window.showInformationMessage(`Output: ${stdout}`);
            });
        }
    });
}

module.exports = validateOPA;
