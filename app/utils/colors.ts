export const getRandomPastelColor = () => {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 45%, 90%)`;
};