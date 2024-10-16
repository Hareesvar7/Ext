function getStorageServiceTemplate(provider, service) {
    const templates = {
        AWS: {
            EFS: `
            package aws.efs

            default allow = false

            allow {
                input.path = "EFS"
                input.action = "mount"
            }
            `,
            EKS: `
            package aws.eks

            default allow = false

            allow {
                input.cluster = "EKS"
                input.action = "deploy"
            }
            `,
            S3: `
            package aws.s3

            default allow = false

            allow {
                input.bucket = "S3"
                input.action = "read"
            }
            `,
            VPC: `
            package aws.vpc

            default allow = false

            allow {
                input.network = "VPC"
                input.action = "connect"
            }
            `,
            IAM: `
            package aws.iam

            default allow = false

            allow {
                input.role = "IAM"
                input.action = "assume"
            }
            `,
            LAMBDA: `
            package aws.lambda

            default allow = false

            allow {
                input.function = "LAMBDA"
                input.action = "invoke"
            }
            `
        },
        Azure: {
            'Blob Storage': `
            package azure.blob_storage

            default allow = false

            allow {
                input.container = "Blob Storage"
                input.action = "upload"
            }
            `,
            AKS: `
            package azure.aks

            default allow = false

            allow {
                input.cluster = "AKS"
                input.action = "scale"
            }
            `,
            'Function App': `
            package azure.function_app

            default allow = false

            allow {
                input.function = "Function App"
                input.action = "run"
            }
            `,
            VNet: `
            package azure.vnet

            default allow = false

            allow {
                input.network = "VNet"
                input.action = "join"
            }
            `,
            'Key Vault': `
            package azure.key_vault

            default allow = false

            allow {
                input.vault = "Key Vault"
                input.action = "access"
            }
            `
        },
        GCP: {
            'Cloud Storage': `
            package gcp.cloud_storage

            default allow = false

            allow {
                input.bucket = "Cloud Storage"
                input.action = "store"
            }
            `,
            GKE: `
            package gcp.gke

            default allow = false

            allow {
                input.cluster = "GKE"
                input.action = "launch"
            }
            `,
            'Cloud Functions': `
            package gcp.cloud_functions

            default allow = false

            allow {
                input.function = "Cloud Functions"
                input.action = "execute"
            }
            `,
            VPC: `
            package gcp.vpc

            default allow = false

            allow {
                input.network = "VPC"
                input.action = "connect"
            }
            `,
            IAM: `
            package gcp.iam

            default allow = false

            allow {
                input.role = "IAM"
                input.action = "grant"
            }
            `
        }
    };

    return templates[provider]?.[service] || 'No template found for the selected service.';
}

module.exports = {
    getStorageServiceTemplate
};
