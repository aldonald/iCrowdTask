const mongoose = require('mongoose')


const RequestSchema = new mongoose.Schema(
  {
    user:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      unique: true
    },
    description: String,
    name: String,
    logo: {
      data: Buffer,
      contentType: String
    },
    created: Date
  }
)

module.exports = mongoose.model("Request", RequestSchema)
