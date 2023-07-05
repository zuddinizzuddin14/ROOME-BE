const express = require("express")
const bookingsController = require("../controllers/bookingsController")
const router = express.Router()

router.get("/", bookingsController.getAllBookings)
router.get("/:id", bookingsController.getBookingByRoomId)

module.exports = router
