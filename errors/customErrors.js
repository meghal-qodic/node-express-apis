import { StatusCodes } from 'http-status-codes'
import { ERROR_NAMES } from '../utils/constants.js'

export class NotFoundError extends Error {
  constructor(message) {
    super(message)
    this.name = ERROR_NAMES.NOT_FOUND
    this.statusCode = StatusCodes.NOT_FOUND
  }
}
export class BadRequestError extends Error {
  constructor(message) {
    super(message)
    this.name = ERROR_NAMES.BAD_REQUEST
    this.statusCode = StatusCodes.BAD_REQUEST
  }
}
export class UnauthenticatedError extends Error {
  constructor(message) {
    super(message)
    this.name = ERROR_NAMES.UNAUTHENTICATED
    this.statusCode = StatusCodes.UNAUTHORIZED
  }
}
export class UnauthorizedError extends Error {
  constructor(message) {
    super(message)
    this.name = ERROR_NAMES.UNAUTHORIZED
    this.statusCode = StatusCodes.FORBIDDEN
  }
}
