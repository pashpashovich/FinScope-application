import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const AccountTransactionsPage = () => {
    const { accountID } = useParams();
    console.log(accountID);

    const [accountInfo, setAccountInfo] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Запрос на получение информации о счете
        fetch(`http://localhost:8000/accounts/${accountID}`)
            .then(response => response.json())
            .then(data => setAccountInfo(data))
            .catch(error => console.error(error));

        // Запрос на получение транзакций для указанного счета
        fetch(`http://localhost:8000/transactions/${accountID}`)
            .then(response => response.json())
            .then(data => setTransactions(data))
            .catch(error => console.error(error));
    }, [accountID]);

    const handleBack = () => {
        navigate(-1); 
    };

    return (
        <Paper elevation={3} style={{ padding: 20, maxWidth: 800, margin: 'auto' }}>
            <IconButton onClick={handleBack} style={{ marginBottom: 10 }}>
                <ArrowBackIcon /> Назад
            </IconButton>
            {accountInfo && (
                <div>
                    <Typography variant="h5" gutterBottom>
                        Информация о счете {accountID}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        Номер счета: {accountInfo.account_num}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        Тип счета: {accountInfo.account_type}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        Баланс: {accountInfo.account_balance} BYN
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        Дата открытия: {accountInfo.open_date}
                    </Typography>
                </div>
            )}
            <Typography variant="h5" gutterBottom>
                Транзакции счета {accountID}
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Время</TableCell>
                            <TableCell>Тип</TableCell>
                            <TableCell>Сумма</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {transactions.map(transaction => (
                            <TableRow key={transaction.id}>
                                <TableCell>{transaction.transaction_time}</TableCell>
                                <TableCell>{transaction.transaction_type}</TableCell>
                                <TableCell>{transaction.amount}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default AccountTransactionsPage;
