import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';

const Spinner = styled(FaSpinner)`
  font-size: 40px;
  color: ${(props) => props.theme.spinnerColor || '#7506be'};
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: ${(props) => props.theme.backgroundColor || '#f5f5f5'};
`;

const LoadingMessage = styled.p`
  font-size: 18px;
  color: ${(props) => props.theme.textColor || '#333'};
  margin-top: 20px;
  text-align: center;
`;

const ContactContainer = styled.div`
  padding: 20px 0px 0px 0px;
  margin-top: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  background-color: ${(props) => props.theme.backgroundColor};
  color: ${(props) => props.theme.textColor};
  transition: background-color 0.3s ease, color 0.3s ease;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  overflow-x: auto;
`;

const TableHeader = styled.th`
  padding: 12px;
  background-color: ${(props) => props.theme.contactHeaderBgColor};
  border-bottom: 1px solid ${(props) => props.theme.tableBorderColor};
  text-align: left;
  font-weight: bold;
`;

const TableCell = styled.td`
  padding: 12px;
  border-bottom: 1px solid ${(props) => props.theme.tableBorderColor};
`;

const Button = styled.button`
  padding: 5px 10px;
  background-color: ${(props) => props.theme.buttonBgColor};
  color: ${(props) => props.theme.buttonTextColor};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);

  &:hover {
    opacity: 0.8;
  }
`;

const EditButton = styled(Button)`
  background-color: ${(props) => props.theme.buttonBgColor};
  display: inline-flex;
  margin-right: 5px;
`;

const DeleteButton = styled(Button)`
  background-color: #f44336;
  display: inline-flex;
`;

const SaveButton = styled(Button)`
  background-color: #4caf50;
`;

const CancelButton = styled(Button)`
  background-color: #f44336;
`;

