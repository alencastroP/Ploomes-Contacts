import styled from 'styled-components';
import React, { useState, useCallback, useEffect } from 'react';
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
  const userKey = localStorage.getItem('userKey');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
 
  const [searchFields, setSearchFields] = useState({
    Name: '',
    Email: '',
    Phone: '',
    Owner: '',
  });

  
useEffect(() => {
  if (searchFields) {
    fetchContacts();
  }
}, [searchFields]);

const fetchContacts = async (pageNumber = 1) => {
  if (!userKey) {
    setError('User key not found.');
    setLoading(false);
    return;
  }
  setLoading(true); 
  setContacts([]); 
  pageNumber = 1;
  setError('');

  const pageSize = 30;
  const query = Object.entries(searchFields)
    .filter(([key, value]) => value)
    .map(([key, value]) => {
      if (key === 'Owner') {
        return `Owner/Name eq '${encodeURIComponent(value)}'`;
      } else if (key === 'Phone') {
        return value.length > 11 
  ? `Phones/any(p: p/PhoneNumber eq '${encodeURIComponent(value)}')`
  : `Phones/any(p: p/SearchPhoneNumber eq ${encodeURIComponent(value)})`;
      } else {
        return `contains(${key},'${encodeURIComponent(value)}')`;
      }
    })
    .join(' and ');

    const filterQueryString = query 
    ? `&$filter=${query}` 
    : '';
  const expandQueryString = '?$expand=Owner,Phones';
  const paginatedQueryString = `${expandQueryString}${filterQueryString}&$top=${pageSize}&$skip=${(pageNumber - 1) * pageSize}`;
  try {
    const contactsResponse = await fetch(`https://api2.ploomes.com/Contacts${paginatedQueryString}`, {
      method: 'GET',
      headers: {
        'User-Key': userKey,
        'Content-Type': 'application/json',
      },
    });
    console.log(searchFields);

    if (!contactsResponse.ok) {
      throw new Error('Network response was not ok');
    }

    const contactsData = await contactsResponse.json();
    console.log('Contacts data received:', contactsData);

    if (!Array.isArray(contactsData.value)) {
      throw new Error('API response doesn\'t have the contacts.');
    }

    setContacts(contactsData.value);
    setHasMore(contactsData.value.length === pageSize);
  } catch (error) {
    console.error('Error searching contacts. :(', error);
    setError('Error searching contacts. :(');
  } finally {
    setLoading(false);
  }
};


  const [editContactId, setEditContactId] = useState(null);
  const [editableFields, setEditableFields] = useState({});

  const handleEdit = (contactId) => {
    setEditContactId(contactId);
    const contact = contacts.find((c) => c.Id === contactId);
    setEditableFields({
      Name: contact.Name,
      Email: contact.Email,
      Phone: contact.Phones && contact.Phones.length > 0 ? contact.Phones[0].PhoneNumber : '',
      Owner: contact.Owner && contact.Owner.length > 0 ? contact.Owner.Name : '',
    });
  };

  const handleSave = async (contactId) => {
    const updatedFields = {};
    const contact = contacts.find((c) => c.Id === contactId);
    if (editableFields.Name !== contact.Name) updatedFields.Name = editableFields.Name;
    if (editableFields.Email !== contact.Email) updatedFields.Email = editableFields.Email;
    if (editableFields.Phone !== (contact.Phones && contact.Phones.length > 0 ? contact.Phones[0].PhoneNumber : ''))
      updatedFields.Phones = [{ PhoneNumber: editableFields.Phone }];
    if (editableFields.Owner !== contact.Owner) updatedFields.Owner = editableFields.Owner;

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
            prevContacts.map((c) => (c.Id === contactId ? { ...c, ...updatedFields } : c))
          );
          alert('Contact updated successfully.');
        } else {
          alert('Error updating the contact.');
        }
      } catch (error) {
        alert('Error updating the contact.');
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
          setContacts((prevContacts) => prevContacts.filter((c) => c.Id !== contactId));
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
        <Contact
          contacts={contacts}
          loading={loading}
          error={error}
          editContactId={editContactId}
          editableFields={editableFields}
          handleEdit={handleEdit}
          handleSave={handleSave}
          handleDelete={handleDelete}
          handleCancel={handleCancel}
          handleFieldChange={handleFieldChange}
        />
      </ListContainer>
      <NewContactButton onClick={handleNewContactClick}>+</NewContactButton>
      {isSidebarOpen && <NewContactSidebar onClose={handleCloseSidebar} onSubmit={handleSubmit} />}
    </>
  );
}

export default ContactList;
