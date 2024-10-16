// src/services/serviceTemplates.js
const serviceTemplates = {
    AWS: {
        EFS: `
        package efs

        allow {
            input.path == "EFS"
        }

        allow {
            input.action == "CreateFile"
        }
        `,
        EKS: `
        package eks

        allow {
            input.path == "EKS"
        }

        allow {
            input.action == "Deploy"
        }
        `,
        S3: `
        package s3

        allow {
            input.path == "S3"
        }

        allow {
            input.action == "PutObject"
        }
        `,
        VPC: `
        package vpc

        allow {
            input.path == "VPC"
        }

        allow {
            input.action == "CreateSubnet"
        }
        `,
        IAM: `
        package iam

        allow {
            input.path == "IAM"
        }

        allow {
            input.action == "AttachPolicy"
        }
        `,
        LAMBDA: `
        package lambda

        allow {
            input.path == "LAMBDA"
        }

        allow {
            input.action == "Invoke"
        }
        `,
    },
    Azure: {
        'Blob Storage': `
        package blob

        allow {
            input.path == "Blob Storage"
        }

        allow {
            input.action == "UploadBlob"
        }
        `,
        AKS: `
        package aks

        allow {
            input.path == "AKS"
        }

        allow {
            input.action == "Scale"
        }
        `,
        'Function App': `
        package functionApp

        allow {
            input.path == "Function App"
        }

        allow {
            input.action == "Execute"
        }
        `,
        VNet: `
        package vnet

        allow {
            input.path == "VNet"
        }

        allow {
            input.action == "Create"
        }
        `,
        'Key Vault': `
        package keyVault

        allow {
            input.path == "Key Vault"
        }

        allow {
            input.action == "AccessSecret"
        }
        `,
    },
    GCP: {
        'Cloud Storage': `
        package cloudStorage

        allow {
            input.path == "Cloud Storage"
        }

        allow {
            input.action == "WriteObject"
        }
        `,
        GKE: `
        package gke

        allow {
            input.path == "GKE"
        }

        allow {
            input.action == "Deploy"
        }
        `,
        'Cloud Functions': `
        package cloudFunctions

        allow {
            input.path == "Cloud Functions"
        }

        allow {
            input.action == "Trigger"
        }
        `,
        VPC: `
        package vpc

        allow {
            input.path == "VPC"
        }

        allow {
            input.action == "Create"
        }
        `,
        IAM: `
        package iam

        allow {
            input.path == "IAM"
        }

        allow {
            input.action == "GrantRole"
        }
        `,
    },
};

module.exports = serviceTemplates;
