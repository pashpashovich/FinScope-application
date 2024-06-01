import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { IconButton, TextField, Button, Typography, Box, Container, Paper, AppBar, Toolbar, CssBaseline, Grid, Avatar } from '@mui/material';
import { styled } from '@mui/system';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate, useParams } from 'react-router-dom';
import Menu from '../../components/verticalMenu/menu';
import LogoutIcon from '@mui/icons-material/Logout';
import axios from 'axios';

axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;

const apiUrl = 'http://localhost:8000/clients/';
const apiUrl2 = 'http://localhost:8000/clients/financial-analyst/';
const checkEmailUrl = 'http://localhost:8000/api/check-email';

const FormContainer = styled(Box)({
  padding: '20px',
  backgroundColor: '#f5f5f5',
  borderRadius: '8px',
  marginTop: '5px',
  width: '100%', 
  '@media (max-width: 1200px)': {
    padding: '15px',
  },
  '@media (max-width: 600px)': {
    padding: '10px',
  },
});


const MainContent = styled(Box)({
  flexGrow: 1,
  padding: '20px', 
  marginLeft: '400px', 
  '@media (max-width: 1200px)': {
    marginLeft: '300px', 
  },
  '@media (max-width: 900px)': {
    marginLeft: '200px',
  },
  '@media (max-width: 600px)': {
    marginLeft: '0px',
  },
});

const DataGridContainer = styled(Paper)({
  padding: '20px',
  backgroundColor: '#fff',
  marginTop: '20px',
  width: '100%',
  overflow: 'auto',
  '@media (max-width: 1200px)': {
    padding: '15px',
  },
  '@media (max-width: 600px)': {
    padding: '10px',
  },
});

const ErrorTypography = styled(Typography)({
  color: '#f44336',
  marginBottom: 10,
});

const HeaderAvatar = styled(Avatar)({
  width: 40,
  height: 40,
});

const ResponsiveBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  padding: '40px',
  width: '100%', 
  '@media (min-width: 1200px)': {
    maxWidth: '1200px', 
  },
  '@media (max-width: 1199px) and (min-width: 900px)': {
    maxWidth: '90vw', 
  },
  '@media (max-width: 899px)': {
    maxWidth: '85vw', 
  },
});

const MyButton = styled(Button)({
  background: '#6a65ff',
  ':hover': {
    background: '#5a55e0', 
  },
});

const DelButton = styled(Button)({
  background: '#ff1f1f',
  ':hover': {
    background: '#e60000',
  },
});

