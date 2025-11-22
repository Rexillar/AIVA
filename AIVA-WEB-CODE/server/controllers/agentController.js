const axios = require('axios');
const { executeAction } = require('../utils/executeAction'); // Assuming this exists for action execution

const executeAgentActions = async (actions, workspaceId, dispatch) => {
  for (const action of actions) {
    try {
      if (action.method === 'GET') {
        await axios.get(`${process.env.BASE_URL}${action.endpoint}`, { headers: { Authorization: `Bearer ${process.env.JWT_TOKEN}` } });
      } else if (action.method === 'POST') {
        await axios.post(`${process.env.BASE_URL}${action.endpoint}`, action.body, { headers: { Authorization: `Bearer ${process.env.JWT_TOKEN}` } });
      } // Add other methods as needed
      console.log(`Executed action: ${action.method} ${action.endpoint}`);
    } catch (error) {
      console.error(`Failed to execute action: ${error.message}`);
    }
  }
};

module.exports = { executeAgentActions };
