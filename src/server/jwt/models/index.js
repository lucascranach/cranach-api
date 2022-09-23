const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

UserSchema.pre(
  'save',
  async function call(next) {
    const user = this;
    const hash = await bcrypt.hash(user.password, 10);

    this.password = hash;
    next();
  },
);

UserSchema.methods.isValidPassword = async function call(password) {
  const user = this;
  const compare = await bcrypt.compare(password, user.password);

  return compare;
};

const UserModel = mongoose.model('user', UserSchema);

module.exports = UserModel;

