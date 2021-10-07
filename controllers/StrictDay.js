const jwt = require('jsonwebtoken')
const strictDayRouter = require('express').Router()
const StrictDay = require('../models/StrictDay')

strictDayRouter.get('/', async (request, response) => {
    const stricts = await StrictDay.find({})
    response.json(stricts)
})

strictDayRouter.post('/', async (request, response) => {
    const token = request.headers.authorization;
    jwt.verify(token, process.env.SECRET, async function (err, decoded) {
        if (err) {
            return response.status(401).json({
                error: 'You need to login first!'
            })
        }
        else {
            const body = request.body

            const strict = new StrictDay({
                day: body.day,
                start: body.start,
                end: body.end,
            })

            const prevStrict = await StrictDay.find({ day: body.day });
            if (prevStrict) {
                await StrictDay.deleteMany({ day: body.day });
            }

            const newStrict = await strict.save();
            response.json(newStrict)
        }
    });

})


module.exports = strictDayRouter
