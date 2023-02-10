const mongoose = require('mongoose');

const { Schema } = mongoose;

const bcrypt = require('bcrypt');

const SALT_WORK_FACTOR = 10;

const validateUnique = async value => {
  const user = await User.findOne({ username: value })

  if (user) return false
}

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    validate: [
      { validator: validateUnique, message: 'Такой пользователеь уже есть!' },
    ],
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    default: 'user',
    enum: ['user', 'admin'],
  },
  token: {
    type: String,
    required: true,
  },
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

UserSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    delete ret.password;
    return ret;
  },
});

UserSchema.methods.checkPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', UserSchema);
module.exports = User;