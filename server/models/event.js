const mongoose = require('mongoose');
const validator = require('validator');

const dateValidator = (value) => {
  // covid starts from year 2020
  const year2020 = new Date(2020, 0, 1).getTime();
  const date = new Date(value).getTime();
  const isDate = validator.isDate(value, { delimiters: ['-', '/'] });
  if (date < year2020 || !isDate) {
    throw new Error('invalid date and time');
  }
};

const eventSchema = new mongoose.Schema(
  {
    timeFrom: {
      type: Date,
      required: true,
      validate: dateValidator,
    },
    timeTo: {
      type: Date,
      required: true,
      validate(value) {
        dateValidator(value);
        const timeFrom = new Date(this.timeFrom).getTime();
        const timeTo = new Date(value).getTime();
        if (timeTo < timeFrom) {
          throw new Error('timeTo should be greater than or equal to timeFrom');
        }
      },
    },
    detail: {
      type: String,
      required: true,
      trim: true,
    },
    locationType: {
      type: String,
      enum: ['indoor', 'outdoor', 'home', 'travelling'],
      required: true,
      lowercase: true,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
      required() {
        return (
          this.locationType === 'indoor' || this.locationType === 'outdoor'
        );
      },
    },
    patient_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Patient',
    },
  },
  {
    timestamps: true,
  },
);

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