function ClientsDataGrid() {
  const { userID } = useParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && error.response.status === 401) {
          navigate('/login');
        }
        if (error.response && error.response.status === 403) {
          navigate('/forbidden');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [navigate]);

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
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    axios.get(apiUrl, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    },})
      .then((response) => {
        setClients(response.data);
      })
      .catch((error) => console.error(error));

    axios.get(`${apiUrl2}${userID}/`,
    {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    },})
      .then((response) => {
        setAvatarUrl(response.data.user.avatar);
        console.log(avatarUrl)
      })
      .catch((error) => console.error('Error fetching avatar:', error));
  }, [userID]);

  const handleDeleteSelected = () => {
    if (selectedRows.length === 0) {
      setDeleteError('Нет выбранных строк для удаления');
      return;
    }
    
    setDeleteError(''); 

    selectedRows.forEach((id) => {
      fetch(`${apiUrl}${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      .then(response => {
        if (response.ok) {
          setClients(clients => clients.filter(client => client.user_id !== id));
        } else {
          console.error('Ошибка при удалении:', response.status);
        }
      })
      .catch(error => console.error(error));
    });
    setSelectedRows([]);
  };

  function handleDetailsClick(clientId) {
    navigate(`/login/client/${clientId}/${userID}`);
  }

  function handleEditClick(user_id) {
    navigate(`/client/edit/${user_id}/${userID}`);
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewClientData({ ...newClientData, [name]: value });
  };

  const handleEmailCheck = async (email) => {
    try {
      const response = await axios.get(checkEmailUrl, {
        params: { email },
      });
      return response.data.exists;
    } catch (error) {
      console.error('Ошибка при проверке email:', error);
      return false;
    }
  };


  const handleSubmit = async (event) => {
    event.preventDefault();
    const { email, first_name, last_name, income, phone_number, address, role } = newClientData;
    const phoneRegex = /^\+\d{12,15}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const isPhoneNumberUnique = clients.every((client) => client.phone_number !== phone_number);

    if (!email || !first_name || !last_name || !phone_number || !address) {
      setErrorText('Пожалуйста, заполните все поля');
      return;
    }

    if (!phoneRegex.test(phone_number)) {
      setErrorText('Некорректный формат номера телефона. Номер должен начинаться с "+" и содержать от 12 до 15 цифр');
      return;
    }

    if (!isPhoneNumberUnique) {
      setErrorText('Такой номер телефона уже существует');
      return;
    }

    if (!emailRegex.test(email)) {
      setErrorText('Некорректный формат email');
      return;
    }

    const isEmailUnique = await handleEmailCheck(email);

    if (isEmailUnique) {
      setErrorText('Такой email уже существует');
      return;
    }

    const parsedIncome = parseFloat(income);
    if (isNaN(parsedIncome)) {
      setErrorText('Доход должен быть числом');
      return;
    }


    axios.post(apiUrl, {
      user: { email, role },
      first_name,
      last_name,
      income: parseFloat(income),
      phone_number,
      address,
    }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    },})
      .then((response) => {
        setClients([...clients, response.data]);
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

  const handleLogout = () => {
    axios.post(
      'http://localhost:8000/api/logout',
      {
        refresh_token: localStorage.getItem('refreshToken'),
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        withCredentials: true
      }
    )
    .then(response => {
      if (response.status !== 200) {
        console.log(localStorage.getItem('refreshToken'));
        return;
      }
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      navigate('/login');
    })
    .catch(error => {
      console.error(error);
      console.log(localStorage.getItem('refreshToken'));
    });
  };

  return (
    <ResponsiveBox>
            <MainContent>
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
              <IconButton onClick={handleLogout}>
                <LogoutIcon style={{ color: 'white' }} />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
        <Toolbar />
        <Container maxWidth="lg">
          <FormContainer component="form" onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Добавить нового клиента
            </Typography>
            </Box>
            {errorText && <ErrorTypography>{errorText}</ErrorTypography>}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
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
              <Grid item xs={12} sm={6} md={4}>
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
              <Grid item xs={12} sm={6} md={4}>
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
              <Grid item xs={12} sm={6} md={4}>
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
              <Grid item xs={12} sm={6} md={4}>
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
              <Grid item xs={12} sm={6} md={4}>
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
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <MyButton type="submit" variant="contained" color="primary">
                Добавить клиента
              </MyButton>
            </Box>
          </FormContainer>
          <DataGridContainer>
            {isValidClientData(clients) ? (
              <>
                <DataGrid
                  rows={clients}
                  columns={columns}
                  pageSize={5}
                  rowsPerPageOptions={[5, 10, 25, 50, 100]}
                  checkboxSelection
                  autoHeight
                  getRowId={(row) => row.user_id}
                  onRowSelectionModelChange={(newSelectionModel) => {
                    setSelectedRows(newSelectionModel);
                  }}
                  sx={{
                    '& .MuiDataGrid-root': {
                      overflowX: 'auto',
                    },
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <DelButton
                  variant="contained"
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteSelected}
                  sx={{ mt: 2 }}
                >
                  Удалить выбранные
                </DelButton>
                </Box>
                {deleteError && <ErrorTypography>{deleteError}</ErrorTypography>}

              </>
            ) : (
              <Typography variant="h6" color="error">
                Ошибка: данные клиента некорректны
              </Typography>
            )}
          </DataGridContainer>
        </Container>
      </Box>
      </MainContent>
    </ResponsiveBox>
  );
}

export default ClientsDataGrid;
