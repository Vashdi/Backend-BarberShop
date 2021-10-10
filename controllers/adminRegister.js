const adminRegisterRouter = require('express').Router()
const bcrypt = require('bcrypt')
const Admin = require('../models/Admin')
const jwt = require('jsonwebtoken')

adminRegisterRouter.post('/', async (request, response) => {
    try {
        const body = request.body
        const saltRounds = 10
        const passwordHash = await bcrypt.hash(body.password, saltRounds)
        const admin = new Admin({
            firstName: body.firstName,
            lastName: body.lastName,
            phone: body.phone,
            passwordHash
        })
        const savedAdmin = await admin.save()
        const adminForToken = {
            phone: body.phone,
            id: savedAdmin._id,
        }
        const token = jwt.sign(
            adminForToken,
            process.env.SECRET
        )
        response
            .status(200)
            .send({ token, phone: body.phone, firstName: body.firstName, lastName: body.lastName })
    }
    catch {
        response.status(401).send('אופס, משהו השתבש אנא נסה שנית או פנה למנהל המערכת');
    }
})


module.exports = adminRegisterRouter
