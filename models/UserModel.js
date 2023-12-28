import mongoose from 'mongoose'
import { DEFAULT_MODELS } from '../utils/constants.js'

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  lastName: {
    type: String,
    default: DEFAULT_MODELS.LAST_NAME,
  },
  location: {
    type: String,
    default: DEFAULT_MODELS.JOB_LOCATION,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: DEFAULT_MODELS.USER_TYPE,
  },
  avatar: String,
  avatarPublicId: String,
})

UserSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  return obj
}

export default mongoose.model('User', UserSchema)
