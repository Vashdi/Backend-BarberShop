const closedDaysRouter = require('express').Router();
const closedDays = require('../models/ClosedDays');

closedDaysRouter.get('/', async (request, response) => {
    try {
        const allClosedDays = await closedDays.find({});
        response.json(allClosedDays);
    } catch {
        response.status(401).send('אופס, משהו השתבש אנא נסה שנית או פנה למנהל המערכת');
    }
})

closedDaysRouter.delete('/:date', async (request, response) => {
    try {
        const date = new Date(request.params.date);
        const ClosedDay = await closedDays.findOneAndDelete({ date: date });
        response.json(ClosedDay)
    }
    catch {
        response.status(401).send('אופס, משהו השתבש אנא נסה שנית או פנה למנהל המערכת');
    }
})

closedDaysRouter.post('/', async (request, response) => {
    try {
        const body = request.body;
        const newClosedDays = new closedDays({
            date: body.date
        })
        const savedClosedDay = await newClosedDays.save()
        response.json(savedClosedDay)
    } catch {
        response.status(401).send('אופס, משהו השתבש אנא נסה שנית או פנה למנהל המערכת');
    }
})

module.exports = closedDaysRouter