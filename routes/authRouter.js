import { Router } from 'express'

import { login, logout, register } from '../controllers/authController.js'
import {
  validateRegisterInput,
  validateLoginInput,
} from '../middleware/validationMiddleware.js'
import { MESSAGES } from '../utils/constants.js'

import rateLimiter from 'express-rate-limit'

const router = Router()

const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { msg: MESSAGES.RATE_LIMIT },
})

router.post('/register', apiLimiter, validateRegisterInput, register)
router.post('/login', apiLimiter, validateLoginInput, login)
router.get('/logout', logout)

export default router
