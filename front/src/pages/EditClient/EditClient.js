import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, Box, Container, Paper, AppBar, Toolbar, IconButton, CssBaseline, Avatar } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Menu from '../../components/verticalMenu/menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { styled } from '@mui/system';
import axios from 'axios';

const apiUrl = 'http://localhost:8000/clients/';
const checkEmailUrl = 'http://localhost:8000/api/check-email';

const StyledBox = styled(Box)({
    display: 'flex',
    minHeight: '100vh',
});

const FormContainer = styled(Paper)({
    padding: 20,
    marginTop: 20,
    width: '100%',
});

const ProfileAvatar = styled(Avatar)({
    width: 40,
    height: 40,
    marginLeft: 10,
});

const BackButton = styled(IconButton)({
    color: 'white',
    backgroundColor: '#6a65ff',
    '&:hover': {
        backgroundColor: '#5a55e0',
    },
    marginRight: 10,
});

const MyButton = styled(Button)({
    background: '#6a65ff',
    ':hover': {
        background: '#5a55e0',
    },
});

const handleEmailCheck = async (email, currentClientId) => {
    try {
        const response = await axios.get(checkEmailUrl, {
            params: { email },
        });
        return response.data.exists && response.data.client_id.toString() !== currentClientId;
    } catch (error) {
        console.error('Ошибка при проверке email:', error);
        return false;
    }
};

const EditClient = () => {
    const { clientId, userID } = useParams();
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [clientData, setClientData] = useState({
        first_name: '',
        last_name: '',
        income: '',
        phone_number: '',
        address: '',
        role: 'client',
    });
    const [userData, setUserData] = useState({
        email: '',
    });
    const [errorText, setErrorText] = useState('');
    const [analystData, setAnalystData] = useState('');

    useEffect(() => {
        axios.get(apiUrl, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
        })
            .then((response) => {
                setClients(response.data);
            })
            .catch((error) => {
                if (error.response && error.response.status === 403) {
                  navigate('/forbidden'); 
                } else if (error.response && error.response.status === 401) {
                  navigate('/login'); 
                }
              });

        fetch(`${apiUrl}${clientId}/`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
        })
            .then(response => response.json())
            .then(data => setClientData(data))
            .catch((error) => {
                if (error.response && error.response.status === 403) {
                  navigate('/forbidden'); 
                } else if (error.response && error.response.status === 401) {
                  navigate('/login'); 
                }
              });

        fetch(`http://localhost:8000/api/${userID}/`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
        })
            .then(response => response.json())
            .then(data => setAnalystData(data))
            .catch((error) => {
                if (error.response && error.response.status === 403) {
                  navigate('/forbidden'); 
                } else if (error.response && error.response.status === 401) {
                  navigate('/login'); 
                }
              });

        axios.get(`http://localhost:8000/api/${clientId}/`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
        })
            .then((response) => {
                setUserData(response.data);
            })
            .catch((error) => {
                if (error.response && error.response.status === 403) {
                  navigate('/forbidden'); 
                } else if (error.response && error.response.status === 401) {
                  navigate('/login'); 
                }
              });
    }, [clientId, userID]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        if (name === 'email') {
            setUserData({ ...userData, [name]: value });
        } else {
            setClientData({ ...clientData, [name]: value });
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const { first_name, last_name, income, phone_number, address } = clientData;
        const { email } = userData;

        const phoneRegex = /^\+\d{12,15}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const isPhoneNumberUnique = clients.every((client) => client.phone_number !== phone_number || client.user_id === parseInt(clientId, 10));

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


        const isEmailUnique = await handleEmailCheck(email, clientId);

        if (isEmailUnique) {
            setErrorText('Такой email уже существует');
            return;
        }

        const parsedIncome = parseFloat(income);
        if (isNaN(parsedIncome)) {
            setErrorText('Доход должен быть числом');
            return;
        }

        fetch(`${apiUrl}${clientId}/`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ...clientData, income: parseFloat(income) }),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Данные клиента успешно обновлены:', data);
                navigate(`/data/${userID}`);
            })
            .catch(error => console.error('Ошибка при обновлении данных клиента:', error));
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
        <StyledBox>
            <CssBaseline />
            <Menu userID={userID} />
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, background: '#030E32' }}>
                    <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h6" noWrap component="div">
                            Клиенты
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {userData && (
                                <ProfileAvatar
                                    alt={userData.first_name}
                                    src={analystData.avatar || "/static/images/avatar/1.jpg"}
                                />
                            )}
                            <IconButton onClick={handleLogout}>
                                <LogoutIcon style={{ color: 'white' }} />
                            </IconButton>
                        </Box>
                    </Toolbar>
                </AppBar>
                <Toolbar />
                <Container component="main" maxWidth="sm">
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                        <BackButton onClick={() => navigate(-1)}>
                            <ArrowBackIcon />
                        </BackButton>
                        <Typography variant="h5">
                            Назад
                        </Typography>
                    </Box>
                    <FormContainer elevation={3}>
                        <Typography variant="h4" gutterBottom>
                            Редактировать данные клиента
                        </Typography>
                        <form onSubmit={handleSubmit}>
                            <TextField
                                label="Email"
                                name="email"
                                value={userData.email}
                                onChange={handleInputChange}
                                variant="outlined"
                                margin="normal"
                                fullWidth
                            />
                            <TextField
                                label="Имя"
                                name="first_name"
                                value={clientData.first_name}
                                onChange={handleInputChange}
                                variant="outlined"
                                margin="normal"
                                fullWidth
                            />
                            <TextField
                                label="Фамилия"
                                name="last_name"
                                value={clientData.last_name}
                                onChange={handleInputChange}
                                variant="outlined"
                                margin="normal"
                                fullWidth
                            />
                            <TextField
                                label="Доход"
                                name="income"
                                value={clientData.income}
                                onChange={handleInputChange}
                                variant="outlined"
                                margin="normal"
                                fullWidth
                            />
                            <TextField
                                label="Телефон"
                                name="phone_number"
                                value={clientData.phone_number}
                                onChange={handleInputChange}
                                variant="outlined"
                                margin="normal"
                                fullWidth
                            />
                            <TextField
                                label="Адрес"
                                name="address"
                                value={clientData.address}
                                onChange={handleInputChange}
                                variant="outlined"
                                margin="normal"
                                fullWidth
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                <MyButton type="submit" variant="contained" color="primary" style={{ marginTop: 20 }}>
                                    Сохранить изменения
                                </MyButton>
                            </Box>
                            {errorText && <Typography color="error" style={{ marginTop: 10 }}>{errorText}</Typography>}
                        </form>
                    </FormContainer>
                </Container>
            </Box>
        </StyledBox>
    );
};

export default EditClient;
