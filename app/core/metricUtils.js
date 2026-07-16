import appContext from '../bootstrap';
import { useLocation } from 'react-router-dom';

export const trackMetric = (...args) => appContext.trackMetric(...args);
