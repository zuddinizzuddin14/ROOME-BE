const { S3Client } = require("@aws-sdk/client-s3")

const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  region: process.env.S3_REGION_KEY,
})

module.exports = s3Client
