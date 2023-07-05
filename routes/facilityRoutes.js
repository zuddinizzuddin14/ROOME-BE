const express = require("express")
const facilitiesController = require("../controllers/facilitiesController")
const verifyJWT = require("../middlewares/verifyJWT")
const router = express.Router()

router.use(verifyJWT)

router
  .route("/")
  .get(facilitiesController.getAllFacilities)
  .post(facilitiesController.createFacility)

router
  .route("/:id")
  .get(facilitiesController.getFacility)
  .put(facilitiesController.updateFacility)
  .delete(facilitiesController.deleteFacility)

module.exports = router
