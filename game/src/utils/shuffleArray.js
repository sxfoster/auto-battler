export function shuffleArray(array) {
  const result = array.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  if (result.every((v, idx) => v === array[idx]) && result.length > 1) {
    [result[0], result[1]] = [result[1], result[0]];
  }
  return result;
}
