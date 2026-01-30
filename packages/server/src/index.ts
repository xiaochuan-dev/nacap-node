import { hydrateRoot } from 'react-dom/client';
import appElem from './App';
import './index.css';
import '@arco-design/web-react/dist/css/arco.css';

hydrateRoot(document.querySelector('#app'), appElem);