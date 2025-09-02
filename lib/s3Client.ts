import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
    region: 'auto',
    endpoint: 'https://t3.storage.dev',
    forcePathStyle: false
})