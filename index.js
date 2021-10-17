const mongoose = require('mongoose')
const express = require('express')
require('dotenv').config()
const app = express()
const cors = require('cors')
app.use(express.static('build'))
app.use(express.json())

app.use(cors())

const url = process.env.MONGODB_URI;

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })

const adminLoginRouter = require('./controllers/adminLogin')
const adminRegisterRouter = require('./controllers/adminRegister')
const adminAppointmentRouter = require('./controllers/adminAppointment')
const closedDaysRouter = require('./controllers/closedDays')
const blackListRouter = require('./controllers/blackList')
const usersRouter = require('./controllers/user')
const loginRouter = require('./controllers/login')
const registerRouter = require('./controllers/register')
const appointmentRouter = require('./controllers/appointments')
const strictRouter = require('./controllers/Strict')
const strictDayRouter = require('./controllers/StrictDay')

app.use('/adminLogin', adminLoginRouter)
app.use('/adminRegister', adminRegisterRouter)
app.use('/adminAppointment', adminAppointmentRouter)
app.use('/blackList', blackListRouter)
app.use('/closedDays', closedDaysRouter)
app.use('/users', usersRouter)
app.use('/login', loginRouter)
app.use('/register', registerRouter)
app.use('/appointments', appointmentRouter)
app.use('/strict', strictRouter)
app.use('/strictDay', strictDayRouter)

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({
      error: 'invalid token!!!'
    })
  }
  else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({
      error: 'token expired'
    })
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT)
