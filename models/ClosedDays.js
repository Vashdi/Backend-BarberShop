const mongoose = require('mongoose')

const closedDaysSchema = new mongoose.Schema({
    date: Date
})

closedDaysSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('closedDays', closedDaysSchema)