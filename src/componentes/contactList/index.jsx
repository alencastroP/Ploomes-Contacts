import styled from 'styled-components';
import React, { useState, useCallback } from 'react';
import Header from '../header';
import Contact from '../contact';
import NewContactButton from '../newContactButton';
import NewContactSidebar from '../newContactSidebar';


const ListContainer = styled.div`
  padding: 20px;
  background-color: ${({ theme }) => theme.backgroundColor};
  color: ${({ theme }) => theme.textColor};
  transition: background-color 0.3s ease, color 0.3s ease;
`;

function ContactList({ toggleDarkMode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchFields, setSearchFields] = useState({
    Name: '',
    Email: '',
    Phone: '',
    OwnerId: '',
  });
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContacts = useCallback(async () => {
    const userKey = localStorage.getItem('userKey');
    if (!userKey) {
      setError('UserKey not found.');
      setLoading(false);
      return;
    }

    const query = Object.entries(searchFields)
      .filter(([key, value]) => value)
      .map(([key, value]) => `contains(${key},'${encodeURIComponent(value)}')`)
      .join(' and ');

    const filterQueryString = query ? `?$filter=${query}` : '';

    try {
      const response = await fetch(`https://api2.ploomes.com/Contacts${filterQueryString}`, {
        method: 'GET',
        headers: {
          'User-Key': userKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setContacts(data.value || []);
    } catch (error) {
      console.error('Error searching clients.', error);
      setError('Error searching clients.');
    } finally {
      setLoading(false);
    }
  }, [searchFields]);

  const handleNewContactClick = () => {
    setIsSidebarOpen(true);
  };

  const handleSubmit = (formData) => {
    console.log('Form data:', formData);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      <Header 
              toggleDarkMode={toggleDarkMode}
              setSearchFields={setSearchFields}
              fetchContacts={fetchContacts}
      />
      <ListContainer>
        <Contact contacts={contacts} loading={loading} error={error} />
      </ListContainer>
      <NewContactButton onClick={handleNewContactClick}>+</NewContactButton>
      {isSidebarOpen && <NewContactSidebar 
        onClose={handleCloseSidebar}
        onSubmit={handleSubmit}
      />}
    </>
  );
}

export default ContactList;