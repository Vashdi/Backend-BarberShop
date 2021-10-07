const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/User')

loginRouter.post('/', async (request, response) => {
  const body = request.body

  const user = await User.findOne({ phone: body.phone })
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(body.password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid phone or password'
    })
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
})

module.exports = loginRouter
