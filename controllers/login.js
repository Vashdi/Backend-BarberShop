const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/User')

loginRouter.post('/', async (request, response) => {
    try {
        const body = request.body
        const user = await User.findOne({ phone: body.phone })
        const firstNameCorrect = user === null ? false : body.firstname === user.firstname;
        if (!(user && firstNameCorrect)) {
            response.status(401).send('מספר הפלאפון או השם פרטי לא נכונים');
            return;
        }
        const userForToken = {
            phone: user.phone,
            id: user._id,
        }
        const token = jwt.sign(
            userForToken,
            process.env.SECRET
        )
        response
            .status(200)
            .send({ token, phone: user.phone, firstname: user.firstname, lastname: user.lastname })
    } catch {
        response.status(401).send('אופס, משהו השתבש אנא נסה שנית או פנה למנהל המערכת');
    }
})

module.exports = loginRouter
