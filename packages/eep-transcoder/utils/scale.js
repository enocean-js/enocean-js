export function scale(value, fromRange, toRange) {
  return (
    ((value - fromRange[0]) * (toRange[1] - toRange[0])) /
      (fromRange[1] - fromRange[0]) +
    toRange[0]
  );
}
