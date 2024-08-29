import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UKForm from './componentes/forms/index.jsx';
import ContactList from './componentes/contactList/index.jsx';
import { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from './componentes/themes';

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedPreference = localStorage.getItem('isDarkMode');
    return savedPreference === 'true';
  });

  useEffect(() => {
    localStorage.setItem('isDarkMode', isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <Router>
        <Routes>
          <Route path="/" element={<UKForm />} />
          <Route path="/contact-list" element={<ContactList toggleDarkMode={toggleDarkMode} />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;