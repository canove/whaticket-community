/*eslint-disable*/
const fs = require("firebase-admin");
import AWS from "aws-sdk";

module.exports = {
  async database() {
    if (fs.apps.length > 0) {
      return fs.firestore();
    }

    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    })

    var options = {
      Bucket: 'kankei-credentials/whaticket',
      Key: 'key.json',
    };
    const fstream = require('fs');
    await new Promise<string>(async (resolve) => {
      var fileStream = await s3.getObject(options).createReadStream();
      await fileStream.pipe(fstream.createWriteStream('./key.json'));
      fileStream.on('end', async () => {
        setTimeout(function(){
          resolve('File Downloaded!')
        },500);
      });      
    });
    
    fs.initializeApp({
      credential: fs.credential.cert('./key.json')
    });
    return fs.firestore();
  }
};
