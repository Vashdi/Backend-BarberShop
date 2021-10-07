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

        if (dbUser)
            return response.status(401).json({
                error: 'user phone already exist'
            })
        if (body.phone.length != 10)
            return response.status(401).json({
                error: 'phone length not 10'
            })
        if (!reg2.test(body.firstname))
            return response.status(401).json({
                error: 'first name should contain only letters'
            })
        if (body.firstname.length < 2)
            return response.status(401).json({
                error: 'first name should contain more than 1 letter'
            })
        if (body.lastname.length < 2)
            return response.status(401).json({
                error: 'last name should contain more than 1 letter'
            })

        if (!reg2.test(body.lastname))
            return response.status(401).json({
                error: 'last name should contain only letters'
            })
        if (!reg.test(body.phone))
            return response.status(401).json({
                error: 'phone should contain only numbers'
            })
        if (body.password.length < 6 || body.password.length > 25)
            return response.status(401).json({
                error: 'password length not right'
            })

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
    }
    catch (exception) {
        console.log(exception);
    }
})


module.exports = registerRouter
