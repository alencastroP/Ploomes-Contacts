import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const IconContainer = styled.div`
  flex-shrink: 0;
  display: flex;
  justify-content: start;
`;

const PlooIco = styled.img`
  width: 40px;
  padding: 5px 20px 5px 10px;
`;

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 5%;
  padding: 30px 15px 25px 15px;
  background-color: ${({ theme }) => theme.headerBgColor};
  color: ${({ theme }) => theme.textColor};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  justify-content: space-between;
  @media (max-width: 1177px) {
    height: 4%;
  }
  @media (max-width: 768px) {
    height: 10%; 
    max-width: 100%;
    display: grid;
    justify-content: center;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 10px;
  justify-content: start;
  @media (max-width: 1177px) {
    height: 100%;
  }
`;

const SearchInputStyled = styled.input`
  padding: 6px 8px;
  border-radius: 4px;
  border: 0.5px solid ${({ theme }) => theme.borderColor};
  background-color: ${({ theme }) => theme.inputBgColor};
  color: ${({ theme }) => theme.textColor};
  font-size: 0.875rem;
  flex: 1;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
  box-sizing: border-box;
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const DropdownContainer = styled.div`
  position: relative;
  flex: 1;
  display: flex;
`;

const DropdownList = styled.ul`
  position: absolute;
  border-radius: 4px;
  border: 0.5px solid ${({ theme }) => theme.borderColor};
  background-color: ${({ theme }) => theme.inputBgColor};
  max-height: 200px;
  overflow-y: auto;
  width: 95%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  list-style: none;
  padding: 4px 8px;
  margin: 0;
  top: 35px;
  z-index: 1000;
  overflow: hidden;
`;

const DropdownItem = styled.li`
  padding: 6px 8px;
  margin-top: 2px;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.hoverBgColor};
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
    Owner: '',
  });

  const [themeButtonLabel, setThemeButtonLabel] = useState('Light Theme');
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('isDarkMode') === 'true');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownData, setDropdownData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const isDarkMode = localStorage.getItem('isDarkMode') === 'true';
    setThemeButtonLabel(isDarkMode ? 'Light Theme' : 'Dark Theme');
  }, [isDarkMode]);

  const fetchDropdownData = async () => {
    try {
      const userKey = localStorage.getItem('userKey');
      const response = await fetch('https://api2.ploomes.com/Users', {
        method: 'GET',
        headers: {
          'User-Key': userKey,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data && data.value) {
        setDropdownData(data.value);
        setFilteredData(data.value);
      } else {
        setDropdownData([]);
        setFilteredData([]);
      }
    } catch (error) {
      console.error('Erro ao buscar dados da API', error);
    }
    console.log(response)
  };

  const handleInputClick = (e) => {
    if (e.target.name === 'Owner') {
      setIsDropdownOpen(true);
      fetchDropdownData();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalSearchFields((prevFields) => ({
      ...prevFields,
      [name]: value,
    }));
    if (name === 'Owner') {
      const filtered = dropdownData.filter(item =>
        item.Name?.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredData(filtered);
    }
  };

  const handleItemClick = (item) => {
    setLocalSearchFields((prevFields) => ({
      ...prevFields,
      Owner: item.Name,
    }));
    setIsDropdownOpen(false);
  };

  const handleSearch = () => {
    setSearchFields(localSearchFields);
    fetchContacts();
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  const handleThemeToggle = () => {
    toggleDarkMode();
    const isDarkMode = localStorage.getItem('isDarkMode') === 'true';
    setThemeButtonLabel(isDarkMode ? 'Dark Theme' : 'Light Theme');
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  return (
    <HeaderContainer>
      <SearchContainer>
        <IconContainer>
        <PlooIco
            src={
              isDarkMode
                ? 'src/assets/white_ploomes_ico.png'
                : 'src/assets/ploomes_ico.png'
            }
            alt="Logo"
          />
        </IconContainer>
        <SearchInputStyled
          type="text"
          name="Name"
          value={localSearchFields.Name}
          onChange={handleInputChange}
          placeholder="Name"
        />
        <SearchInputStyled
          type="email"
          name="Email"
          value={localSearchFields.Email}
          onChange={handleInputChange}
          placeholder="E-mail"
        />
        <SearchInputStyled
          type="tel"
          name="Phone"
          value={localSearchFields.Phone}
          onChange={handleInputChange}
          placeholder="Phone Number"
        />
        <DropdownContainer ref={dropdownRef}>
          <SearchInputStyled
            type="text"
            name="Owner"
            value={localSearchFields.Owner}
            onChange={handleInputChange}
            onClick={handleInputClick}
            placeholder="Owner"
          />
          {isDropdownOpen && (
            <DropdownList>
              {filteredData.map((item, index) => (
                <DropdownItem key={index} onClick={() => handleItemClick(item)}>
                  {item.Name || 'Sem nome'}
                </DropdownItem>
              ))}
            </DropdownList>
          )}
        </DropdownContainer>
        <ButtonGroup>
          <Button onClick={handleSearch}>Search</Button>
          <Button onClick={handleThemeToggle}>{themeButtonLabel}</Button>
          <Button onClick={() => {
            localStorage.removeItem('userKey');
            navigate('/');
            alert('UserKey removed!');
          }}>Leave</Button>
        </ButtonGroup>
      </SearchContainer>
    </HeaderContainer>
  );
};

export default Header;
