import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { TextField, Button, Typography, Box, Container, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Menu from '../../components/verticalMenu/menu';

const apiUrl = 'http://localhost:8000/clients/';

function EditClient() {
    const navigate = useNavigate();
    const { clientId } = useParams();
    const [clientData, setClientData] = useState({
        email: '',
        first_name: '',
        last_name: '',
        income: '',
        phone_number: '',
        address: '',
        role: 'client',
    });
    const [initialClientData, setInitialClientData] = useState({});
    const [errorText, setErrorText] = useState('');

    useEffect(() => {
        fetch(`${apiUrl}${clientId}/`)
            .then(response => response.json())
            .then(data => {
                setClientData(data);
                setInitialClientData(data);
            })
            .catch(error => console.error(error));
    }, [clientId]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setClientData({ ...clientData, [name]: value });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const { first_name, last_name, income, phone_number, address } = clientData;
        const phoneRegex = /^\+\d{12,15}$/;

        // Проверка длины и формата номера телефона
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
                navigate(`/clients`);
            })
            .catch(error => console.error('Ошибка при обновлении данных клиента:', error));
    };

    return (
        <Box sx={{ display: 'flex', backgroundColor: '#051139', minHeight: '100vh' }}>
            <Menu />
            <Container component="main" maxWidth="sm">
                <Paper elevation={3} style={{ padding: 20, marginTop: 20 }}>
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
                </Paper>
            </Container>
        </Box>
    );
}

export default EditClient;
