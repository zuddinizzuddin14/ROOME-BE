const { DateTime } = require("luxon")
const z = require("zod")
const { SORT, LIMIT, CAPACITY } = require("../constant/Constant")

const validationLogin = z.object({
  email: z
    .string({ required_error: "Field email is required" })
    .trim()
    .nonempty("Field email is required"),
  password: z
    .string({ required_error: "Field password is required" })
    .trim()
    .nonempty("Field password is required"),
})

const validationId = z
  .string({ required_error: "Parameter id is required" })
  .uuid()

const facilitySchema = z.object({
  number_of_facility: z
    .number({ required_error: "Field number_of_facility is required" })
    .int()
    .min(1),
  id: z.string({ required_error: "Field id is required" }).uuid(),
})

const photoSchema = z.object({
  url: z
    .string({ required_error: "Field url is required" })
    .trim()
    .nonempty("Field url is required"),
  highlight: z.boolean().default(false),
})

const validationGetAllRoom = z.object({
  name: z.string().optional(),
  capacity: z.string().optional(),
  sort: z.enum(SORT).optional(),
  page: z.string().optional(),
  limit: z.enum(LIMIT).default(10).optional(),
})

const validationCreateRoom = z.object({
  name: z
    .string({ required_error: "Field name is required" })
    .trim()
    .nonempty("Field name is required"),
  location: z
    .string({ required_error: "Field location is required" })
    .trim()
    .nonempty("Field location is required"),
  capacity: z
    .number({ required_error: "Field capacity is required" })
    .int()
    .min(1),
  facilities: z
    .array(facilitySchema, { required_error: "Field facilities is required" })
    .min(1),
  photos: z
    .array(photoSchema, { required_error: "Field photos is required" })
    .min(1),
})

const validationUpdateRoom = z.object({
  name: z.string().trim().nonempty().optional(),
  location: z.string().trim().nonempty().optional(),
  capacity: z.number().int().min(1).optional(),
  facilities: z.array(facilitySchema).min(1).optional(),
  photos: z.array(photoSchema).min(1).optional(),
})

const validationFiles = (files) => {
  if (!files || files.length < 1) throw "Files are empty"
  else return files
}

const validationGetAllFacilities = z.object({
  name: z.string().optional(),
  sort: z.enum(SORT).optional(),
  page: z.string().optional(),
  limit: z.enum(LIMIT).default(10).optional(),
})

const validationFacilities = z
  .string({ required_error: "Field name is required" })
  .trim()
  .nonempty("Field name is required")

const validationGetAllBooking = z.object({
  date: z.string().datetime().optional(),
  sort: z.enum(SORT).optional(),
  page: z.string().optional(),
  limit: z.enum(LIMIT).default(10).optional(),
})

const validationCreateBooking = z.object({
  start_date_time: z
    .string({ required_error: "Field start_date_time is required" })
    .datetime(),
  duration: z
    .number({ required_error: "Field duration is required" })
    .int()
    .min(1)
    .max(11),
  title: z
    .string({ required_error: "Field title is required" })
    .trim()
    .nonempty("Field title is required"),
  guest_name: z
    .string({ required_error: "Field guest_name is required" })
    .trim()
    .nonempty("Field guest_name is required"),
  guest_email: z
    .string({ required_error: "Field guest_email is required" })
    .email(),
  guest_phone: z
    .string({ required_error: "Field guest_phone is required" })
    .trim()
    .nonempty("Field guest_phone is required"),
  room_id: z.string({ required_error: "Field room_id is required" }).uuid(),
})

const validationUpdateBooking = z.object({
  start_date_time: z
    .string({ required_error: "Field start_date_time is required" })
    .datetime(),
  duration: z
    .number({ required_error: "Field duration is required" })
    .int()
    .min(1)
    .max(11),
})

const validationDate = (start, end) => {
  if (DateTime.fromISO(start).weekday > 5)
    throw "Book a room only available on weekdays"

  if (
    parseInt(
      DateTime.fromISO(start, { zone: "Asia/Jakarta" }).toFormat("HHmmss")
    ) < 80000 ||
    parseInt(
      DateTime.fromISO(end, { zone: "Asia/Jakarta" }).toFormat("HHmmss")
    ) > 190000
  )
    throw "Book a room only available on 8am to 7pm"
}

module.exports = {
  validationLogin,
  validationId,
  validationGetAllRoom,
  validationCreateRoom,
  validationUpdateRoom,
  validationFiles,
  validationGetAllFacilities,
  validationFacilities,
  validationGetAllBooking,
  validationCreateBooking,
  validationUpdateBooking,
  validationDate,
}
