const s3Client = require("../config/s3Client")
const { DeleteObjectCommand } = require("@aws-sdk/client-s3")
const { PrismaClientRUMII } = require("../db")
const {
  validationCreateRoom,
  validationFiles,
  validationUpdateRoom,
  validationId,
  validationGetAllRoom,
} = require("../utils/validations")

const getRoom = async (req, res) => {
  try {
    const id = validationId.parse(req.params.id)
    await PrismaClientRUMII.tb_m_room
      .findUniqueOrThrow({
        where: { id },
        include: {
          facilities: {
            include: {
              facility: true,
            },
          },
          room_photos: true,
        },
      })
      .then((room) => res.json(room))
  } catch (error) {
    switch (error.code) {
      case "P2025":
        res.status(400).json({ message: "Room is not founded" })
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

const getAllRooms = async (req, res) => {
  try {
    const { name, capacity, sort, page, limit } = validationGetAllRoom.parse(
      req.query
    )

    const take = limit ? parseInt(limit) : 10
    const skip = (page ? parseInt(page) - 1 : 0) * take
    const gte = parseInt(capacity) ? parseInt(capacity) : 0

    const rooms = await PrismaClientRUMII.tb_m_room.findMany({
      take,
      skip: skip ? skip : 0,
      where: {
        name: {
          contains: name,
        },
        capacity: {
          gte: gte,
        },
      },
      orderBy: {
        name: sort ? sort : "asc",
      },
      include: {
        facilities: {
          include: {
            facility: true,
          },
        },
        room_photos: true,
      },
    })

    const totalData = await PrismaClientRUMII.tb_m_room.count()

    const currentPage = page ? parseInt(page) : 1
    const lastPage = Math.ceil(totalData / take)

    res.json({
      rooms,
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

const createRoom = async (req, res) => {
  try {
    const { name, location, capacity, facilities, photos } =
      validationCreateRoom.parse(req.body)

    await PrismaClientRUMII.tb_m_room
      .create({
        data: {
          name,
          location,
          capacity,
          room_photos: {
            create: photos?.map((photo) => ({
              url: photo.url,
              highlight: photo.highlight,
            })),
          },
          facilities: {
            create: facilities?.map((facility) => ({
              facility: {
                connect: {
                  id: facility.id,
                },
              },
              number_of_facility: facility.number_of_facility,
            })),
          },
        },
        include: {
          facilities: {
            include: {
              facility: true,
            },
          },
          room_photos: true,
        },
      })
      .then((room) =>
        res
          .status(201)
          .json({
            data: room,
            message: "Create room successfully",
            status: "success",
          })
      )
  } catch (error) {
    switch (error.code) {
      case "P2025":
        res.status(400).json({ message: "Facility is not founded" })
        break
      case "P2002":
        res.status(400).json({ message: "Room name is already used" })
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

const updateRoomPhotos = async (req, res) => {
  try {
    const id = validationId.parse(req.params.id)
    const files = validationFiles(req.files)

    const searchRoom = await PrismaClientRUMII.tb_m_room.findUniqueOrThrow({
      where: { id },
      include: {
        room_photos: true,
      },
    })
    if (searchRoom.room_photos.length > 5)
      throw "Room photos are at maximum capacity"

    await PrismaClientRUMII.tb_m_room
      .update({
        where: { id },
        data: {
          room_photos: {
            create: files?.map((photo) => ({
              url: photo.location,
              highlight: false,
            })),
          },
        },
        include: {
          facilities: {
            include: {
              facility: true,
            },
          },
          room_photos: true,
        },
      })
      .then((room) => res.json(room))
  } catch (error) {
    req.files?.forEach((file) => {
      deleteImage(file.location.split("/").pop())
    })
    switch (error.code) {
      case "P2025":
        res.status(400).json({ message: "Room is not founded" })
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

const deleteRoomPhotos = async (req, res) => {
  try {
    const id = validationId.parse(req.params.id)
    const idPhoto = validationId.parse(req.params.idPhoto)

    const roomPhoto =
      await PrismaClientRUMII.tb_tr_room_photos.findFirstOrThrow({
        where: {
          AND: [{ id: idPhoto }, { room_id: id }],
        },
      })

    deleteImage(roomPhoto.url.split("/").pop())

    await PrismaClientRUMII.tb_tr_room_photos
      .delete({
        where: {
          id: idPhoto,
        },
      })
      .then((room) => res.json(room))
  } catch (error) {
    switch (error.code) {
      case "P2025":
        res.status(400).json({ message: "Room or photo is not founded" })
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

const updateRoom = async (req, res) => {
  try {
    const id = validationId.parse(req.params.id)
    const { name, location, capacity, facilities, photos } =
      validationUpdateRoom.parse(req.body)

    if (!name && !location && !capacity && !facilities && !photos)
      throw "Field must be filled at least one"

    if (facilities) await dropFacilities(id)

    if (photos) await dropPhotos(id)

    await PrismaClientRUMII.tb_m_room
      .update({
        where: { id },
        data: {
          name,
          location,
          capacity,
          facilities: {
            create: facilities?.map((facility) => ({
              facility: {
                connect: {
                  id: facility.id,
                },
              },
              number_of_facility: facility.number_of_facility,
            })),
          },
          room_photos: {
            create: photos?.map((photo) => ({
              url: photo.url,
              highlight: photo.highlight,
            })),
          },
        },
        include: {
          facilities: {
            include: {
              facility: true,
            },
          },
          room_photos: true,
        },
      })
      .then((room) =>
        res.json({
          data: room,
          status: "success",
          message: "Update room successfully",
        })
      )
  } catch (error) {
    switch (error.code) {
      case "P2025":
        error.meta.cause.includes("tb_m_room")
          ? res.status(400).json({ message: "Room is not founded" })
          : res.status(400).json({ message: "Facility is not founded" })
        break
      case "P2002":
        res.status(400).json({ message: "Room name is already used" })
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

const dropFacilities = async (room_id) => {
  await PrismaClientRUMII.tb_tr_room_facility
    .deleteMany({ where: { room_id } })
    .catch((err) => err)
}

const dropPhotos = async (room_id) => {
  await PrismaClientRUMII.tb_tr_room_photos
    .deleteMany({ where: { room_id } })
    .catch((err) => err)
}

const deleteImage = async (key) => {
  const deleteParams = {
    Bucket: process.env.S3_BUCKET_KEY,
    Key: key,
  }

  await s3Client
    .send(new DeleteObjectCommand(deleteParams))
    .catch((err) => `"Error deleting file:", ${err}`)
}

module.exports = {
  getRoom,
  getAllRooms,
  createRoom,
  updateRoom,
  updateRoomPhotos,
  deleteRoomPhotos,
}
