import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const IconContainer = styled.div`
  flex-shrink: 0;
  display: flex;
  justify-content: start;
`;

const PlooIco = styled.img`
  filter: ${({ theme }) => theme.isDarkMode ? 'none' : 'brightness(0) invert(1)'};
  width: 40px;
  padding: 0px 20px 0px 10px;
`;

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 30px 15px 25px 15px;
  background-color: ${({ theme }) => theme.headerBgColor};
  color: ${({ theme }) => theme.textColor};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  justify-content: space-between;
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 10px;
  justify-content: start;
  @media (max-width: 768px) {
    max-width: 100%;
    display: grid;
    justify-content: center;
  }
`;

const SearchInput = styled.input`
  padding: 6px 8px;
  border-radius: 4px;
  border: 0.5px solid ${({ theme }) => theme.borderColor};
  background-color: ${({ theme }) => theme.inputBgColor};
  color: ${({ theme }) => theme.textColor};
  font-size: 0.875rem;
  flex: 1;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: end;
  margin-right: 40px;
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const Button = styled.button`
  padding: 8px 12px;
  background-color: ${({ theme }) => theme.buttonBgColor};
  color: ${({ theme }) => theme.buttonTextColor};
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.buttonHoverBgColor};
  }

  @media (max-width: 768px) {
    flex: 1;
    max-width: 45%;
  }

  @media (max-width: 480px) {
    max-width: 100%;
  }
`;

const Header = ({ toggleDarkMode, setSearchFields, fetchContacts }) => {
  const [localSearchFields, setLocalSearchFields] = useState({
    Name: '',
    Email: '',
    Phone: '',
    OwnerId: '',
  });

  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setLocalSearchFields((prevFields) => ({
      ...prevFields,
      [name]: value,
    }));
  };

  const handleSearch = async () => {
    const userKey = localStorage.getItem('userKey');

    if (!userKey) {
      alert("UserKey isn't defined.");
      return;
    }

    const query = Object.entries(localSearchFields)
      .filter(([key, value]) => value)
      .map(([key, value]) => `contains(${key},'${encodeURIComponent(value)}')`)
      .join(' and ');

    const filterQueryString = query ? `?$filter=${query}` : '';

    console.log('Filter Query String:', filterQueryString);

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
      console.log('Data received:', data);

      setSearchFields(localSearchFields);
      fetchContacts();
    } catch (error) {
      console.error('Error fetching contacts:', error);
      alert('Error fetching contacts.');
    }
  };

  const handleClearUserKey = () => {
    localStorage.removeItem('userKey');
    navigate('/');
    alert('UserKey removed! :)');
  };

  const handleToggleDarkMode = () => {
    toggleDarkMode();
    const isDarkMode = localStorage.getItem('isDarkMode') === 'true';
    document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  };

  return (
    <HeaderContainer>
      <SearchContainer>
        <IconContainer>
          <PlooIco src="src/assets/ploomes_ico.svg" />
        </IconContainer>
        <SearchInput
          type="text"
          name="Name"
          value={localSearchFields.Name}
          onChange={handleSearchChange}
          placeholder="Name"
        />
        <SearchInput
          type="email"
          name="Email"
          value={localSearchFields.Email}
          onChange={handleSearchChange}
          placeholder="E-mail"
        />
        <SearchInput
          type="tel"
          name="Phone"
          value={localSearchFields.Phone}
          onChange={handleSearchChange}
          placeholder="Phone Number"
        />
        <SearchInput
          type="text"
          name="OwnerId"
          value={localSearchFields.OwnerId}
          onChange={handleSearchChange}
          placeholder="Owner"
        />
        <ButtonGroup>
          <Button onClick={handleSearch}>Search</Button>
          <Button onClick={handleToggleDarkMode}>
            {localStorage.getItem('isDarkMode') === 'true' ? 'Dark Theme' : 'Light Theme'}
          </Button>
          <Button onClick={handleClearUserKey}>Leave</Button>
        </ButtonGroup>
      </SearchContainer>
    </HeaderContainer>
  );
};

export default Header;