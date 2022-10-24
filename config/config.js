exports.connectionString = process.env.DATABASE_URL;
exports.queueUrl = process.env.SQS_URL;
exports.awsconfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "us-east-1",
  output: "json",
};
