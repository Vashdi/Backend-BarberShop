const jwt = require('jsonwebtoken')
const strictRouter = require('express').Router()
const Strict = require('../models/Strict')

strictRouter.get('/', async (request, response) => {
    const stricts = await Strict.find({})
    response.json(stricts)
})

strictRouter.post('/', async (request, response) => {
    const token = request.headers.authorization;
    jwt.verify(token, process.env.SECRET, async function (err, decoded) {
        if (err) {
            return response.status(401).json({
                error: 'You need to login first!'
            })
        }
        else {
            const body = request.body

            const strict = new Strict({
                day: body.day
            })

            const newStrict = await strict.save();
            response.json(newStrict)
        }
    });
})

strictRouter.delete('/', async (request, response) => {
    const token = request.headers.authorization;
    const day = request.body.day;
    jwt.verify(token, process.env.SECRET, async function (err, decoded) {
        if (err) {
            return response.status(401).json({
                error: 'You need to login first!'
            })
        }
        else {

            const newStrict = await Strict.deleteMany({ day: day })

            response.json(newStrict)
        }
    });
})



module.exports = strictRouter
