const mongoose = require('mongoose')

const blackListSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    phone: String
})

blackListSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('blackList', blackListSchema)