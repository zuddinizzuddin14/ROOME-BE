const multerS3 = require("multer-s3")
const s3Client = require("../config/s3Client")
const path = require("path")

const s3Storage = multerS3({
  s3: s3Client,
  bucket: process.env.S3_BUCKET_KEY,
  acl: "public-read",
  metadata: (req, file, cb) => {
    cb(null, { fieldname: file.fieldname })
  },
  key: (req, file, cb) => {
    cb(null, file.originalname)
  },
})

const sanitizeFile = (file, cb) => {
  const fileTypes = /png|jpg|jpeg/

  const isAllowedExt = fileTypes.test(
    path.extname(file.originalname).toLowerCase()
  )
  const isAllowedMimeType = fileTypes.test(file.mimetype)

  if (isAllowedExt && isAllowedMimeType) return cb(null, true)
  else return cb("Files must be png/jpg/jpeg format", false)
}

module.exports = { s3Storage, sanitizeFile }
