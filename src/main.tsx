import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import MobileShoppingList from './pages/MobileShoppingList.tsx';
import './index.css';

const path = window.location.pathname;

if (path === '/mobile' || path === '/mobile/') {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <MobileShoppingList />
    </StrictMode>,
  );
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
