import React, { useState } from 'react';
import styled from 'styled-components';

const SidebarContainer = styled.div`
  position: fixed;
  top: 0;
  right: ${({ isOpen }) => (isOpen ? '-100%' : '0%')};
  width: 320px;
  height: 100vh;
  background-color: ${({ theme }) => theme.sidebarBgColor || '#fff'};
  box-shadow: -4px 0 8px rgba(0, 0, 0, 0.2);
  transition: right 0.3s ease-in-out;
  z-index: 1001;
  padding: 30px;
  overflow-y: auto;
`;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FormTitle = styled.h2`
  text-align: center;
  font-size: 2rem;
  color: ${(props) => props.theme.titleColor};
  margin-bottom: 25px;
`

const Input = styled.input`
  padding: 12px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.borderColor};
  background-color: ${({ theme }) => theme.inputBgColor};
  color: ${({ theme }) => theme.textColor};
`;

const ButtonContainer = styled.div`
  margin-top: 25px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`

const Button = styled.button`
  padding: 10px;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.buttonBgColor};
  color: ${({ theme }) => theme.buttonTextColor};
  border: none;
  cursor: pointer;
  &:hover {
    background-color: ${({ theme }) => theme.buttonHoverBgColor};
  }
`;

const NewContactSidebar = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      ownerId: '',
    });
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    };
  
    const handleSubmit = async (e) => {
        e.preventDefault();
      
        const userKey = localStorage.getItem('userKey');
      
        if (!userKey) {
          alert("UserKey isnt defined.");
          return;
        }
      
        try {
          const response = await fetch('https://api2.ploomes.com/Contacts', {
            method: 'POST',
            headers: {
              'User-Key': userKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
          });
      
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
      
          const data = await response.json();
          console.log('Contact created:', data);
          alert('Contact successfully created! :)');
          onClose(); 
        } catch (error) {
          console.error('Error creating contact:', error);
          alert('Error creating the contact');
        }
      };
      
      
  
    return (
      <SidebarContainer isOpen={isOpen}>
        <FormContainer onSubmit={handleSubmit}>
        <FormTitle>New Contact</FormTitle>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
          />
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="E-mail"
          />
          <Input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone Number"
          />
          <Input
            type="text"
            name="ownerId"
            value={formData.ownerId}
            onChange={handleChange}
            placeholder="Owner"
          />
          <ButtonContainer>
          <Button type="submit">Create Contact</Button>
          <Button type="button" onClick={onClose}>Cancel</Button>
          </ButtonContainer>
        </FormContainer>
      </SidebarContainer>
    );
  };
  
  export default NewContactSidebar;