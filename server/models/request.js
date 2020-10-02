const mongoose = require('mongoose')


const RequestSchema = new mongoose.Schema(
  {
    user:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    title: String,
    description: String,
    choiceQuestion: String,
    choiceOptions: [String],
    decisionTaskQuestion: String,
    sentenceTaskQuestion: String,
    masterWorkers: String,
    reward: String,
    workerNumbers: Number,
    name: String,
    logo: {
      data: Buffer,
      contentType: String
    },
    expiry: Date,
    created: Date
  }
)

module.exports = mongoose.model("Request", RequestSchema)
