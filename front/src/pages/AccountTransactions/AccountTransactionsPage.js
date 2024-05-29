import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import {
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    TextField,
    Button,
    Box,
    Divider,
    useMediaQuery,
    useTheme,
    MenuItem,
    Select,
    FormControl,
    InputLabel
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { styled } from '@mui/material/styles';
import Menu from '../../components/verticalMenu/menu';

axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;

const FormContainer = styled(Paper)({
    padding: 20,
    maxWidth: 800,
    margin: 'auto',
    marginTop: 20,
    '@media (max-width: 600px)': {
        padding: 10,
        marginTop: 10,
    },
});

const AccountTransactionsPage = () => {
    const { accountID } = useParams();
    const [accountInfo, setAccountInfo] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [convertedBalance, setConvertedBalance] = useState(null);
    const [selectedCurrency, setSelectedCurrency] = useState('USD'); // Начальная валюта
    const [newTransactionData, setNewTransactionData] = useState({
        sender_account: '',
        recipient_account: '',
        amount: '',
        transaction_type: 'deposit'
    });
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const apiUrl = 'http://localhost:8000/accounts';

    useEffect(() => {
        Promise.any([
            axios.get(`${apiUrl}/${accountID}/socials`).then(response => response.data),
            axios.get(`${apiUrl}/${accountID}/credit`).then(response => response.data),
            axios.get(`${apiUrl}/${accountID}/savings`).then(response => response.data),
            axios.get(`${apiUrl}/${accountID}/checking`).then(response => response.data)
        ])
        .then((data) => {
            setAccountInfo(data);
            fetchConvertedBalance(data.account_balance.toString(), data.currency, selectedCurrency);
        })
        .catch(error => console.error(error));

        fetch(`http://localhost:8000/transactions/${accountID}`)
        .then(response => response.json())
        .then(data => setTransactions(data))
        .catch(error => console.error(error));
    }, [accountID]);

    const fetchConvertedBalance = async (balance, fromCurrency, toCurrency) => {
        try {
            const response = await axios.get(`http://localhost:8000/accounts/convert/${balance}/${fromCurrency}/${toCurrency}/`);
            setConvertedBalance(response.data[toCurrency]);
        } catch (error) {
            console.error('Error fetching converted balance:', error);
        }
    };

    const handleCurrencyChange = (event) => {
        const newCurrency = event.target.value;
        setSelectedCurrency(newCurrency);
        if (accountInfo) {
            fetchConvertedBalance(accountInfo.account_balance, accountInfo.currency, newCurrency);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setNewTransactionData({ ...newTransactionData, [name]: value });
    };

    const handleAddTransaction = () => {
        const { amount, sender_account, transaction_type, recipient_account } = newTransactionData;
        const transactionData = {
            sender_account: '',
            recipient_account: '',
            amount: amount,
            transaction_type: transaction_type,
        };
        if (transaction_type === 'transfer') {
            transactionData.sender_account = accountID;
            transactionData.recipient_account = recipient_account;
        }
        if (transaction_type === 'deposit') {
            transactionData.sender_account = '';
            transactionData.recipient_account = accountID;
        }

        if (transaction_type === 'withdrawal') {
            transactionData.sender_account = accountID;
        }

        axios.post('http://localhost:8000/transactions/', transactionData)
            .then(response => {
                setTransactions([...transactions, response.data]);
                setNewTransactionData({
                    sender_account: '',
                    recipient_account: '',
                    amount: '',
                    transaction_type: 'deposit'
                });
                Promise.any([
                    axios.get(`${apiUrl}/${accountID}/socials`).then(response => response.data),
                    axios.get(`${apiUrl}/${accountID}/credit`).then(response => response.data),
                    axios.get(`${apiUrl}/${accountID}/savings`).then(response => response.data),
                    axios.get(`${apiUrl}/${accountID}/checking`).then(response => response.data)
                ])
            })
            .catch(error => console.error('Ошибка при добавлении транзакции:', error));
    };

    const renderAdditionalAccountInfo = () => {
        if (!accountInfo) return null;

        switch (accountInfo.account_type) {
            case 'Текущий счет':
                return (
                    <Typography variant="body1" gutterBottom>
                        Лимит овердрафта: {accountInfo.overdraft_limit} BYN
                    </Typography>
                );
            case 'Сберегательный счет':
                return (
                    <Typography variant="body1" gutterBottom>
                        Процентная ставка: {accountInfo.interest_rate}%
                    </Typography>
                );
            case 'Кредитный счет':
                return (
                    <Typography variant="body1" gutterBottom>
                        Кредитный лимит: {accountInfo.credit_limit} BYN
                    </Typography>
                );
            case 'Социальный счет':
                return (
                    <Typography variant="body1" gutterBottom>
                        Социальные выплаты: {accountInfo.social_payments ? "Включены" : "Отключены"}
                    </Typography>
                );
            default:
                return null;
        }
    };

    return (
        <div>
            <Menu />
            <FormContainer elevation={3}>
                <Box display="flex" alignItems="center" marginBottom={2}>
                    <IconButton onClick={handleBack}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" marginLeft={1}>Назад</Typography>
                </Box>
                {accountInfo && (
                    <Box marginBottom={3}>
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
                            Баланс: {convertedBalance ? convertedBalance.toFixed(2) : accountInfo.account_balance} {selectedCurrency}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            Дата открытия: {accountInfo.open_date}
                        </Typography>
                        {renderAdditionalAccountInfo()}
                        <FormControl variant="outlined" margin="normal" fullWidth>
                            <InputLabel>Валюта</InputLabel>
                            <Select
                                value={selectedCurrency}
                                onChange={handleCurrencyChange}
                                label="Валюта"
                            >
                                <MenuItem value="USD">USD</MenuItem>
                                <MenuItem value="EUR">EUR</MenuItem>
                                <MenuItem value="RUB">RUB</MenuItem>
                                <MenuItem value="CNY">CNY</MenuItem>
                                <MenuItem value="BYN">BYN</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                )}
                <Divider />
                <Box marginTop={3}>
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
                </Box>
                <Box marginTop={3}>
                    <Typography variant="h5" gutterBottom>
                        Добавить транзакцию
                    </Typography>
                    <FormControl variant="outlined" margin="normal" fullWidth>
                        <InputLabel>Тип транзакции</InputLabel>
                        <Select
                            name="transaction_type"
                            value={newTransactionData.transaction_type}
                            onChange={handleInputChange}
                            label="Тип транзакции"
                        >
                            <MenuItem value="deposit">Начисление</MenuItem>
                            <MenuItem value="withdrawal">Снятие</MenuItem>
                            <MenuItem value="transfer">Перевод</MenuItem>
                        </Select>
                    </FormControl>
                    {newTransactionData.transaction_type === 'transfer' && (
                        <TextField
                            label="Номер счета получателя"
                            name="recipient_account"
                            value={newTransactionData.recipient_account}
                            onChange={handleInputChange}
                            variant="outlined"
                            margin="normal"
                            fullWidth
                        />
                    )}
                    <TextField
                        label="Сумма"
                        name="amount"
                        value={newTransactionData.amount}
                        onChange={handleInputChange}
                        variant="outlined"
                        margin="normal"
                        fullWidth
                    />
                    <Button
                        onClick={handleAddTransaction}
                        variant="contained"
                        color="primary"
                        fullWidth={isMobile}
                        style={{ marginTop: 20 }}
                    >
                        Добавить транзакцию
                    </Button>
                </Box>
            </FormContainer>
        </div>
    );
};

export default AccountTransactionsPage;
