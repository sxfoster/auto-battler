const { isGM } = require('../util/auth');

test('returns true when member has GM role', () => {
  const interaction = {
    member: {
      roles: { cache: new Map([[1, { name: 'GM' }]]) }
    }
  };
  expect(isGM(interaction)).toBe(true);
});

test('returns false when missing role', () => {
  const interaction = {
    member: { roles: { cache: new Map([[1, { name: 'Player' }]]) } }
  };
  expect(isGM(interaction)).toBe(false);
});
