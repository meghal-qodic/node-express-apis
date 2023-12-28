import 'express-async-errors'
import * as dotenv from 'dotenv'

import express from 'express'

import morgan from 'morgan'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import cloudinary from 'cloudinary'
import helmet from 'helmet'
import mongoSanitize from 'express-mongo-sanitize'

// routers
import jobRouter from './routes/jobRouter.js'
import authRouter from './routes/authRouter.js'
import userRouter from './routes/userRouter.js'
// public
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
// import path from 'path'

// middleware
import errorHandlerMiddleware from './middleware/errorHandlerMiddleware.js'
import { authenticateUser } from './middleware/authMiddleware.js'
import { MESSAGES, ENVIRONMENT } from './utils/constants.js'

dotenv.config()
const app = express()

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
})

const __dirname = dirname(fileURLToPath(import.meta.url))
if (process.env.NODE_ENV === ENVIRONMENT.DEV) {
  app.use(morgan('dev'))
}
app.use(express.static(path.resolve(__dirname, './client/dist')))
app.use(cookieParser())
app.use(express.json())
app.use(helmet())
app.use(mongoSanitize())

app.get('/', (req, res) => {
  res.send(MESSAGES.DEFAULT_ROOT_URL_MSG)
})

app.use('/api/v1/jobs', authenticateUser, jobRouter)
app.use('/api/v1/users', authenticateUser, userRouter)
app.use('/api/v1/auth', authRouter)

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './client/dist', 'index.html'))
})

app.use('*', (req, res) => {
  res.status(404).json({ msg: MESSAGES.NOT_FOUND })
})

app.use(errorHandlerMiddleware)

const port = process.env.PORT || 5100

try {
  await mongoose.connect(process.env.MONGO_URL)
  app.listen(port, () => {
    console.log(`${MESSAGES.SERVER_RUNNING_ON} ${port}...`)
  })
} catch (error) {
  console.log(error)
  process.exit(1)
}
