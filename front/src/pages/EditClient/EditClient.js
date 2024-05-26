import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, Box, Container, Paper, AppBar, Toolbar, IconButton, CssBaseline, Avatar } from '@mui/material';
import Menu from '../../components/verticalMenu/menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { styled } from '@mui/system';
import axios from 'axios';

const apiUrl = 'http://localhost:8000/clients/';

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

const EditClient = () => {
    const { clientId, userID } = useParams();
    const navigate = useNavigate();
    const [clientData, setClientData] = useState({
        email: '',
        first_name: '',
        last_name: '',
        income: '',
        phone_number: '',
        address: '',
        role: 'client',
    });
    const [userData, setUserData] = useState(null);
    const [errorText, setErrorText] = useState('');

    useEffect(() => {
        fetch(`${apiUrl}${clientId}/`)
            .then(response => response.json())
            .then(data => setClientData(data))
            .catch(error => console.error(error));

        axios.get(`http://localhost:8000/users/${userID}/`, {
            withCredentials: true
        })
        .then((response) => {
            setUserData(response.data);
        })
        .catch((error) => {
            console.error('Error fetching user data:', error);
        });
    }, [clientId, userID]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setClientData({ ...clientData, [name]: value });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const { first_name, last_name, income, phone_number, address } = clientData;
        const phoneRegex = /^\+\d{12,15}$/;

        if (!phoneRegex.test(phone_number)) {
            setErrorText('Некорректный формат номера телефона. Номер должен начинаться с "+" и содержать от 12 до 15 цифр.');
            return;
        }

        if (!first_name || !last_name || !phone_number || !address) {
            setErrorText('Пожалуйста, заполните все поля');
            return;
        }

        fetch(`${apiUrl}${clientId}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
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
        axios.post('http://localhost:8000/api/logout', {})
            .then(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('userRole');
                navigate('/login');
            })
            .catch((error) => console.error('Error during logout:', error));
    };

    return (
        <StyledBox>
            <CssBaseline />
            <Menu userID={userID} />
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, background: '#030E32' }}>
                    <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h6" noWrap component="div">
                            Редактировать данные клиента
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {userData && (
                                <ProfileAvatar
                                    alt={userData.first_name}
                                    src={userData.avatar || "/static/images/avatar/1.jpg"}
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
                    <FormContainer elevation={3}>
                        <Typography variant="h4" gutterBottom>
                            Редактировать данные клиента
                        </Typography>
                        <form onSubmit={handleSubmit}>
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
                            <Button type="submit" variant="contained" color="primary" style={{ marginTop: 20 }}>
                                Сохранить изменения
                            </Button>
                            {errorText && <Typography color="error" style={{ marginTop: 10 }}>{errorText}</Typography>}
                        </form>
                    </FormContainer>
                </Container>
            </Box>
        </StyledBox>
    );
};

export default EditClient;
