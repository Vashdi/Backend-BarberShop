const mongoose = require('mongoose')

const strictDaySchema = new mongoose.Schema({
    day: Date,
    start: String,
    end: String
})

strictDaySchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const StrictDay = mongoose.model('StrictDay', strictDaySchema)

module.exports = StrictDay