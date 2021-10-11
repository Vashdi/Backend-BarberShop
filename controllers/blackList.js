const blackListRouter = require('express').Router()
const BlackList = require('../models/BlackList')
const jwt = require('jsonwebtoken')

blackListRouter.get('/', async (request, response) => {
    try {
        const blackListUsers = await BlackList.find({});
        response.json(blackListUsers);
    } catch {
        response.status(401).send('אופס, משהו השתבש אנא נסה שנית או פנה למנהל המערכת');
    }

})

blackListRouter.get('/:phone', async (request, response) => {
    try {
        const phone = request.params.phone;
        const blackListUser = await BlackList.find({ phone: phone });
        if (blackListUser) {
            response.json(blackListUser)
        } else {
            response.status(401).send('לא נמצא משתמש בעל מספר פלאפון זה');
        }
    } catch {
        response.status(401).send('אופס, משהו השתבש אנא נסה שנית או פנה למנהל המערכת');
    }
})

blackListRouter.post('/', async (request, response) => {
    try {
        const token = request.headers.authorization;
        const decodedToken = jwt.verify(token, process.env.SECRET, (err) => err ? response.status(401).send('!נא התחבר מחדש לחסימת המשתמש') : null);
        const body = request.body;
        const newBlackListUser = new BlackList({
            firstname: body.firstname,
            lastname: body.lastname,
            phone: body.phone,
        })
        await newBlackListUser.save()
        response
            .status(200)
            .send({ phone: body.phone, firstname: body.firstname, lastname: body.lastname })
    } catch {
        response.status(401).send('אופס, משהו השתבש אנא נסה שנית או פנה למנהל המערכת');
    }

})

blackListRouter.delete('/:phone', async (request, response) => {
    const token = request.headers.authorization;
    jwt.verify(token, process.env.SECRET, async function (err, decoded) {
        if (err) {
            response.status(401).send('!נא התחבר מחדש לביטול חסימת המשתמש')
        }
        else {
            try {
                const phone = request.params.phone;
                const resp = await BlackList.findOneAndDelete({ phone: phone });
                response.json(resp);
            } catch {
                response.status(401).send('אופס, משהו השתבש אנא נסה שנית או פנה למנהל המערכת');
            }
        }
    });
})

module.exports = blackListRouter
