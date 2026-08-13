import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import 'leaflet/dist/leaflet.css';
import { TelegramProvider } from './hooks/useTelegram';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <TelegramProvider>
    <App/>
  </TelegramProvider>
);