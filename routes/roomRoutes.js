const express = require("express")
const roomsController = require("../controllers/roomsController")
const router = express.Router()
const multipleUpload = require("../middlewares/multer")
const verifyJWT = require("../middlewares/verifyJWT")

router.use(verifyJWT)

router
  .route("/")
  .get(roomsController.getAllRooms)
  .post(roomsController.createRoom)

router
  .route("/:id")
  .get(roomsController.getRoom)
  .patch(roomsController.updateRoom)

router
  .route("/:id/upload-photos")
  .post(multipleUpload, roomsController.updateRoomPhotos)

router
  .route("/:id/delete-photo/:idPhoto")
  .delete(roomsController.deleteRoomPhotos)

module.exports = router
