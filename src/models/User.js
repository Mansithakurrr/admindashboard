// models/User.js
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  });
  