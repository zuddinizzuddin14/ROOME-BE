const { PrismaClientRUMII } = require("../db")
const z = require("zod")
const {
  validationId,
  validationFacilities,
  validationGetAllFacilities,
} = require("../utils/validations")

const getFacility = async (req, res) => {
  try {
    const id = validationId.parse(req.params.id)
    await PrismaClientRUMII.tb_m_facility
      .findUniqueOrThrow({ where: { id } })
      .then((facility) => res.json(facility))
  } catch (error) {
    switch (error.code) {
      case "P2025":
        res.status(400).json({ message: "Facility is not founded" })
        break
      default:
        error.issues
          ? res.status(400).json({
              message: error.issues.map((body) => body.message).join(" | "),
            })
          : res.status(400).json({ message: error })
        break
    }
  }
}

const getAllFacilities = async (req, res) => {
  try {
    const { name, sort, page, limit } = validationGetAllFacilities.parse(
      req.query
    )

    const take = limit ? parseInt(limit) : 10
    const skip = (page ? parseInt(page) - 1 : 0) * take

    const facilities = await PrismaClientRUMII.tb_m_facility.findMany({
      take,
      skip: skip ? skip : 0,
      where: {
        name: {
          contains: name,
        },
      },
      orderBy: {
        name: sort ? sort : "asc",
      },
    })

    const totalData = await PrismaClientRUMII.tb_m_facility.count()

    const currentPage = page ? parseInt(page) : 1
    const lastPage = Math.ceil(totalData / take)

    res.json({
      facilities,
      currentPage,
      lastPage,
      totalData,
    })
  } catch (error) {
    switch (error.code) {
      default:
        error.issues
          ? res.status(400).json({
              message: error.issues.map((body) => body.message).join(" | "),
            })
          : res.status(400).json({ message: error })
        break
    }
  }
}

const createFacility = async (req, res) => {
  try {
    const name = validationFacilities.parse(req.body.name)
    await PrismaClientRUMII.tb_m_facility
      .create({ data: { name } })
      .then((facility) =>
        res.status(201).json({
          message: `Successfully added ${name}`,
          body: facility,
          status: 201,
        })
      )
  } catch (error) {
    switch (error.code) {
      case "P2002":
        res.status(400).json({ message: "Facility name is already used" })
        break
      default:
        error.issues
          ? res.status(400).json({
              message: error.issues.map((body) => body.message).join(" | "),
            })
          : res.status(400).json({ message: error })
        break
    }
  }
}

const updateFacility = async (req, res) => {
  try {
    const id = validationId.parse(req.params.id)
    const name = validationFacilities.parse(req.body.name)
    await PrismaClientRUMII.tb_m_facility
      .update({ where: { id }, data: { name } })
      .then((facility) =>
        res.json({
          message: `Successfully updated!`,
          data: facility,
          status: 200,
        })
      )
  } catch (error) {
    switch (error.code) {
      case "P2025":
        res.status(400).json({ message: "Facility is not founded" })
        break
      case "P2002":
        res.status(400).json({ message: "Facility name is already used" })
        break
      default:
        error.issues
          ? res.status(400).json({
              message: error.issues.map((body) => body.message).join(" | "),
            })
          : res.status(400).json({ message: error, status: 400 })
        break
    }
  }
}

const deleteFacility = async (req, res) => {
  try {
    const id = validationId.parse(req.params.id)
    await PrismaClientRUMII.tb_m_facility
      .delete({ where: { id } })
      .then((facility) =>
        res.json({
          message: `Successfully deleted ${facility.name}`,
          data: facility,
          status: 200,
        })
      )
  } catch (error) {
    switch (error.code) {
      case "P2025":
        res
          .status(400)
          .json({ message: "Facility is not founded", status: 400 })
        break
      case "P2003":
        res
          .status(400)
          .json({ message: "Facility is related to a room", status: 400 })
        break
      default:
        error.issues
          ? res.status(400).json({
              message: error.issues.map((body) => body.message).join(" | "),
            })
          : res.status(400).json({ message: error })
        break
    }
  }
}

module.exports = {
  getFacility,
  getAllFacilities,
  createFacility,
  updateFacility,
  deleteFacility,
}
