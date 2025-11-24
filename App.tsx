
import React from 'react';
import { AppProvider } from './contexts/AppContext';
import { RootLayout } from './components/RootLayout';
import './index.css';

const App: React.FC = () => {
  return (
    <AppProvider>
      <RootLayout />
    </AppProvider>
  );
};

export default App;
