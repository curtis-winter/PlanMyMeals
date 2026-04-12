import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import MobileShoppingList from './pages/MobileShoppingList.tsx';
import MobilePantry from './pages/MobilePantry.tsx';
import './index.css';

const darkMode = localStorage.getItem('darkMode') === 'true' || 
                 window.matchMedia('(prefers-color-scheme: dark)').matches;
if (darkMode) {
  document.documentElement.classList.add('dark');
}

const path = window.location.pathname;

if (path === '/mobile' || path === '/mobile/') {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <MobileShoppingList />
    </StrictMode>,
  );
} else if (path === '/pantry' || path === '/pantry/') {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <MobilePantry />
    </StrictMode>,
  );
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
