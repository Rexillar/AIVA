const mongoose = require('mongoose');
const ExternalCalendarEvent = require('./models/externalCalendarEvent');

async function updateAllDay() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aiva');

    // Update events where allDay is not set, and startTime and endTime differ by 24 hours at midnight
    const result = await ExternalCalendarEvent.updateMany(
      {
        allDay: { $exists: false },
        startTime: { $exists: true },
        endTime: { $exists: true }
      },
      [
        {
          $set: {
            allDay: {
              $and: [
                { $eq: [{ $subtract: ['$endTime', '$startTime'] }, 24 * 60 * 60 * 1000] },
                { $eq: [{ $hour: '$startTime' }, 0] },
                { $eq: [{ $minute: '$startTime' }, 0] },
                { $eq: [{ $second: '$startTime' }, 0] },
                { $eq: [{ $hour: '$endTime' }, 0] },
                { $eq: [{ $minute: '$endTime' }, 0] },
                { $eq: [{ $second: '$endTime' }, 0] }
              ]
            }
          }
        }
      ]
    );

    console.log(`Updated ${result.modifiedCount} events`);
  } catch (error) {
    console.error('Error updating events:', error);
  } finally {
    await mongoose.disconnect();
  }
}

updateAllDay();