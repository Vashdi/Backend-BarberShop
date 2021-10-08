const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const adminRouter = require('express').Router()
const Admin = require('../models/Admin')

adminRouter.post('/', async (request, response) => {
    try {
        const body = request.body
        const admin = await Admin.findOne({ phone: body.phone })
        const passwordCorrect = admin === null ? false : await bcrypt.compare(body.password, admin.passwordHash)
        if (!(admin && passwordCorrect)) {
            response.status(401).send('מספר הפלאפון או הסיסמה לא נכונים');
        }
        const adminForToken = {
            phone: admin.phone,
            id: admin._id,
        }
        const token = jwt.sign(
            adminForToken,
            process.env.SECRET
        )
        response
            .status(200)
            .send({ token, phone: admin.phone })
    } catch {
        response.status(401).send('אופס, משהו השתבש אנא נסה שנית או פנה למנהל המערכת');
    }
})

module.exports = adminRouter
