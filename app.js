const express = require('express');
const app = express();
require('dotenv').config();

// parse json from body of a request
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// cors setting
const cors = require('cors');
const whitelist = require('./server/assets/whitelist.js');
const corsConfig = {
  origin(origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      // allow server to server or postman requests
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};
app.use(cors(corsConfig));

// connect to mongodb
require('./server/db/mongoose.js');

// check if API server is working
app.get('/', (req, res) => {
  res.send(`server starts at ${new Date()}`);
});

// routers
const PatientRouter = require('./server/routers/patient.js');
app.use('/patient', PatientRouter);
const EventRouter = require('./server/routers/event.js');
app.use('/event', EventRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, (err) => {
  if (err) console.log(err);
  console.log(`server starts at port ${PORT} at ${new Date()}`);
});
