import { body, param, validationResult } from 'express-validator'
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '../errors/customErrors.js'
import {
  JOB_STATUS,
  JOB_TYPE,
  VALIDATION_MESSAGES,
  USER_TYPE,
} from '../utils/constants.js'
import mongoose from 'mongoose'
import Job from '../models/JobModel.js'
import User from '../models/UserModel.js'

const withValidationErrors = (validateValues) => {
  return [
    validateValues,
    (req, res, next) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg)

        const firstMessage = errorMessages[0]
        console.log(Object.getPrototypeOf(firstMessage))
        if (errorMessages[0].startsWith(VALIDATION_MESSAGES.NO_JOB)) {
          throw new NotFoundError(errorMessages)
        }
        if (errorMessages[0].startsWith(VALIDATION_MESSAGES.NOT_AUTHORIZED)) {
          throw new UnauthorizedError(VALIDATION_MESSAGES.ROUTE_NOT_AUTH)
        }
        throw new BadRequestError(errorMessages)
      }
      next()
    },
  ]
}

export const validateJobInput = withValidationErrors([
  body('company').notEmpty().withMessage(VALIDATION_MESSAGES.COMPANY_REQ),
  body('position').notEmpty().withMessage(VALIDATION_MESSAGES.POSITION_REQ),
  body('jobLocation')
    .notEmpty()
    .withMessage(VALIDATION_MESSAGES.JOB_LOCATION_REQ),
  body('jobStatus')
    .isIn(Object.values(JOB_STATUS))
    .withMessage(VALIDATION_MESSAGES.JOB_STATUS_INVALID),
  body('jobType')
    .isIn(Object.values(JOB_TYPE))
    .withMessage(VALIDATION_MESSAGES.JOB_TYPE_INVALID),
])

export const validateIdParam = withValidationErrors([
  param('id').custom(async (value, { req }) => {
    const isValidMongoId = mongoose.Types.ObjectId.isValid(value)
    if (!isValidMongoId) {
      throw new BadRequestError(VALIDATION_MESSAGES.MONGO_ID_INVALID)
    }

    const job = await Job.findById(value)
    if (!job) throw new NotFoundError(`no job with id ${value}`)
    const isAdmin = req.user.role === USER_TYPE.ADMIN
    const isOwner = req.user.userId === job.createdBy.toString()

    if (!isAdmin && !isOwner) {
      throw new UnauthorizedError(VALIDATION_MESSAGES.ROUTE_NOT_AUTH)
    }
  }),
])

export const validateRegisterInput = withValidationErrors([
  body('name').notEmpty().withMessage(VALIDATION_MESSAGES.NAME_REQ),
  body('email')
    .notEmpty()
    .withMessage(VALIDATION_MESSAGES.EMAIL_REQ)
    .isEmail()
    .withMessage(VALIDATION_MESSAGES.EMAIL_INVALID)
    .custom(async (email) => {
      const user = await User.findOne({ email })
      if (user) {
        throw new BadRequestError(VALIDATION_MESSAGES.EMAIL_EXISTS)
      }
    }),
  body('password')
    .notEmpty()
    .withMessage(VALIDATION_MESSAGES.PASSWORD_REQ)
    .isLength({ min: 8 })
    .withMessage(VALIDATION_MESSAGES.PASSWORD_LENGTH),
  body('location').notEmpty().withMessage(VALIDATION_MESSAGES.LOCATION_REQ),
  body('lastName').notEmpty().withMessage(VALIDATION_MESSAGES.LAST_NAME_REQ),
])

export const validateLoginInput = withValidationErrors([
  body('email')
    .notEmpty()
    .withMessage(VALIDATION_MESSAGES.EMAIL_REQ)
    .isEmail()
    .withMessage(VALIDATION_MESSAGES.EMAIL_INVALID),
  body('password').notEmpty().withMessage(VALIDATION_MESSAGES.PASSWORD_REQ),
])

export const validateUpdateUserInput = withValidationErrors([
  body('name').notEmpty().withMessage(VALIDATION_MESSAGES.NAME_REQ),
  body('email')
    .notEmpty()
    .withMessage(VALIDATION_MESSAGES.EMAIL_REQ)
    .isEmail()
    .withMessage(VALIDATION_MESSAGES.EMAIL_INVALID)
    .custom(async (email, { req }) => {
      const user = await User.findOne({ email })
      if (user && user._id.toString() !== req.user.userId) {
        throw new BadRequestError(VALIDATION_MESSAGES.EMAIL_EXISTS)
      }
    }),

  body('location').notEmpty().withMessage(VALIDATION_MESSAGES.LOCATION_REQ),
  body('lastName').notEmpty().withMessage(VALIDATION_MESSAGES.LAST_NAME_REQ),
])
