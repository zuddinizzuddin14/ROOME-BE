const express = require("express")
const bookingsController = require("../controllers/bookingsController")
const verifyJWT = require("../middlewares/verifyJWT")
const router = express.Router()

router.route("/").get(bookingsController.getAllBookings)
router.route("/:id").get(bookingsController.getBooking)
router.route("/room/:id").get(bookingsController.getBookingByRoomId)

router.use(verifyJWT)

router.route("/").post(bookingsController.createBooking)
router.route("/:id").put(bookingsController.updateBooking)
router.route("/:id/cancel").put(bookingsController.cancelBooking)

module.exports = router
