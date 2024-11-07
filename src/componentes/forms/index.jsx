import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const FormContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  height: 100vh;
  background-color: #242424;
`;

const FormWrapper = styled.form`
  background-color: #1f1f1f;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.2);
  width: 300px;
  height: 330px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin-left: 150px;
`;

const PlooIco = styled.img`
  width: 230px;
  margin-bottom: -18px;
  margin-right: 1px;
`

const FormTitle = styled.h2`
  margin-bottom: 100px;
  margin-left: 28px;
  justify-content: center;
  font-size: 2.5rem;
  color: #ffffff;
`;

const Input = styled.input`
  width: 92.5%;
  padding: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  border: 0.5px solid #3a3a3a;
  background-color: ${({ theme }) => theme.inputBgColor};
  margin-bottom: 100px;
`;

const SubmitButton = styled.button`
  padding: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.25);
  background-color: #9353e6;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  &:hover {
    background-color: #7506be;
  }
`;

const FormFooter = styled.footer`
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.1);
  opacity: 20%;
  width: 100%;
  position: fixed;
  bottom: 0;
  left: 0;
  background-color: #3a3a3a;
  color: #fff;
  padding: 0.7rem;
  text-align: center;
  font-size: 0.9rem;
`;

const UKForm = () => {
  const [userKey, setUserKey] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedKey = localStorage.getItem('userKey');
    if (savedKey) {
      navigate('/contact-list', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!userKey) {
      setError('Please, insert a user-key.');
      return;
    }

    localStorage.setItem('userKey', userKey);
    navigate('/contact-list'); 
  };

  return (
    <>
      <FormContainer>
        <FormWrapper onSubmit={handleSubmit}>
            <FormTitle>
              <PlooIco src="src/assets/ploomes_logo.png"></PlooIco>
            </FormTitle>
          <Input
            type="text"
            id="userKey"
            name="userKey"
            value={userKey}
            onChange={(e) => setUserKey(e.target.value)}
            placeholder="Enter your User Key"
          />
          <SubmitButton type="submit">Submit</SubmitButton>
        </FormWrapper>
      </FormContainer>
      <div>
        {error && <p className="error">{error}</p>}
      </div>
      <FormFooter>Unofficial development by Pedro Alencastro</FormFooter>
    </>
  );
};

export default UKForm;
