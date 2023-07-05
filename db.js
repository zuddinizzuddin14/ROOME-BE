const {
  PrismaClient: PrismaClientRUMII,
} = require("./prisma/generated/clientRUMII")
const { PrismaClient: PrismaClientMA } = require("./prisma/generated/clientMA")

exports.PrismaClientMA = new PrismaClientMA()
exports.PrismaClientRUMII = new PrismaClientRUMII()
