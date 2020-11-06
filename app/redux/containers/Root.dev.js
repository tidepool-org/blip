import { hot, setConfig } from 'react-hot-loader';
import Root from '../containers/Root.prod';

setConfig({ logLevel: 'warning' });

export default hot(module)(Root);
