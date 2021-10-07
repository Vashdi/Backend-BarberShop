const closedDaysRouter = require('express').Router();
const closedDays = require('../models/ClosedDays');

closedDaysRouter.get('/', async (request, response) => {
    const allClosedDays = await closedDays.find({});
    response.json(allClosedDays);
})

closedDaysRouter.delete('/:date', async (request, response) => {
    try {
        const date = new Date(request.params.date);
        const ClosedDay = await closedDays.findOneAndDelete({ date: date });
        response.json(ClosedDay)
    }
    catch {
        response.status(401).json({ error: 'not found' })
    }
})

closedDaysRouter.post('/', async (request, response) => {
    const body = request.body;

    const newClosedDays = new closedDays({
        date: body.date
    })

    const savedClosedDay = await newClosedDays.save()

    response.json(savedClosedDay)

})

module.exports = closedDaysRouter