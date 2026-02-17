export const loadTiming = async (reciterId: number) => {
  if (reciterId === 1) {
    return require('../../assets/ayah_timing/read_1.json');
  }
  return null;
};
