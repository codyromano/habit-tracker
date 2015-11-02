// AWS and DynamoDB configuration
var config = require('./config');
var AWS = require('aws-sdk');


AWS.config.update({
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  region: config.AWS_REGION
});

module.exports = new AWS.DynamoDB({region: config.AWS_REGION});
