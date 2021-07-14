const mongoose = require('mongoose');

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;
const chatSchema = new Schema({
  user: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
    max: 10,
  },
  time:{
      type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Chat', chatSchema);