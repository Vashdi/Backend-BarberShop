const jwt = require("jsonwebtoken");
const appointmentRouter = require("express").Router();
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const AdminAppointment = require("../models/AdminAppointment");

const getTokenFrom = (request) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.substring(7);
  }
  return null;
};

appointmentRouter.get("/", async (request, response) => {
  try {
    const appointments = await Appointment.find({}).populate("user", {
      firstname: 1,
      lastname: 1,
    });
    response.json(appointments);
  } catch {
    response
      .status(401)
      .send("אופס, משהו השתבש אנא נסה שנית או פנה למנהל המערכת");
  }
});

appointmentRouter.get("/:year/:month/:day", async (request, response) => {
  try {
    const year = Number(request.params.year);
    const month = Number(request.params.month);
    const day = Number(request.params.day);
    const appointments = await Appointment.find({
      year: year,
      month: month,
      day: day,
    }).populate("user", { firstname: 1, lastname: 1, phone: 1 });
    response.json(appointments);
  } catch {
    response
      .status(401)
      .send("אופס, משהו השתבש אנא נסה שנית או פנה למנהל המערכת");
  }
});

appointmentRouter.get("/day/:day", async (request, response) => {
  try {
    const day = Number(request.params.day);
    const appointments = await Appointment.find({ day: day }).populate("user", {
      firstname: 1,
      lastname: 1,
      phone: 1,
    });
    response.json(appointments);
  } catch {
    response
      .status(401)
      .send("אופס, משהו השתבש אנא נסה שנית או פנה למנהל המערכת");
  }
});

appointmentRouter.delete("/:id", async (request, response) => {
  try {
    const token = getTokenFrom(request);
    const decodedToken = jwt.verify(token, process.env.SECRET, (err, data) =>
      err ? response.status(401).send("!נא התחבר מחדש למחיקת התור") : data
    );
    if (!decodedToken) {
      return;
    }
    const id = request.params.id;
    const body = await Appointment.findByIdAndDelete(id);
    const user = await User.findById(body.user);
    response.json(body);
  } catch {
    response
      .status(401)
      .send("אופס, משהו השתבש אנא נסה שנית או פנה למנהל המערכת");
  }
});

appointmentRouter.post("/", async (request, response, next) => {
  const body = request.body;
  try {
    const token = getTokenFrom(request);
    const decodedToken = jwt.verify(token, process.env.SECRET, (err, data) =>
      err ? response.status(401).send("!נא התחבר מחדש לקביעת התור") : data
    );
    if (!decodedToken) {
      return;
    }
    const user = await User.findById(decodedToken.id);
    const isExistClient = await Appointment.find({
      year: body.year,
      month: body.month,
      day: body.day,
      hour: body.hour,
    });
    const isExistAppInThatDay = await Appointment.find({
      user: user.id,
      year: body.year,
      month: body.month,
      day: body.day,
    });
    if (isExistAppInThatDay.length !== 0)
      response.status(401).send("לא ניתן לקבוע תור נוסף לאותו היום");
    else {
      const isExistAdmin = await AdminAppointment.find({
        year: body.year,
        month: body.month,
        day: body.day,
        hour: body.hour,
      });
      if (isExistClient.length === 0 && isExistAdmin.length === 0) {
        const appointment = new Appointment({
          year: body.year,
          month: body.month,
          day: body.day,
          hour: body.hour,
          user: user._id,
        });
        const savedAppointment = await appointment.save();
        user.appointments = user.appointments.concat(savedAppointment._id);
        await user.save();
        response.json(savedAppointment);
      } else {
        response.status(401).send("התור כבר אינו פנוי");
      }
    }
  } catch {
    response
      .status(401)
      .send("אופס, משהו השתבש אנא נסה שנית או פנה למנהל המערכת");
  }
});

appointmentRouter.post("/admin", async (request, response) => {
  const body = request.body;
  try {
    const token = getTokenFrom(request);
    const decodedToken = jwt.verify(token, process.env.SECRET, (err, data) =>
      err ? response.status(401).send("!נא התחבר מחדש לקביעת התור") : data
    );
    if (!decodedToken) {
      return;
    }
    const admin = await Admin.findById(decodedToken.id);
    const appointment = new Appointment({
      year: body.year,
      month: body.month,
      day: body.day,
      hour: body.hour,
      user: admin._id,
    });

    const savedAppointment = await appointment.save();
    user.appointments = user.appointments.concat(savedAppointment._id);
    await user.save();
    response.json(savedAppointment);
  } catch {
    response
      .status(401)
      .send("אופס, משהו השתבש אנא נסה שנית או פנה למנהל המערכת");
  }
});

module.exports = appointmentRouter;
