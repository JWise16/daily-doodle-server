// server/controllers/doodleController.js
const { PutObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const s3Client = require('../config/s3Config');
const multer = require('multer');

const upload = multer().single('doodle');

exports.uploadDoodle = (req, res) => {
  upload(req, res, async (error) => {
    if (error) {
      return res.status(500).json({ error: 'Error uploading doodle' });
    }
    
    try {
      const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `${req.body.email}-${Date.now()}.png`, 
        Body: req.file.buffer, // assuming multer is set up to use memory storage
        ContentType: 'image/png',
      };

      const command = new PutObjectCommand(params);
      await s3Client.send(command);
      
      res.status(200).json({
        message: 'Doodle uploaded successfully',
        url: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`
      });
      
    } catch (err) {
      console.error('Error uploading to S3:', err);
      res.status(500).json({ error: 'Error uploading to S3' });
    }
  });
};

exports.listDoodles = async (req, res) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Prefix: '', // Optionally, you can add a prefix if needed
    };

    const command = new ListObjectsV2Command(params);
    const data = await s3Client.send(command);

    const doodles = data.Contents ? data.Contents.map(item => ({
      key: item.Key,
      url: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${item.Key}`
    })) : [];

    res.status(200).json(doodles);
  } catch (err) {
    console.error('Error listing objects in bucket:', err);
    res.status(500).json({ error: 'Error retrieving doodles' });
  }
};