const StyledInput = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: ${(props) => props.theme.inputBgColor};
  color: ${(props) => props.theme.textColor};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const Contact = ({}) => {
  const userKey = localStorage.getItem('userKey');
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editContactId, setEditContactId] = useState(null);
  const [editableFields, setEditableFields] = useState({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchFields, setSearchFields] = useState({
    Name: '',
    Email: '',
    Phone: '',
    OwnerId: '',
  });

  const fetchContacts = async (pageNumber = 1) => {
    if (!userKey) {
      setError('User key not found.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const pageSize = 30;
    const query = Object.entries(searchFields)
      .filter(([key, value]) => value)
      .map(([key, value]) => `contains(${key},'${encodeURIComponent(value)}')`)
      .join(' and ');

    const filterQueryString = query ? `?$expand=Phones&$filter=${query}` : '?$expand=Phones';
    const paginatedQueryString = `${filterQueryString}&$top=${pageSize}&$skip=${(pageNumber - 1) * pageSize}`;

    try {
      const contactsResponse = await fetch(`https://api2.ploomes.com/Contacts${paginatedQueryString}`, {
        method: 'GET',
        headers: {
          'User-Key': userKey,
          'Content-Type': 'application/json',
        },
      });

      if (!contactsResponse.ok) {
        throw new Error('Network response was not ok');
      }

      const contactsData = await contactsResponse.json();
      console.log('User data received:', contactsData);

      if (!Array.isArray(contactsData.value)) {
        throw new Error('API response doesnt have the contacts.');
      }

      const usersResponse = await fetch('https://api2.ploomes.com/Users', {
        method: 'GET',
        headers: {
          'User-Key': userKey,
          'Content-Type': 'application/json',
        },
      });

      if (!usersResponse.ok) {
        throw new Error('Network response was not ok');
      }

      const usersData = await usersResponse.json();
      console.log('Uset data received:', usersData);

      const usersMap = new Map(usersData.value.map(user => [user.Id, user.Name]));

      const processedContacts = contactsData.value.map(contact => {
        const phoneNumber = contact.Phones && contact.Phones.length > 0
          ? contact.Phones[0].PhoneNumber
          : 'N/A';

        return {
          ...contact,
          PhoneNumber: phoneNumber || 'N/A',
          OwnerName: usersMap.get(contact.OwnerId) || 'Unknown',
        };
      });

      console.log('Contacts:', processedContacts);

      setContacts(prevContacts => pageNumber === 1 ? processedContacts : [...prevContacts, ...processedContacts]);
      setHasMore(contactsData.value.length === pageSize);
    } catch (error) {
      console.error('Error searching contacts. :(', error);
      setError('Error searching contacts. :(');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts(page);
  }, [userKey, searchFields, page]);

  const handleScroll = () => {
    if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || loading || !hasMore) {
      return;
    }
    setPage(prevPage => prevPage + 1);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [loading, hasMore]);

  const handleEdit = (contactId) => {
    setEditContactId(contactId);
    const contact = contacts.find((c) => c.Id === contactId);
    setEditableFields({
      Name: contact.Name,
      Email: contact.Email,
      Phone: contact.Phones && contact.Phones.length > 0 ? contact.Phones[0].PhoneNumber : '',
      OwnerId: contact.OwnerId,
    });
  };

  const handleSave = async (contactId) => {
    const updatedFields = {};

    const contact = contacts.find((c) => c.Id === contactId);
    if (editableFields.Name !== contact.Name) updatedFields.Name = editableFields.Name;
    if (editableFields.Email !== contact.Email) updatedFields.Email = editableFields.Email;
    if (
      editableFields.Phone !== (contact.Phones && contact.Phones.length > 0 ? contact.Phones[0].PhoneNumber : '')
    )
      updatedFields.Phones = [{ PhoneNumber: editableFields.Phone }];
    if (editableFields.OwnerId !== contact.OwnerId) updatedFields.OwnerId = editableFields.OwnerId;

    if (Object.keys(updatedFields).length > 0) {
      try {
        const response = await fetch(`https://api2.ploomes.com/Contacts(${contactId})`, {
          method: 'PATCH',
          headers: {
            'User-Key': userKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedFields),
        });

        if (response.ok) {
          setContacts((prevContacts) =>
            prevContacts.map((contact) => (contact.Id === contactId ? { ...contact, ...updatedFields } : contact))
          );
          alert('Client updated successfully.');
        } else {
          alert('Error updating the client.');
        }
      } catch (error) {
        alert('Client deleted successfully.');
      }
    }

    setEditContactId(null);
  };

  const handleDelete = async (contactId) => {
    const confirmed = window.confirm('Do you really want to delete this contact?');
    if (confirmed) {
      try {
        const response = await fetch(`https://api2.ploomes.com/Contacts(${contactId})`, {
          method: 'DELETE',
          headers: {
            'User-Key': userKey,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          setContacts((prevContacts) => prevContacts.filter((contact) => contact.Id !== contactId));
          alert('Contact deleted successfully.');
        } else {
          alert('Error deleting the contact.');
        }
      } catch (error) {
        alert('Error processing the request.');
      }
    }
  };

  const handleCancel = () => {
    setEditContactId(null);
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setEditableFields((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner />
        <LoadingMessage>Loading contacts, please wait...</LoadingMessage>
      </LoadingContainer>
    );
  }

  return (
    <ContactContainer>
      {error && <p>{error}</p>}
      <Table>
        <thead>
          <tr>
            <TableHeader>Name</TableHeader>
            <TableHeader>Email</TableHeader>
            <TableHeader>Phone Number</TableHeader>
            <TableHeader>Owner Name</TableHeader>
            <TableHeader></TableHeader>
          </tr>
        </thead>
        <tbody>
          {contacts.length > 0 ? (
            contacts.map((contact) => (
              <tr key={contact.Id}>
                <TableCell>
                  {editContactId === contact.Id ? (
                    <StyledInput
                      type="text"
                      name="Name"
                      value={editableFields.Name || ''}
                      onChange={handleFieldChange}
                    />
                  ) : (
                    contact.Name
                  )}
                </TableCell>
                <TableCell>
                  {editContactId === contact.Id ? (
                    <StyledInput
                      type="email"
                      name="Email"
                      value={editableFields.Email || ''}
                      onChange={handleFieldChange}
                    />
                  ) : (
                    contact.Email
                  )}
                </TableCell>
                <TableCell>
                  {editContactId === contact.Id ? (
                    <StyledInput
                      type="text"
                      name="Phone"
                      value={editableFields.Phone || ''}
                      onChange={handleFieldChange}
                    />
                  ) : (
                    contact.Phones && contact.Phones.length > 0
                      ? contact.Phones[0].PhoneNumber
                      : 'Não informado'
                  )}
                </TableCell>
                <TableCell>
                  {editContactId === contact.Id ? (
                    <StyledInput
                      type="text"
                      name="OwnerId"
                      value={editableFields.OwnerName || ''}
                      onChange={handleFieldChange}
                    />
                  ) : (
                    contact.OwnerName
                  )}
                </TableCell>
                <TableCell>
                  {editContactId === contact.Id ? (
                    <ButtonGroup>
                      <SaveButton onClick={() => handleSave(contact.Id)}>Save</SaveButton>
                      <CancelButton onClick={handleCancel}>Cancel</CancelButton>
                    </ButtonGroup>
                  ) : (
                    <ButtonGroup>
                      <EditButton onClick={() => handleEdit(contact.Id)}>
                        <FaEdit /> Edit
                      </EditButton>
                      <DeleteButton onClick={() => handleDelete(contact.Id)}>
                        <FaTrash /> Delete
                      </DeleteButton>
                    </ButtonGroup>
                  )}
                </TableCell>
              </tr>
            ))
          ) : (
            <tr>
              <TableCell colSpan="5">No contacts found.</TableCell>
            </tr>
          )}
        </tbody>
      </Table>
    </ContactContainer>
  );
};

export default Contact;