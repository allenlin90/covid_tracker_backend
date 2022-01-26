const express = require('express');
const Event = require('../models/event');
const router = new express.Router();

// _id in mongodb must be 24 chars
// GET request to get all tasks
router.get('/', async (req, res) => {
  let resCode = 200;
  const response = {
    status: resCode,
    message: 'success',
    data: null,
  };

  try {
    const events = await Event.find();
    response.data = { events };
  } catch (error) {
    console.log(error);
    resCode = 400;
    response.message = error.message;
  }

  response.status = resCode;

  res.status(resCode).json(response);
});

// GET request to get a specific task
// id can be patient id that returns all events of the patient
// id can be task id to return the specific task
// the default check with query string is to query task ID (not patient)
router.get('/:id', async (req, res) => {
  let resCode = 200;
  const response = {
    status: resCode,
    message: 'success',
    data: null,
  };

  try {
    const { id } = req.params;
    if (!id || id.length < 24) {
      resCode = 400;
      throw new Error('id is invalid');
    }

    // check if there query string
    const query = {};
    const { type } = req.query;
    if (type === 'patient') {
      query.patient_id = id;
    } else {
      query._id = id;
    }

    const event = await Event.find(query);

    if (!event) {
      resCode = 404;
      throw new Error('no event is found');
    }

    response.data = { event };
  } catch (error) {
    console.log(error);
    if (!/4.+/g.test(resCode)) {
      resCode = 500;
    }
    response.message = error.message;
  }

  response.status = resCode;

  res.status(resCode).json(response);
});

// POST request to create a new event
router.post('/', async (req, res) => {
  let resCode = 200;
  const response = {
    status: resCode,
    message: 'success',
    data: null,
  };

  const { patient_id } = req.body;
  const storedEvents = await Event.find({ where: { patient_id } });
  const timeRanges = storedEvents.map((event) => {
    const { timeFrom, timeTo } = event;
    const timeFromObj = new Date(timeFrom).getTime();
    const timeToObj = new Date(timeTo).getTime();
    return { to: timeToObj, from: timeFromObj };
  });

  try {
    // check if time is not in any range
    const { timeTo, timeFrom } = req.body;
    const timeToNum = new Date(timeTo).getTime();
    const timeFromNum = new Date(timeFrom).getTime();

    const isTimeToValid = timeRanges.some(({ to, from }) => {
      return timeToNum > from && timeToNum < to;
    });
    const isTimeFromValid = timeRanges.some(({ to, from }) => {
      return timeFromNum > from && timeFromNum < to;
    });

    if (isTimeToValid || isTimeFromValid) {
      response.status = 400;
      throw new Error('invalid to or from time');
    }

    // save to database
    const event = new Event(req.body);
    await event.save();
    resCode = 201;
    response.data = { event };
  } catch (error) {
    console.log(error);
    resCode = 400;
    response.message = error.message;
  }

  response.status = resCode;

  res.status(resCode).json(response);
});

// PATCH request to modify data of a specific task
router.patch('/:id', async (req, res) => {
  let resCode = 200;
  const response = {
    status: resCode,
    message: 'success',
    data: null,
  };
  const validFields = [
    'timeFrom',
    'timeTo',
    'locationType',
    'location',
    'detail',
    'patient_id',
  ];

  try {
    // check if id is given
    const { id } = req.params;
    if (!id || id.length < 24) {
      resCode = 400;
      throw new Error('id is invalid');
    }

    // check if the event ID exists and has data
    const event = await Event.findOne({ _id: id });
    if (!event) {
      resCode = 404;
      throw new Error(`event on id ${id} doesn't exist`);
    }
    const event_org = { ...event._doc };

    // check if properties to update are valid
    const keys = Object.keys(req.body);
    const isDataAllValid = keys.every((key) => validFields.includes(key));
    if (!isDataAllValid) {
      resCode = 400;
      throw new Error('input data is invalid');
    }

    keys.forEach((key) => (event[key] = req.body[key]));
    await event.save();
    response.data = {
      origin: event_org,
      updated: event,
      request: req.body,
    };
  } catch (error) {
    console.log(error);
    resCode = 400;
    response.message = error.message;
  }

  response.status = resCode;

  res.status(resCode).json(response);
});

// Delete request to remove a specific task
router.delete('/:id', async (req, res) => {
  let resCode = 200;
  const response = {
    status: resCode,
    message: 'success',
    data: null,
  };

  try {
    const { id } = req.params;
    const event = await Event.findByIdAndRemove(id);

    if (!event) {
      resCode = 404;
      throw new Error('no task is found');
    }

    response.data = { event };
  } catch (error) {
    console.log(error);
    if (!/4.+/g.test(resCode)) {
      resCode = 500;
    }
    response.message = error.message;
  }

  response.status = resCode;

  res.status(resCode).json(response);
});

module.exports = router;
