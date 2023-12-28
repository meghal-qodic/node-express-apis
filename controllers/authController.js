import { StatusCodes } from 'http-status-codes'
import User from '../models/UserModel.js'
import { comparePassword, hashPassword } from '../utils/passwordUtils.js'
import { UnauthenticatedError } from '../errors/customErrors.js'
import { createJWT } from '../utils/tokenUtils.js'
import {
  ENVIRONMENT,
  MESSAGES,
  USER_TYPE,
  VALIDATION_MESSAGES,
} from '../utils/constants.js'

// Handles register user request
export const register = async (req, res) => {
  // If the registration is for first user then it will be created as an admin
  // else user role
  const isFirstAccount = (await User.countDocuments()) === 0
  req.body.role = isFirstAccount ? USER_TYPE.ADMIN : USER_TYPE.USER

  const hashedPassword = await hashPassword(req.body.password)
  req.body.password = hashedPassword

  await User.create(req.body)

  res.status(StatusCodes.CREATED).json({ msg: MESSAGES.USER_CREATED })
}

// Handles login request
export const login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email })

  const isValidUser =
    user && (await comparePassword(req.body.password, user.password))

  if (!isValidUser) {
    throw new UnauthenticatedError(VALIDATION_MESSAGES.INVALID_CREDENTIALS)
  }

  const token = createJWT({ userId: user._id, role: user.role })

  const oneDay = 1000 * 60 * 60 * 24

  // Set token as cookie in the browser with one day as expiry
  res.cookie('token', token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === ENVIRONMENT.PROD,
  })
  res.status(StatusCodes.OK).json({ msg: MESSAGES.LOGGED_IN })
}

// Handles logout request and expires the cookie set during login
export const logout = (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  })
  res.status(StatusCodes.OK).json({ msg: MESSAGES.LOGGED_OUT })
}
