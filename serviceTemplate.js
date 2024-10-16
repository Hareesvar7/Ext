function getServiceTemplate(provider, service) {
    const templates = {
        AWS: {
            EFS: `
            package aws.efs

            default allow = false

            allow {
                input.path == "efs"
                input.action == "mount"
            }`,
            EKS: `
            package aws.eks

            default allow = false

            allow {
                input.path == "eks"
                input.action == "deploy"
            }`,
            S3: `
            package aws.s3

            default allow = false

            allow {
                input.path == "s3"
                input.action == "read"
            }`,
            VPC: `
            package aws.vpc

            default allow = false

            allow {
                input.path == "vpc"
                input.action == "create"
            }`,
            IAM: `
            package aws.iam

            default allow = false

            allow {
                input.path == "iam"
                input.action == "modify"
            }`,
            LAMBDA: `
            package aws.lambda

            default allow = false

            allow {
                input.path == "lambda"
                input.action == "invoke"
            }`
        },
        Azure: {
            'Blob Storage': `
            package azure.blob

            default allow = false

            allow {
                input.path == "blob"
                input.action == "read"
            }`,
            AKS: `
            package azure.aks

            default allow = false

            allow {
                input.path == "aks"
                input.action == "deploy"
            }`,
            'Function App': `
            package azure.function

            default allow = false

            allow {
                input.path == "function"
                input.action == "invoke"
            }`,
            VNet: `
            package azure.vnet

            default allow = false

            allow {
                input.path == "vnet"
                input.action == "create"
            }`,
            'Key Vault': `
            package azure.keyvault

            default allow = false

            allow {
                input.path == "keyvault"
                input.action == "read"
            }`
        },
        GCP: {
            'Cloud Storage': `
            package gcp.storage

            default allow = false

            allow {
                input.path == "storage"
                input.action == "read"
            }`,
            GKE: `
            package gcp.gke

            default allow = false

            allow {
                input.path == "gke"
                input.action == "deploy"
            }`,
            'Cloud Functions': `
            package gcp.functions

            default allow = false

            allow {
                input.path == "functions"
                input.action == "invoke"
            }`,
            VPC: `
            package gcp.vpc

            default allow = false

            allow {
                input.path == "vpc"
                input.action == "create"
            }`,
            IAM: `
            package gcp.iam

            default allow = false

            allow {
                input.path == "iam"
                input.action == "modify"
            }`
        }
    };

    return templates[provider][service] || 'Template not found.';
}

module.exports = {
    getServiceTemplate
};
