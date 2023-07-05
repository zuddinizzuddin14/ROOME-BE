const z = require("zod")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { PrismaClientMA } = require("../db")
const { validationLogin } = require("../utils/validations")

// @desc Login
// @route POST /auth
// @access Public
const login = async (req, res) => {
  try {
    const { email, password } = validationLogin.parse(req.body)

    const findUser = await PrismaClientMA.tb_m_user.findUniqueOrThrow({
      where: { email },
      select: { id: true, name: true },
    })

    const findUserAccount = await PrismaClientMA.tb_m_account.findFirst({
      where: { id: findUser.id },
    })

    const findUserProfilePicture = await PrismaClientMA.tb_m_file.findFirst({
      where: { id: findUser.id },
    })

    if (!(await bcrypt.compare(password, findUserAccount.password)))
      throw { code: "Unauthorized" }

    const accessToken = jwt.sign(
      {
        id: findUser.id,
        email: email,
        name: findUser.name,
        profilePicture: findUserProfilePicture.profile_picture,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    )

    const refreshToken = jwt.sign(
      {
        id: findUser.id,
        email: email,
        name: findUser.name,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    )

    // Create secure cookie with refresh token
    res.cookie("jwt", refreshToken, {
      httpOnly: true, //accessible only by web server
      secure: true, //https
      sameSite: "None", //cross-site cookie
      maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiry: set to match rT
    })

    res.json({ accessToken })
  } catch (error) {
    switch (error.code) {
      case "P2025":
        res.status(400).json({ message: "User is not founded" })
        break
      case "Unauthorized":
        res.status(401).json({ message: "Unauthorized" })
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

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
const refresh = (req, res) => {
  try {
    const cookies = req.cookies

    if (!cookies?.jwt) throw { code: "Unauthorized" }

    const refreshToken = cookies.jwt

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) throw { code: "Forbidden" }

        const foundUser = await PrismaClientMA.tb_m_user.findUniqueOrThrow({
          where: { email: decoded.email },
        })

        const findUserProfilePicture = await PrismaClientMA.tb_m_file.findFirst(
          {
            where: { id: foundUser.id },
          }
        )

        const accessToken = jwt.sign(
          {
            id: foundUser.id,
            email: foundUser.email,
            name: foundUser.name,
            profilePicture: findUserProfilePicture.profile_picture,
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "15m" }
        )

        res.json({ accessToken })
      }
    )
  } catch (error) {
    switch (error.code) {
      case "P2025":
        res.status(401).json({ message: "Unauthorized" })
        break
      case "Unauthorized":
        res.status(401).json({ message: "Unauthorized" })
        break
      case "Forbidden":
        res.status(403).json({ message: "Forbidden" })
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

// @desc Logout
// @route POST /auth/logout
// @access Public - just to clear cookie if exists
const logout = (req, res) => {
  const cookies = req.cookies
  if (!cookies?.jwt) return res.sendStatus(204) //No content
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true })
  res.json({ message: "Cookie cleared" })
}

module.exports = { login, refresh, logout }
