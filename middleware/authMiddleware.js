import {
  UnauthenticatedError,
  UnauthorizedError,
  BadRequestError,
} from '../errors/customErrors.js'
import { VALIDATION_MESSAGES } from '../utils/constants.js'
import { verifyJWT } from '../utils/tokenUtils.js'

export const authenticateUser = (req, res, next) => {
  const { token } = req.cookies
  if (!token) throw new UnauthenticatedError(VALIDATION_MESSAGES.INVALID_AUTH)

  try {
    const { userId, role } = verifyJWT(token)
    const testUser = userId === '64b2c07ccac2efc972ab0eca'
    req.user = { userId, role, testUser }
    next()
  } catch (error) {
    throw new UnauthenticatedError(VALIDATION_MESSAGES.INVALID_AUTH)
  }
}

export const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError(VALIDATION_MESSAGES.ROUTE_NOT_AUTH)
    }
    next()
  }
}

export const checkForTestUser = (req, res, next) => {
  if (req.user.testUser) {
    throw new BadRequestError(VALIDATION_MESSAGES.DEMO_USER)
  }

  next()
}
