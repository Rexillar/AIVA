const cron = require('node-cron');
const { runAgentTask } = require('./agentService');

const startScheduler = () => {
  // Morning reminder at 8 AM
  cron.schedule('0 8 * * *', () => {
    runAgentTask('morning_reminder');
  });

  // Evening reflection at 10 PM
  cron.schedule('0 22 * * *', () => {
    runAgentTask('evening_reflection');
  });

  console.log('Scheduler started: Morning and evening agent tasks scheduled.');
};

module.exports = { startScheduler };
