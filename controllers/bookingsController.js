const { PrismaClientRUMII } = require("../db")
const { DateTime } = require("luxon")
const { STATUS } = require("../constant/Constant")
const {
  validationId,
  validationCreateBooking,
  validationUpdateBooking,
  validationDate,
  validationGetAllBooking,
} = require("../utils/validations")
const sendEmailWithGmail = require("../utils/emailSender")

const getBooking = async (req, res) => {
  try {
    const id = validationId.parse(req.params.id)
    const booking = await PrismaClientRUMII.tb_m_booking.findUniqueOrThrow({
      where: { id },
      include: {
        guest: true,
        room: {
          include: {
            room_photos: true,
          },
        },
      },
    })

    res.json({ ...booking, duration: getDuration(booking.start, booking.end) })
  } catch (error) {
    switch (error.code) {
      case "P2025":
        res.status(400).json({ status: 400, message: "Booking is not found" })
        break
      default:
        error.issues
          ? res.status(400).json({
              status: 400,
              message: error.issues.map((body) => body.message).join(" | "),
            })
          : res.status(400).json({ status: 400, message: error })
        break
    }
  }
}

const getBookingByRoomId = async (req, res) => {
  try {
    const id = validationId.parse(req.params.id)
    const { date, sort, page, limit } = validationGetAllBooking.parse(req.query)

    const take = limit ? parseInt(limit) : 10
    const skip = (page ? parseInt(page) - 1 : 0) * take
    const start = DateTime.fromISO(date).startOf("day").toISO()
    const end = DateTime.fromISO(date).endOf("day").toISO()

    const bookings = await PrismaClientRUMII.tb_m_booking.findMany({
      take,
      skip: skip ? skip : 0,
      where: {
        room_id: id,
        start: { gte: start ? start : DateTime.now().startOf("day").toISO() },
        end: { lte: end ? end : DateTime.now().endOf("day").toISO() },
      },
      orderBy: {
        start: sort ? sort : "asc",
      },
      include: {
        guest: true,
        room: {
          include: {
            room_photos: true,
          },
        },
      },
    })

    const bookingsWithDuration = await Promise.all(
      bookings.map((booking) => {
        return { ...booking, duration: getDuration(booking.start, booking.end) }
      })
    )

    res.json(bookingsWithDuration)
  } catch (error) {
    switch (error.code) {
      case "P2025":
        res.status(400).json({ message: "Room is not founded" })
        break
      default:
        error.issues
          ? res.status(400).json({
              status: 400,
              message: error.issues.map((body) => body.message).join(" | "),
            })
          : res.status(400).json({ status: 400, message: error })
        break
    }
  }
}

const getAllBookings = async (req, res) => {
  try {
    const { date, sort, page, limit } = validationGetAllBooking.parse(req.query)

    const take = limit ? parseInt(limit) : 10
    const skip = (page ? parseInt(page) - 1 : 0) * take
    const start = DateTime.fromISO(date).startOf("day").toISO()
    const end = DateTime.fromISO(date).endOf("day").toISO()

    const bookings = await PrismaClientRUMII.tb_m_booking.findMany({
      take,
      skip: skip ? skip : 0,
      where: {
        start: { gte: start ? start : DateTime.now().startOf("day").toISO() },
        end: { lte: end ? end : DateTime.now().endOf("day").toISO() },
      },
      orderBy: {
        start: sort ? sort : "asc",
      },
      include: {
        guest: true,
        room: {
          include: {
            room_photos: true,
          },
        },
      },
    })

    const bookingsWithDuration = await Promise.all(
      bookings.map((booking) => {
        return { ...booking, duration: getDuration(booking.start, booking.end) }
      })
    )

    res.json(bookingsWithDuration)
  } catch (error) {
    switch (error.code) {
      default:
        error.issues
          ? res.status(400).json({
              status: 400,
              message: error.issues.map((body) => body.message).join(" | "),
            })
          : res.status(400).json({ status: 400, message: error })
        break
    }
  }
}

const createBooking = async (req, res) => {
  try {
    const {
      start_date_time,
      duration,
      title,
      guest_name,
      guest_email,
      guest_phone,
      room_id,
    } = validationCreateBooking.parse(req.body)
    const reservationist = req.id
    const emailReservationist = req.email

    const start = DateTime.fromISO(start_date_time).toISO()
    const end = DateTime.fromISO(start)
      .plus({ hours: duration })
      .minus({ seconds: 1 })
      .toISO()
    if (start < DateTime.now().toISO())
      throw "Time to place a booking room has been passed"

    validationDate(start, end)

    await checkRoomAvailable(room_id, start, end)

    const booking = await PrismaClientRUMII.tb_m_booking.create({
      data: {
        start,
        end,
        title,
        guest: {
          create: {
            name: guest_name,
            email: guest_email,
            phone: guest_phone,
          },
        },
        room: {
          connect: {
            id: room_id,
          },
        },
        reservationist,
      },
      include: {
        guest: true,
        room: true,
      },
    })

    await sendEmailWithGmail(
      guest_email,
      guest_name,
      booking.id,
      start,
      end,
      booking.room.name,
      booking.room.location,
      emailReservationist,
      title,
      "Confirmation"
    )

    res.status(201).json({
      message: `"${booking.title}" booked successfully!`,
      status: 201,
    })
  } catch (error) {
    switch (error.code) {
      case "P2025":
        res.status(400).json({ status: 400, message: "Room not found" })
        break
      default:
        error.issues
          ? res.status(400).json({
              status: 400,
              message: error.issues.map((body) => body.message).join(" | "),
            })
          : res.status(400).json({ status: 400, message: error })
        break
    }
  }
}

