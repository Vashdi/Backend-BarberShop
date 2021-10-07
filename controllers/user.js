const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/User')
const jwt = require('jsonwebtoken')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('appointments', { year: 1, month: 1, day: 1, hour: 1 });
  response.json(users)
})

usersRouter.get('/:phone', async (request, response) => {
  const phone = request.params.phone;
  const user = await User.find({ phone: phone }).populate('appointments', { year: 1, month: 1, day: 1, hour: 1 });;
  if (user) {
    response.json(user)
  } else {
    response.status(404).end()
  }
})

usersRouter.delete('/:id', async (request, response) => {
  const token = request.headers.authorization;
  jwt.verify(token, process.env.SECRET, async function (err, decoded) {
    if (err) {
      response.status(401).send('!נא התחבר מחדש')
    }
    else {
      const id = request.params.id;
      const resp = await User.findByIdAndDelete(id);
      response.json(resp);
    }
  });
})


module.exports = usersRouter