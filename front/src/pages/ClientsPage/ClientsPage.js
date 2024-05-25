import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { IconButton, TextField, Button, Typography, Box, Container, Paper, AppBar, Toolbar, CssBaseline, Grid, Avatar } from '@mui/material';
import { styled } from '@mui/system';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate, useParams } from 'react-router-dom';
import Menu from '../../components/verticalMenu/menu';
import LogoutIcon from '@mui/icons-material/Logout';
import axios from 'axios';

const apiUrl = 'http://localhost:8000/clients/';
const apiUrl2 = 'http://localhost:8000/clients/financial-analyst/';


const FormContainer = styled(Box)({
  padding: 20,
  backgroundColor: '#f5f5f5',
  borderRadius: 8,
  marginTop: 20,
});

const DataGridContainer = styled(Paper)({
  padding: 20,
  backgroundColor: '#fff',
  marginTop: 20,
  width: '100%',
  overflow: 'auto',
});

const ErrorTypography = styled(Typography)({
  color: '#f44336', 
  marginBottom: 10,
});

const HeaderAvatar = styled(Avatar)({
  width: 40,
  height: 40,
});

function ClientsDataGrid() {
  const { userID } = useParams();
  const columns = [
    { field: 'user_id', headerName: 'ID', width: 70 },
    { field: 'first_name', headerName: 'Имя', width: 130 },
    { field: 'last_name', headerName: 'Фамилия', width: 130 },
    { field: 'income', headerName: 'Доход', width: 130 },
    { field: 'phone_number', headerName: 'Телефон', width: 150 },
    { field: 'address', headerName: 'Адрес', width: 200 },
    { field: 'date_created', headerName: 'Дата создания', width: 170 },
    {
      field: 'details',
      headerName: 'Действия',
      width: 300,
      renderCell: (params) => (
        <>
          <Button variant="contained" color="primary" size="small" onClick={() => handleEditClick(params.row.user_id)} style={{ marginRight: 10 }}>
            Редактировать
          </Button>
          <Button variant="contained" color="secondary" size="small" onClick={() => handleDetailsClick(params.row.user_id)}>
            Подробнее
          </Button>
        </>
      ),
    },
  ];

  const [clients, setClients] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [newClientData, setNewClientData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    income: '',
    phone_number: '',
    address: '',
    role: 'client',
  });
  const [errorText, setErrorText] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(apiUrl)
      .then((response) => {
        setClients(response.data);
      })
      .catch((error) => console.error(error));

    axios.get(`${apiUrl2}${userID}/`)
      .then((response) => {
        setAvatarUrl(response.data.user.avatar);
      })
      .catch((error) => console.error('Error fetching avatar:', error));
  }, [userID]);

  const handleDeleteSelected = () => {
    selectedRows.forEach((id) => {
      axios.delete(`${apiUrl}${id}/`)
        .then((response) => {
          if (response.status === 200 || response.status === 204) {
            setClients((clients) => clients.filter((client) => client.user_id !== id));
          } else {
            console.error('Ошибка при удалении:', response.status);
          }
        })
        .catch((error) => console.error(error));
    });
  };

  function handleDetailsClick(clientId) {
    navigate(`/login/client/${clientId}`);
  }

  function handleEditClick(user_id) {
    navigate(`/client/edit/${user_id}`);
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewClientData({ ...newClientData, [name]: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const { email, first_name, last_name, income, phone_number, address, role } = newClientData;
    const phoneRegex = /^\+\d{12,15}$/;

    const isPhoneNumberUnique = clients.every((client) => client.phone_number !== phone_number);

    if (!phoneRegex.test(phone_number)) {
      setErrorText('Некорректный формат номера телефона. Номер должен начинаться с "+" и содержать от 12 до 15 цифр.');
      return;
    }

    if (!isPhoneNumberUnique) {
      setErrorText('Такой номер телефона уже существует.');
      return;
    }

    if (!email || !first_name || !last_name || !phone_number || !address) {
      setErrorText('Пожалуйста, заполните все поля');
      return;
    }

    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: { email, role },
        first_name,
        last_name,
        income: parseFloat(income),
        phone_number,
        address,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setClients([...clients, data]);
        setNewClientData({
          email: '',
          first_name: '',
          last_name: '',
          income: '',
          phone_number: '',
          address: '',
          role: 'client',
        });
        setErrorText('');
      })
      .catch((error) => console.error('Ошибка при добавлении клиента:', error));
  };

  const isValidClientData = (clients) => {
    const userIds = clients.map(client => client.user_id);
    const uniqueUserIds = new Set(userIds);
    return userIds.length === uniqueUserIds.size && userIds.every(id => id !== undefined);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Menu userID={userID} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <AppBar style={{ background: '#030E32' }} position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" noWrap component="div">
              Клиенты
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <HeaderAvatar alt="avatar" src={avatarUrl || "/static/images/avatar/1.jpg"} />
              <IconButton onClick={() => console.log('Logout')}>
                <LogoutIcon style={{ color: 'white' }} />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
        <Toolbar />
        <Container maxWidth="lg">
          <FormContainer component="form" onSubmit={handleSubmit}>
            <Typography variant="h6" gutterBottom>
              Добавить нового клиента
            </Typography>
            {errorText && <ErrorTypography>{errorText}</ErrorTypography>}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  name="email"
                  value={newClientData.email}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Имя"
                  name="first_name"
                  value={newClientData.first_name}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Фамилия"
                  name="last_name"
                  value={newClientData.last_name}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Доход"
                  name="income"
                  value={newClientData.income}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Телефон"
                  name="phone_number"
                  value={newClientData.phone_number}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Адрес"
                  name="address"
                  value={newClientData.address}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
            </Grid>
            <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
              Добавить клиента
            </Button>
          </FormContainer>
          <DataGridContainer>
            {isValidClientData(clients) ? (
              <DataGrid
                rows={clients}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5, 10, 25, 50, 100]}
                checkboxSelection
                autoHeight
                getRowId={(row) => row.user_id}
                onSelectionModelChange={(newSelection) => setSelectedRows(newSelection)}
              />
            ) : (
              <Typography variant="h6" color="error">
                Ошибка: данные клиента некорректны
              </Typography>
            )}
            {selectedRows.length > 0 && (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteSelected}
                sx={{ mt: 2 }}
              >
                Удалить выбранные
              </Button>
            )}
          </DataGridContainer>
        </Container>
      </Box>
    </Box>
  );
}

export default ClientsDataGrid;
