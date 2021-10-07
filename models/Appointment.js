const mongoose = require('mongoose')

const appSchema = new mongoose.Schema({
  year: Number,
  month: Number,
  day: Number,
  hour: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

appSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
  })

module.exports = mongoose.model('Appointment', appSchema)