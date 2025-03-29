export function computeRollingAverages(values, windowSize) {
  if (!Array.isArray(values) || values.length === 0) return [];
  const result = [];
  let sum = 0;
  const queue = [];

  for (let i = 0; i < values.length; i++) {
    queue.push(values[i]);
    sum += values[i];

    if (queue.length > windowSize) {
      sum -= queue.shift();
    }

    // For indices < windowSize, partial average
    const avg = sum / queue.length;
    result.push(avg);
  }
  return result;
}
