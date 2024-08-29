import styled from 'styled-components';

const NewContactButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 10px 20px;
  background-color: ${({ theme }) => theme.buttonBgColor};
  color: ${({ theme }) => theme.buttonTextColor};
  border: none;
  border-radius: 50%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  font-size: 2.2rem;
  cursor: pointer;
  z-index: 1000;

  &:hover {
    background-color: ${({ theme }) => theme.buttonHoverBgColor};
  }
`;

export default NewContactButton;