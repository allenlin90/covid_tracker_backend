const express = require('express');
const Patient = require('../models/patient');
const router = new express.Router();

// _id in mongodb must be 24 chars
// GET all patients
router.get('/', async (req, res) => {
  let resCode = 200;
  const response = {
    status: resCode,
    message: 'success',
    data: null,
  };

  try {
    const patients = await Patient.find();
    response.data = { patients };
  } catch (error) {
    console.log(error.message);
    resCode = 500;
    response.status = resCode;
  }

  res.status(resCode).json(response);
});

// GET request to get data of a patient
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

    const patient = await Patient.findById(id);

    if (!patient) {
      resCode = 404;
      throw new Error('no patient is found');
    }

    response.data = { patient };
  } catch (error) {
    console.log(error);
    if (!/4.+/g.test(resCode)) {
      resCode = 500;
    }
    response.message = error.message;
  }

  res.status(resCode).json(response);
});

// POST request to create a new patient
router.post('/', async (req, res) => {
  let resCode = 200;
  const response = {
    status: resCode,
    message: 'success',
    data: null,
  };

  try {
    const limit = 8;
    const patients = await Patient.find();
    if (patients.length >= limit) {
      resCode = 400;
      throw new Error(`number of patients should be less than ${limit}`);
    }

    const patient = new Patient(req.body);
    await patient.save();
    resCode = 201;
    response.status = resCode;
    response.data = { patient };
  } catch (error) {
    resCode = 400;
    response.status = resCode;
    response.message = error.message;
  }

  res.status(resCode).json(response);
});

// PATCH request to modify info of a patient
router.patch('/:id', async (req, res) => {
  let resCode = 200;
  const response = {
    status: resCode,
    message: 'success',
    data: null,
  };
  const validFields = ['gender', 'age', 'occupation'];

  try {
    // check if id is given
    const { id } = req.params;
    if (!id || id.length < 24) {
      resCode = 400;
      throw new Error('id is invalid');
    }

    // check if the patient ID exists and has data
    const patient = await Patient.findOne({ _id: id });
    if (!patient) {
      resCode = 404;
      throw new Error(`patient on id ${id} doesn't exist`);
    }
    const patient_org = { ...patient._doc };

    // check if properties to update are valid
    const keys = Object.keys(req.body);
    const isDataAllValid = keys.every((key) => validFields.includes(key));
    if (!isDataAllValid) {
      resCode = 400;
      throw new Error('input data is invalid');
    }

    // check if age is valid
    if (keys.includes('age')) {
      let { age } = req.body;
      // cover floating points with 0
      // e.g. age is 24.0
      age = parseFloat(age);
      if (age < 0 || !Number.isInteger(age)) {
        console.log(age);
        throw new Error('invalid age');
      }
    }

    keys.forEach((key) => (patient[key] = req.body[key]));
    await patient.save();
    response.data = {
      origin: patient_org,
      updated: patient,
      request: req.body,
    };
  } catch (error) {
    console.log(error);
    if (!/^4.+/g.test(resCode)) {
      resCode = 500;
    }
    response.message = error.message;
  }

  response.status = resCode;
  res.status(resCode).json(response);
});

// DELETE request to remove a patient
router.delete('/:id', async (req, res) => {
  let resCode = 200;
  const response = {
    status: resCode,
    message: 'success',
    data: null,
  };

  try {
    // check id from body
    const { id } = req.params;
    if (!id || id.length < 24) {
      resCode = 400;
      throw new Error('id is invalid');
    }

    const patient = await Patient.findOne({ _id: id });
    if (!patient) {
      resCode = 404;
      throw new Error('no patient is found');
    }

    await patient.remove();
    response.data = { removed: patient };
  } catch (error) {
    console.log(error);
    if (!/^4.+/g.test(resCode)) {
      resCode = 500;
    }
    response.message = error.message;
  }

  response.status = resCode;
  res.status(resCode).json(response);
});

module.exports = router;
