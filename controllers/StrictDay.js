const jwt = require('jsonwebtoken')
const strictDayRouter = require('express').Router()
const StrictDay = require('../models/StrictDay')

strictDayRouter.get('/', async (request, response) => {
    try {
        const stricts = await StrictDay.find({})
        response.json(stricts)
    } catch {
        response.status(401).send('אופס, משהו השתבש אנא נסה שנית או פנה למנהל המערכת');
    }
})

strictDayRouter.post('/', async (request, response) => {
    const token = request.headers.authorization;
    jwt.verify(token, process.env.SECRET, async function (err, decoded) {
        if (err) {
            response.status(401).send('!נא התחבר מחדש לקביעת הפסקה');
        }
        else {
            try {
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
            } catch {
                response.status(401).send('אופס, משהו השתבש אנא נסה שנית או פנה למנהל המערכת');
            }
        }
    });
})


module.exports = strictDayRouter
