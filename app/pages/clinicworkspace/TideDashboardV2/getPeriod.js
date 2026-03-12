const getPeriod = (lastData) => {
  switch(lastData) {
    case 1: return '1d';
    case 7: return '7d';
    case 14: return '14d';
    case 30: return '30d';
    default: return '';
  }
};

export default getPeriod;
