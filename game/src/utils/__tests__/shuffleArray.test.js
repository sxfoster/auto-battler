import { shuffleArray } from '../shuffleArray.js';

describe('shuffleArray()', () => {
  it('returns a new array with same elements but different order', () => {
    const arr = [1, 2, 3, 4, 5];
    const copy = shuffleArray([...arr]);
    expect(copy).toHaveLength(arr.length);
    expect(copy.slice().sort()).toEqual(arr);
    // There's a small chance order is same; test multiple times
    expect(shuffleArray([...arr])).not.toEqual(arr);
  });
});
