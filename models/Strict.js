const mongoose = require('mongoose')

const strictSchema = new mongoose.Schema({
    day: Date
})

strictSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const Strict = mongoose.model('Strict', strictSchema)

module.exports = Strict