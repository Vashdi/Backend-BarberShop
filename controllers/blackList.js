const blackListRouter = require('express').Router()
const BlackList = require('../models/BlackList')

blackListRouter.get('/', async (request, response) => {
    const blackListUsers = await BlackList.find({});
    response.json(blackListUsers)
})

blackListRouter.get('/:phone', async (request, response) => {
    const phone = request.params.phone;
    const blackListUser = await BlackList.find({ phone: phone });
    if (blackListUser) {
        response.json(blackListUser)
    } else {
        response.status(404).end()
    }
})

blackListRouter.post('/', async (request, response) => {
    const body = request.body;

    const newBlackListUser = new BlackList({
        firstname: body.firstname,
        lastname: body.lastname,
        phone: body.phone
    })

    await newBlackListUser.save()

    response
        .status(200)
        .send({ phone: body.phone, firstname: body.firstname, lastname: body.lastname })
})

blackListRouter.delete('/:phone', async (request, response) => {
    const token = request.headers.authorization;
    jwt.verify(token, process.env.SECRET, async function (err, decoded) {
        if (err) {
            response.status(401).send('!נא התחבר מחדש')
        }
        else {
            const phone = request.params.phone;
            const resp = await BlackList.findOneAndDelete({ phone: phone });
            response.json(resp);
        }
    });
})

module.exports = blackListRouter