const updateBooking = async (req, res) => {
  try {
    const id = validationId.parse(req.params.id)
    const { start_date_time, duration } = validationUpdateBooking.parse(
      req.body
    )
    const emailReservationist = req.email

    const start = DateTime.fromISO(start_date_time).toISO()
    const end = DateTime.fromISO(start)
      .plus({ hours: duration })
      .minus({ seconds: 1 })
      .toISO()
    if (
      DateTime.fromISO(start).minus({ minute: 15 }).toISO() <
      DateTime.now().toISO()
    )
      throw "Time to place a booking room has been passed"

    validationDate(start, end)

    const isBookingExist = await checkBookingId(id)

    if (getStatus(isBookingExist.status))
      throw "Booking cannot be rescheduled anymore"

    if (
      start == DateTime.fromJSDate(isBookingExist.start).toISO() &&
      duration == getDuration(isBookingExist.start, isBookingExist.end)
    )
      throw "Start date and duration must be different from previous booking"

    await checkRoomAvailable(isBookingExist.room_id, start, end, id)

    const reschedule = await PrismaClientRUMII.tb_m_booking.update({
      where: { id },
      data: {
        start,
        end,
        status: STATUS.rescheduled,
      },
      include: {
        guest: true,
        room: true,
      },
    })

    await sendEmailWithGmail(
      reschedule.guest.email,
      reschedule.guest.name,
      reschedule.id,
      start,
      end,
      reschedule.room.name,
      reschedule.room.location,
      emailReservationist,
      reschedule.title,
      "Reschedule"
    )

    res.json({
      status: 200,
      message: `"${reschedule.title}" rescheduled successfully!`,
    })
  } catch (error) {
    switch (error.code) {
      case "P2025":
        res.status(400).json({ status: 400, message: "Booking is not founded" })
        break
      default:
        error.issues
          ? res.status(400).json({
              status: 400,
              message: error.issues.map((body) => body.message).join(" | "),
            })
          : res.status(400).json({ message: error })
        break
    }
  }
}

const cancelBooking = async (req, res) => {
  try {
    const id = validationId.parse(req.params.id)
    const emailReservationist = req.email

    const isBookingExist = await checkBookingId(id)

    if (getStatus(isBookingExist.status))
      throw "Booking cannot be cancelled anymore"

    const cancel = await PrismaClientRUMII.tb_m_booking.update({
      where: { id },
      data: {
        status: STATUS.cancelled,
      },
      include: {
        guest: true,
        room: true,
      },
    })

    await sendEmailWithGmail(
      cancel.guest.email,
      cancel.guest.name,
      cancel.id,
      DateTime.fromJSDate(cancel.start).toISO(),
      DateTime.fromJSDate(cancel.end).toISO(),
      cancel.room.name,
      cancel.room.location,
      emailReservationist,
      cancel.title,
      "Cancel"
    )

    res.json({
      data: cancel.status,
      status: 200,
      message: `Booking: ${cancel.id} has been cancelled!`,
    })
  } catch (error) {
    switch (error.code) {
      case "P2025":
        res.status(400).json({ status: 400, message: "Booking is not founded" })
        break
      default:
        error.issues
          ? res.status(400).json({
              status: 400,
              message: error.issues.map((body) => body.message).join(" | "),
            })
          : res.status(400).json({ status: 400, message: error })
        break
    }
  }
}

const checkBookingId = async (id) => {
  return await PrismaClientRUMII.tb_m_booking.findUniqueOrThrow({
    where: { id },
  })
}

const checkRoomAvailable = async (room_id, start, end, booking_id) => {
  let isRoomAvailable = await PrismaClientRUMII.tb_m_booking.findMany({
    where: {
      start: { lte: end },
      end: { gte: start },
      status: {
        in: [STATUS.upcoming, STATUS.ongoing, STATUS.rescheduled],
      },
      room_id,
    },
  })

  booking_id
    ? (isRoomAvailable = isRoomAvailable.filter(
        (booking) => booking.id !== booking_id
      ))
    : isRoomAvailable

  if (isRoomAvailable.length > 0) throw "Room is already used at that time"
  return isRoomAvailable
}

const updateStatus = async () => {
  const bookings = await PrismaClientRUMII.tb_m_booking.findMany({
    where: {
      start: { gte: DateTime.now().startOf("day").toISO() },
      end: { lte: DateTime.now().endOf("day").toISO() },
      status: {
        notIn: [STATUS.ended, STATUS.cancelled],
      },
    },
  })

  if (bookings.length > 0) {
    bookings.forEach(async (booking) => {
      const now = DateTime.now().toJSDate()

      if (
        now >= booking.start &&
        now <= booking.end &&
        booking.status !== STATUS.ongoing
      ) {
        await PrismaClientRUMII.tb_m_booking.update({
          where: { id: booking.id },
          data: { status: STATUS.ongoing },
        })
      } else if (now >= booking.end && booking.status === STATUS.ongoing) {
        await PrismaClientRUMII.tb_m_booking.update({
          where: { id: booking.id },
          data: { status: STATUS.ended },
        })
      }
    })
  }
}

const getDuration = (start, end) => {
  return (
    parseInt(DateTime.fromJSDate(end).plus({ seconds: 1 }).toFormat("HH")) -
    parseInt(DateTime.fromJSDate(start).toFormat("HH"))
  )
}

const getStatus = (status) => {
  return (
    status == STATUS.ended ||
    status == STATUS.cancelled ||
    status == STATUS.ongoing
  )
}

module.exports = {
  getBooking,
  getBookingByRoomId,
  getAllBookings,
  createBooking,
  updateBooking,
  cancelBooking,
  updateStatus,
}
