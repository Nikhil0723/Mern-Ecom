import express from 'express';
import multer from 'multer';

import cloudinary from '../config/cloudinary.js';

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,

  fileFilter(req, file, cb) {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          'Only JPG, JPEG, PNG, and WEBP images are allowed'
        )
      );
    }
  },

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post(
  '/',
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: 'Please select an image',
        });
      }

      const result = await new Promise(
        (resolve, reject) => {
          const uploadStream =
            cloudinary.uploader.upload_stream(
              {
                folder: 'UrbanNest/products',
                resource_type: 'image',
              },
              (error, result) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(result);
                }
              }
            );

          uploadStream.end(req.file.buffer);
        }
      );

      res.status(201).json({
        message: 'Image uploaded successfully',
        image: result.secure_url,
        public_id: result.public_id,
      });
    } catch (error) {
      console.error(
        'Cloudinary upload error:',
        error
      );

      res.status(500).json({
        message: 'Image upload failed',
      });
    }
  }
);

export default router;