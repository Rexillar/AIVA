let agentMemory = {
  recentIntents: [],
  lastActions: []
};

const addToMemory = (intent, actions) => {
  agentMemory.recentIntents.push(intent);
  agentMemory.lastActions.push(actions);
  if (agentMemory.recentIntents.length > 10) agentMemory.recentIntents.shift(); // Keep last 10
};

const getMemory = () => agentMemory;

module.exports = { addToMemory, getMemory };
