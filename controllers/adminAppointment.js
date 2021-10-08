const jwt = require('jsonwebtoken')
const adminAppointmentRouter = require('express').Router();
const adminAppointment = require('../models/AdminAppointment')
const Appointment = require('../models/Appointment')

const getTokenFrom = request => {
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        return authorization.substring(7)
    }
    return null
}

adminAppointmentRouter.get('/', async (request, response) => {
    try {
        const adminAppointments = await adminAppointment.find({});
        response.json(adminAppointments);
    } catch {
        response.status(401).send('אופס, משהו השתבש אנא נסה שנית או פנה למנהל המערכת');
    }

})

adminAppointmentRouter.get('/:year/:month/:day', async (request, response) => {
    try {
        const year = Number(request.params.year);
        const month = Number(request.params.month);
        const day = Number(request.params.day);
        const adminAppointments = await adminAppointment.find({ year: year, month: month, day: day });
        response.json(adminAppointments);
    } catch {
        response.status(401).send('אופס, משהו השתבש אנא נסה שנית או פנה למנהל המערכת');
    }

})


adminAppointmentRouter.post('/', async (request, response) => {
    try {
        const token = getTokenFrom(request)
        const decodedToken = jwt.verify(token, process.env.SECRET, (err) => err ? response.status(401).send('!נא התחבר מחדש לקביעת התור') : null);
        const body = request.body;
        const isExistClient = await Appointment.find({ year: body.year, month: body.month, day: body.day, hour: body.hour });
        if (isExistClient.length === 0) {
            const newAdminAppointment = new adminAppointment({
                firstName: body.firstName,
                lastName: body.lastName,
                year: body.year,
                month: body.month,
                day: body.day,
                hour: body.hour,
            })
            const savedAppointment = await newAdminAppointment.save()
            response.json(savedAppointment)
        }
        else {
            response.status(401).send('התור נתפס על ידי לקוח');
        }
    } catch {
        response.status(401).send('אופס, משהו השתבש אנא נסה שנית או פנה למנהל המערכת');
    }
})

adminAppointmentRouter.post('/break', (request, response) => {
    try {
        const token = getTokenFrom(request)
        const decodedToken = jwt.verify(token, process.env.SECRET, (err) => err ? response.status(401).send('!נא התחבר מחדש לקביעת הפסקה') : null);
        const body = request.body;
        body.array.every(async (hour) => {
            const isExistClient = await Appointment.find({ year: body.year, month: body.month, day: body.day, hour: body.hour });
            if (isExistClient.length > 0)
                return false;
        });
        if (isExistClient.length === 0) {
            body.array.map(async (hour) => {
                const newAdminAppointment = new adminAppointment({
                    firstName: "הפסקה-",
                    lastName: body.cause,
                    year: body.year,
                    month: body.month,
                    day: body.day,
                    hour: hour,
                })
                await newAdminAppointment.save()
            })
            response.json("worked");
        }
        else {
            response.status(401).send('אחד התורים נתפס על ידי לקוח');
        }
    } catch {
        response.status(401).send('אופס, משהו השתבש אנא נסה שנית או פנה למנהל המערכת');
    }
})

adminAppointmentRouter.delete('/:id', async (request, response) => {
    const token = request.headers.authorization;
    jwt.verify(token, process.env.SECRET, async function (err, decoded) {
        if (err) {
            response.status(401).send('!נא התחבר מחדש למחיקת התור');
        }
        else {
            try {
                const id = request.params.id;
                const resp = await adminAppointment.findByIdAndDelete(id);
                response.json(resp);
            } catch {
                response.status(401).send('אופס, משהו השתבש אנא נסה שנית או פנה למנהל המערכת');
            }
        }
    });
})


module.exports = adminAppointmentRouter