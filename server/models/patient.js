const mongoose = require('mongoose');
const Event = require('./event');

const patientSchema = new mongoose.Schema(
  {
    gender: {
      type: String,
      lowercase: true,
      required: true,
      trim: true,
      validate(value) {
        const gender = ['male', 'female'];
        if (!gender.includes(value.toLowerCase().trim())) {
          throw new Error(`The gender type ${value} is not supported`);
        }
      },
    },
    age: {
      type: Number,
      requried: true,
      validate(value) {
        if (value < 0) {
          throw new Error('Age must be or greater than 0');
        }
      },
    },
    occupation: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  },
);

// virtual property set up for mongoose to learn the relationship between collections
patientSchema.virtual('event', {
  ref: 'Event',
  localField: '_id',
  foreignField: 'patient',
});

// delete patient events when the patient is removed
patientSchema.pre('remove', async function (next) {
  const patient = this;
  // delete multiple events by using only the patient
  await Event.deleteMany({ patient_id: patient._id });
  next();
});

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
