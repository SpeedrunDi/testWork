const mongoose = require('mongoose');

const { Schema } = mongoose;

const NewSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});

const New = mongoose.model('New', NewSchema);
module.exports = New;