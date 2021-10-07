const mongoose = require('mongoose')

const adminAppSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    year: Number,
    month: Number,
    day: Number,
    hour: String
})

adminAppSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('AdminAppointment', adminAppSchema)