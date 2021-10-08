const registerRouter = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/User')
const jwt = require('jsonwebtoken')

registerRouter.post('/', async (request, response) => {
    try {
        const body = request.body
        var reg = new RegExp('^[0-9]+$');
        var reg2 = new RegExp('^[a-z\u0590-\u05fe]+$');
        const dbUser = await User.findOne({ phone: body.phone })
        if (dbUser) {
            response.status(401).send('מספר הפלאפון כבר קיים במערכת');
        }
        if (body.phone.length !== 10) {
            response.status(401).send('מספר הפלאפון חייב להיות באורך של 10 ספרות');
        }
        if (!reg2.test(body.firstname)) {
            response.status(401).send('שם פרטי חייב להיות מורכב מאותיות בלבד');
        }
        if (body.firstname.length < 2) {
            response.status(401).send('שם פרטי חייב להיות מורכב משתי אותיות לפחות');
        }
        if (body.lastname.length < 2) {
            response.status(401).send('שם משפחה חייב להיות מורכב משתי אותיות לפחות');
        }
        if (!reg2.test(body.lastname)) {
            response.status(401).send('שם משפחה חייב להיות מורכב מאותיות בלבד');
        }
        if (!reg.test(body.phone)) {
            response.status(401).send('מספר פלאפון חייב להיות מורכב מספרות בלבד');
        }
        if (body.password.length < 6 || body.password.length > 25) {
            response.status(401).send('סיסמה חייבת להיות באורך 6 ספרות לפחות או 25 ספרות לכל היותר');
        }
        const saltRounds = 10
        const passwordHash = await bcrypt.hash(body.password, saltRounds)
        const user = new User({
            firstname: body.firstname,
            lastname: body.lastname,
            phone: body.phone,
            passwordHash
        })
        const savedUser = await user.save()
        const userForToken = {
            phone: body.phone,
            id: savedUser._id,
        }
        const token = jwt.sign(
            userForToken,
            process.env.SECRET
        )
        response
            .status(200)
            .send({ token, phone: body.phone, firstname: body.firstname, lastname: body.lastname })
    } catch {
        response.status(401).send('אופס, משהו השתבש אנא נסה שנית או פנה למנהל המערכת');
    }
})


module.exports = registerRouter
