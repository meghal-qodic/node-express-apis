import { StatusCodes } from 'http-status-codes'
import { VALIDATION_MESSAGES } from '../utils/constants.js'

const errorHandlerMiddleware = (err, req, res, next) => {
  console.log(err)
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR

  const msg = err.message || VALIDATION_MESSAGES.SOMETHING_WENT_WRONG

  res.status(statusCode).json({ msg })
}

export default errorHandlerMiddleware
