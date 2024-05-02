import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Divider, Paper, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ClientAccountsPage = () => {
    const { clientId } = useParams(); // Получаем параметр clientId из URL
    const [clientInfo, setClientInfo] = useState(null); // Состояние для хранения информации о клиенте
    const [accounts, setAccounts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Запрос на получение информации о клиенте
        fetch(`http://localhost:8000/clients/${clientId}`)
            .then(response => response.json())
            .then(data => setClientInfo(data))
            .catch(error => console.error(error));

        // Запрос на получение счетов клиента
        fetch(`http://localhost:8000/accounts/exact/${clientId}`)
            .then(response => response.json())
            .then(data => setAccounts(data))
            .catch(error => console.error(error));
    }, [clientId]); 

    const handleBack = () => {
        navigate(-1); 
    };

    const handleDetailsClick = (accountId) => {
        navigate(`/account/${accountId}`);
    };

    return (
        <Paper elevation={3} style={{ padding: 20, maxWidth: 600, margin: 'auto' }}>
            <IconButton onClick={handleBack} style={{ marginBottom: 10 }}>
                <ArrowBackIcon /> Назад
            </IconButton>
            {clientInfo && (
                <div style={{ marginBottom: 20 }}>
                    <Typography variant="h5" gutterBottom>
                        Личная информация о клиенте {clientInfo.first_name} {clientInfo.last_name}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        Email: {clientInfo.email}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        Телефон: {clientInfo.phone_number}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        Адрес: {clientInfo.address}
                    </Typography>
                </div>
            )}
            <Typography variant="h5" gutterBottom>
                Счета клиента 
            </Typography>
            <List>
                {accounts.map(account => (
                    <div key={account.account_num}>
                        <ListItem>
                            <ListItemText
                                primary={account.account_type}
                                secondary={`Баланс: ${account.account_balance} BYN`}
                            />
                            <ListItemSecondaryAction>
                                <Button onClick={() => handleDetailsClick(account.account_num)}>Подробнее</Button>
                            </ListItemSecondaryAction>
                        </ListItem>
                        <Divider />
                    </div>
                ))}
            </List>
        </Paper>
    );
};

export default ClientAccountsPage;
