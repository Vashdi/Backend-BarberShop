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
            response.status(401).send('!נא התחבר מחדש לקביעת יום חופש קבוע');
        }
        else {
            try {
                const body = request.body
                const strict = new Strict({
                    day: body.day
                })
                const newStrict = await strict.save();
                response.json(newStrict)
            } catch {
                response.status(401).send('אופס, משהו השתבש אנא נסה שנית או פנה למנהל המערכת');
            }
        }
    });
})

strictRouter.delete('/', async (request, response) => {
    const token = request.headers.authorization;
    const day = request.body.day;
    jwt.verify(token, process.env.SECRET, async function (err, decoded) {
        if (err) {
            response.status(401).send('!נא התחבר מחדש לביטול יום חופש קבוע');
        }
        else {
            try {
                const newStrict = await Strict.deleteMany({ day: day })
                response.json(newStrict)
            } catch {
                response.status(401).send('אופס, משהו השתבש אנא נסה שנית או פנה למנהל המערכת');
            }
        }
    });
})



module.exports = strictRouter
