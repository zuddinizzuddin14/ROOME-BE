const { sanitizeFile, s3Storage } = require("../utils/imageUploader")
const multer = require("multer")

const multipleUpload = multer({
  storage: s3Storage,
  fileFilter: (req, file, cb) => {
    sanitizeFile(file, cb)
  },
  limits: {
    fileSize: 1024 * 1024 * 2,
  },
}).array("photos", 5)

module.exports = multipleUpload
