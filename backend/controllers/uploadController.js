import cloudinary from "../config/cloudinary.js";

const uploadBufferToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'shoply/products',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        return resolve(result);
      }
    );

    uploadStream.end(buffer);
  });


export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please select an image' });
    }

    const result = await uploadBufferToCloudinary(req.file.buffer);

    return res.status(200).json({
      message: 'Image uploaded successfully',
      image: result.secure_url,
    });
  } catch (error) {
    console.error('Error in uploadImage:', error.message);
    return res.status(500).json({ message: 'Image upload failed' });
  }
};