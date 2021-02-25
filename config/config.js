exports.connectionString = process.env.DATABASE_URL
exports.queueUrl = process.env.SQS_QUEUE_URL
exports.awsconfig = { 
    "accessKeyId": process.env.AWS_ACCESS_KEY_ID,
    "secretAccessKey": process.env.AWS_ACCESS_KEY,
    "region" : "eu-central-1",
    "output" : "json"
}