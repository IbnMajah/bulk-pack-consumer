require("dotenv").config();
const config = require("./config/config");

const { Consumer } = require("sqs-consumer");
var aws = require("aws-sdk");
aws.config.update({ ...config.awsconfig });
const s3 = new aws.S3();
const Region = aws.config.region;
const QueueUrl = config.queueUrl;

const { Pool, Client } = require("pg");
const { S3 } = require("aws-sdk");
const pool = new Pool({ connectionString: config.connectionString });

//const Sentry = require('@sentry/node');
//Sentry.init({ dsn: config.sentryDSN });

console.log(Region);
console.log(QueueUrl);
// console.log(S3);
const app = Consumer.create({
  queueUrl: QueueUrl,
  region: Region,
  batchSize: 10,
  handleMessage: async function (message) {
    // console.log(message.Body);
    var body = JSON.parse(message.Body);
    if (body.Event == "s3:TestEvent") {
      console.log("Test Event");
      return;
    }

    var records = body["Records"];
    // console.log(records);

    for (let record of records) {
      // console.log(record);
      var fullQueueRecord = JSON.stringify(record);
      // console.log("queue record: ", fullQueueRecord);
      const eventTime = record["eventTime"];
      const bucketArn = record["s3"]["bucket"]["arn"];
      const bucketName = record["s3"]["bucket"]["name"];
      const key = record["s3"]["object"]["key"];

      // console.log("eventTime: " + eventTime);
      // console.log("bucketArn: " + bucketArn);
      // console.log("bucketName: " + bucketName);
      // console.log("key: " + key);

      const bulkData = await fetchS3Data(key, bucketName);

      // TODO put this into a table with the above pieces
      // console.log("Bulk data: ", bulkData);
      const insert = {
        text: `INSERT INTO bulk_tree_upload
          (queue_record, event_time, bucket_arn, key, bulk_data, processed)
          values
          ($1, $2, $3, $4, $5, $6)`,
        values: [fullQueueRecord, eventTime, bucketArn, key, bulkData, false],
      };
      // console.log(insert);
      await pool.query(insert);
    }
  },
});

app.on("error", function (err) {
  console.log("error", err);
});

app.on("processing_error", function (err) {
  console.log("processing_error", err);
});

async function fetchS3Data(key, bucket) {
  params = {
    Bucket: bucket,
    Key: key,
  };

  const s3GetObjectPromise = new Promise((resolve, reject) => {
    s3.getObject(params, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });

  const data = await s3GetObjectPromise;
  let objectData = JSON.parse(data.Body.toString("utf-8"));
  // console.log("Buld data: ", objectData);
  return objectData;
}

app.start();
