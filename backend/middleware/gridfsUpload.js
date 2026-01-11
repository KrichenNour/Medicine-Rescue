// backend/middleware/gridfsUpload.js
const multer = require('multer');
const path = require('path');

// Use memory storage - we'll manually save to GridFS in the route handler
const storage = multer.memoryStorage();

// Check File Type
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Images Only!'));
  }
};

// Create upload middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 10MB limit
  fileFilter: fileFilter
});

module.exports = upload;
