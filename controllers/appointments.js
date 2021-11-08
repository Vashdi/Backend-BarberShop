const jwt = require('jsonwebtoken')
const appointmentRouter = require('express').Router();
const Appointment = require('../models/Appointment')
const adminAppointment = require('../models/AdminAppointment')
const User = require('../models/User');
const AdminAppointment = require('../models/AdminAppointment');
const nodemailer = require('nodemailer');
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
    process.env.CLIENTID,
    process.env.CLIENTSECRET,
    "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
    refresh_token: process.env.REFRESHTOKEN
});
const accessToken = oauth2Client.getAccessToken()

var transport = {
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
        type: 'OAuth2',
        user: process.env.USER,
        clientId: process.env.CLIENTID,
        clientSecret: process.env.CLIENTSECRET,
        refreshToken: process.env.REFRESHTOKEN,
        accessToken: accessToken,
    },
    tls: {
        rejectUnauthorized: false
    }
}

var transporter = nodemailer.createTransport(transport)

transporter.verify((error, success) => {
    if (error) {
        console.log(error);
    } else {
        console.log('Server is ready to take messages');
    }
});

const getTokenFrom = request => {
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        return authorization.substring(7)
    }
    return null
}

appointmentRouter.get('/', async (request, response) => {
    try {
        const appointments = await Appointment.find({}).populate('user', { firstname: 1, lastname: 1 });
        response.json(appointments);
    } catch {
        response.status(401).send('אופס, משהו השתבש אנא נסה שנית או פנה למנהל המערכת');
    }

})

appointmentRouter.get('/:year/:month/:day', async (request, response) => {
    try {
        const year = Number(request.params.year);
        const month = Number(request.params.month);
        const day = Number(request.params.day);
        const appointments = await Appointment.find({ year: year, month: month, day: day }).populate('user', { firstname: 1, lastname: 1, phone: 1 });
        response.json(appointments);
    } catch {
        response.status(401).send('אופס, משהו השתבש אנא נסה שנית או פנה למנהל המערכת');
    }
})

appointmentRouter.get('/day/:day', async (request, response) => {
    try {
        const day = Number(request.params.day);
        const appointments = await Appointment.find({ day: day }).populate('user', { firstname: 1, lastname: 1, phone: 1 });
        response.json(appointments);
    } catch {
        response.status(401).send('אופס, משהו השתבש אנא נסה שנית או פנה למנהל המערכת');
    }
})

appointmentRouter.delete('/:id', async (request, response) => {
    try {
        const token = getTokenFrom(request)
        const decodedToken = jwt.verify(token, process.env.SECRET, (err, data) => err ? response.status(401).send('!נא התחבר מחדש למחיקת התור') : data);
        if (!decodedToken) {
            return;
        }
        const id = request.params.id;
        const body = await Appointment.findByIdAndDelete(id);
        const user = await User.findById(body.user)
        response.json(body);

        const username = user.firstname + " " + user.lastname;
        var mail = {
            from: username,
            to: '123snirmish@gmail.com',
            subject: 'בוטל תור ❌',
            html: `<h3 dir='rtl'>${username}</h3>
                    <p dir='rtl'>מספר פלאפון: ${user.phone}</p>
                   <p dir='rtl'>תאריך ${body.day}/${body.month}/${body.year}</p>
                   <p dir='rtl'>שעה ${body.hour}</p>`
        }
        transporter.sendMail(mail, (err, data) => {
        })

    } catch {
        response.status(401).send('אופס, משהו השתבש אנא נסה שנית או פנה למנהל המערכת');
    }
})

appointmentRouter.post('/', async (request, response, next) => {
    const body = request.body
    try {
        const token = getTokenFrom(request)
        const decodedToken = jwt.verify(token, process.env.SECRET, (err, data) => err ? response.status(401).send('!נא התחבר מחדש לקביעת התור') : data);
        if (!decodedToken) {
            return;
        }
        const user = await User.findById(decodedToken.id)
        const isExistClient = await Appointment.find({ year: body.year, month: body.month, day: body.day, hour: body.hour });
        const isExistAppInThatDay = await Appointment.find({ user: user.id, year: body.year, month: body.month, day: body.day });
        if (isExistAppInThatDay.length !== 0)
            response.status(401).send('לא ניתן לקבוע תור נוסף לאותו היום')
        else {
            const isExistAdmin = await AdminAppointment.find({ year: body.year, month: body.month, day: body.day, hour: body.hour });
            if (isExistClient.length === 0 && isExistAdmin.length === 0) {
                const appointment = new Appointment({
                    year: body.year,
                    month: body.month,
                    day: body.day,
                    hour: body.hour,
                    user: user._id
                })
                const savedAppointment = await appointment.save()
                user.appointments = user.appointments.concat(savedAppointment._id)
                await user.save()

                const username = user.firstname + " " + user.lastname;
                var mail = {
                    from: username,
                    to: '123snirmish@gmail.com',
                    subject: 'נקבע תור חדש ✔️',
                    html: `<h3 dir='rtl'>${username}</h3>
                           <p dir='rtl'>מספר פלאפון: ${user.phone}</p>
                           <p dir='rtl'>תאריך ${body.day}/${body.month}/${body.year}</p>
                           <p dir='rtl'>שעה ${body.hour}</p>`
                }
                transporter.sendMail(mail, (err, data) => {
                })

                response.json(savedAppointment)


            }
            else {
                response.status(401).send('התור כבר אינו פנוי')
            }
        }
    }
    catch {
        response.status(401).send('אופס, משהו השתבש אנא נסה שנית או פנה למנהל המערכת');
    }
})

appointmentRouter.post('/admin', async (request, response) => {
    const body = request.body
    try {
        const token = getTokenFrom(request)
        const decodedToken = jwt.verify(token, process.env.SECRET, (err, data) => err ? response.status(401).send('!נא התחבר מחדש לקביעת התור') : data)
        if (!decodedToken) {
            return;
        }
        const admin = await Admin.findById(decodedToken.id)
        const appointment = new Appointment({
            year: body.year,
            month: body.month,
            day: body.day,
            hour: body.hour,
            user: admin._id
        })

        const savedAppointment = await appointment.save()
        user.appointments = user.appointments.concat(savedAppointment._id)
        await user.save()
        response.json(savedAppointment)
    }
    catch {
        response.status(401).send('אופס, משהו השתבש אנא נסה שנית או פנה למנהל המערכת');
    }
})


module.exports = appointmentRouter