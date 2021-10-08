const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/User')
const jwt = require('jsonwebtoken')

usersRouter.get('/', async (request, response) => {
    try {
        const users = await User.find({}).populate('appointments', { year: 1, month: 1, day: 1, hour: 1 });
        response.json(users)
    } catch {
        response.status(401).send('אופס, משהו השתבש אנא נסה שנית או פנה למנהל המערכת');
    }
})

usersRouter.get('/:phone', async (request, response) => {
    try {
        const phone = request.params.phone;
        const user = await User.find({ phone: phone }).populate('appointments', { year: 1, month: 1, day: 1, hour: 1 });;
        if (user) {
            response.json(user)
        } else {
            response.status(401).send('לא נמצא משתמש בעל מספר פלאפון זה');
        }
    } catch {
        response.status(401).send('אופס, משהו השתבש אנא נסה שנית או פנה למנהל המערכת');
    }
})

usersRouter.delete('/:id', async (request, response) => {
    const token = request.headers.authorization;
    jwt.verify(token, process.env.SECRET, async function (err, decoded) {
        if (err) {
            response.status(401).send('!נא התחבר מחדש למחיקת המשתמש')
        }
        else {
            try {
                const id = request.params.id;
                const resp = await User.findByIdAndDelete(id);
                response.json(resp);
            } catch {
                response.status(401).send('אופס, משהו השתבש אנא נסה שנית או פנה למנהל המערכת');
            }
        }
    });
})

usersRouter.post('/', async (request, response) => {
    try {
        const token = getTokenFrom(request)
        const decodedToken = jwt.verify(token, process.env.SECRET, (err) => err ? response.status(401).send('!נא התחבר מחדש להוספת המשתמש') : null);
        const body = request.body
        const user = new User({
            firstname: body.firstname,
            lastname: body.lastname,
            phone: body.phone,
            password: body.password
        })
        const savedUser = await user.save()
        response
            .status(200)
            .send({ phone: body.phone, firstname: body.firstname, lastname: body.lastname })
    }
    catch (exception) {
        response.status(401).send('אופס, משהו השתבש אנא נסה שנית או פנה למנהל המערכת');
    }
})


module.exports = usersRouter