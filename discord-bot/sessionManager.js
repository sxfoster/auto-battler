const crypto = require('crypto');

const sessions = new Map();

function createSession(userId, data = {}) {
  const id = crypto.randomUUID();
  const session = Object.assign(
    {
      id,
      userId,
      step: 'choose-hero',
      choices: {},
      messageId: null,
    },
    data,
  );
  sessions.set(id, session);
  return session;
}

function getSession(id) {
  return sessions.get(id);
}

function deleteSession(id) {
  sessions.delete(id);
}

module.exports = {
  createSession,
  getSession,
  deleteSession,
};
