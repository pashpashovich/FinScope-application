import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, TextField, Button, Box, Divider, FormControl, InputLabel, Select, MenuItem, CssBaseline, AppBar, Toolbar, Avatar, Drawer, useMediaQuery, Grid } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LogoutIcon from '@mui/icons-material/Logout';
import { styled, useTheme } from '@mui/material/styles';
import ClientMenu from '../../components/verticalMenu/ClientMenu';

axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;

const drawerWidth = 240;

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

const HeaderAvatar = styled(Avatar)({
    width: 40,
    height: 40,
});

const MenuContainer = styled(Box)({
    display: 'flex',
});

const ContentContainer = styled(Box)({
    flexGrow: 1,
    p: 3,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: 800,
    margin: '0 auto',
    boxSizing: 'border-box',
});

const AccountTransactionsPage = () => {
    const { userID, accountID } = useParams();
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [accountInfo, setAccountInfo] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [convertedBalance, setConvertedBalance] = useState(null);
    const [selectedCurrency, setSelectedCurrency] = useState('BYN');
    const [transactionCurrency, setTransactionCurrency] = useState('BYN');
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        transactionType: '',
        currency: ''
    });
    const [newTransactionData, setNewTransactionData] = useState({
        sender_account: '',
        recipient_account: '',
        amount: '',
        transaction_type: 'withdrawal'
    });
    const navigate = useNavigate();
    const apiUrl = 'http://localhost:8000/accounts';
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
        .then(data => {
            setTransactions(data);
            setFilteredTransactions(data);
        })
        .catch(error => console.error(error));

        fetch(`http://localhost:8000/clients/${userID}`)
        .then(response => response.json())
        .then(data => {
            setAvatarUrl(data.user.avatar);
        })
        .catch(error => console.error('Ошибка при получении данных клиента:', error));
    }, [accountID, selectedCurrency, userID]);

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

    const handleTransactionCurrencyChange = (event) => {
        setTransactionCurrency(event.target.value);
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setNewTransactionData({ ...newTransactionData, [name]: value });
    };

    const handleAddTransaction = async () => {
        const { amount, transaction_type, recipient_account } = newTransactionData;
        const transactionData = {
            sender_account: accountID,
            recipient_account: '',
            amount: amount,
            transaction_type: transaction_type,
            currency: transactionCurrency
        };
        if (transaction_type === 'transfer') {
            transactionData.recipient_account = recipient_account;
        }

        try {
            const response = await axios.post('http://localhost:8000/transactions/', transactionData);
            setTransactions([...transactions, response.data]);
            setFilteredTransactions([...transactions, response.data]);
            setNewTransactionData({
                sender_account: '',
                recipient_account: '',
                amount: '',
                transaction_type: 'withdrawal',
                currency: 'BYN',
            });
            await generateReceipt(response.data.id);  
            window.location.reload();
        } catch (error) {
            console.error('Ошибка при добавлении транзакции:', error);
        }
    };

    const generateReceipt = async (transactionId) => {
        try {
            const response = await axios.get(`http://localhost:8000/transactions/receipt/${transactionId}/`);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `receipt_${transactionId}.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error('Ошибка при создании чека:', error);
        }
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

    const handleLogout = () => {
        axios.post('http://localhost:8000/api/logout', {},)
            .then(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('userRole');
                navigate('/login');
            })
            .catch((error) => console.error('Error during logout:', error));
    };

    const handleFilterChange = (event) => {
        const { name, value } = event.target;
        setFilters({ ...filters, [name]: value });
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    useEffect(() => {
        let filteredData = transactions;

        if (filters.transactionType) {
            filteredData = filteredData.filter(transaction => transaction.transaction_type === filters.transactionType);
        }

        if (filters.currency) {
            filteredData = filteredData.filter(transaction => transaction.currency === filters.currency);
        }

        if (searchQuery) {
            filteredData = filteredData.filter(transaction => 
                transaction.transaction_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                transaction.amount.toString().toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredTransactions(filteredData);
    }, [filters, searchQuery, transactions]);

    return (
        <MenuContainer>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, background: '#030E32' }}>
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" noWrap component="div">
                        Транзакции
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <HeaderAvatar alt={'Ooo'} src={avatarUrl || "/static/images/avatar/1.jpg"} />
                        <IconButton onClick={handleLogout}>
                            <LogoutIcon style={{ color: 'white' }} />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backgroundColor: '#030E32', color: 'white' },
                }}
                open
            >
                <ClientMenu userID={userID} />
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
                <Toolbar />
                <ContentContainer>
                    <FormContainer elevation={3}>
                        <IconButton onClick={handleBack} sx={{ color: 'grey' }}>
                            <ArrowBackIcon /> Назад
                        </IconButton>
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
                        <Box marginTop={3} width="100%">
                            <Typography variant="h5" gutterBottom>
                                Транзакции счета {accountID}
                            </Typography>
                            <Grid container spacing={2} marginBottom={3}>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        label="Поиск"
                                        variant="outlined"
                                        fullWidth
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <FormControl variant="outlined" fullWidth>
                                        <InputLabel>Тип транзакции</InputLabel>
                                        <Select
                                            name="transactionType"
                                            value={filters.transactionType}
                                            onChange={handleFilterChange}
                                            label="Тип транзакции"
                                        >
                                            <MenuItem value="">Все</MenuItem>
                                            <MenuItem value="withdrawal">Снятие</MenuItem>
                                            <MenuItem value="transfer">Перевод</MenuItem>
                                            <MenuItem value="deposit">Депозит</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <FormControl variant="outlined" fullWidth>
                                        <InputLabel>Валюта</InputLabel>
                                        <Select
                                            name="currency"
                                            value={filters.currency}
                                            onChange={handleFilterChange}
                                            label="Валюта"
                                        >
                                            <MenuItem value="">Все</MenuItem>
                                            <MenuItem value="USD">USD</MenuItem>
                                            <MenuItem value="EUR">EUR</MenuItem>
                                            <MenuItem value="RUB">RUB</MenuItem>
                                            <MenuItem value="CNY">CNY</MenuItem>
                                            <MenuItem value="BYN">BYN</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Время</TableCell>
                                            <TableCell>Тип</TableCell>
                                            <TableCell>Сумма</TableCell>
                                            <TableCell>Валюта</TableCell>
                                            <TableCell>Чек</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredTransactions.map(transaction => (
                                            <TableRow key={transaction.id}>
                                                <TableCell>{new Date(transaction.transaction_time).toLocaleString('ru-BY', { timeZone: 'Europe/Minsk' })}</TableCell>
                                                <TableCell>{transaction.transaction_type}</TableCell>
                                                <TableCell>{transaction.amount}</TableCell>
                                                <TableCell>{transaction.currency}</TableCell>
                                                <TableCell>
                                                    <Button variant="contained" color="primary" onClick={() => generateReceipt(transaction.id)}>
                                                        Скачать чек
                                                    </Button>
                                                </TableCell>
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
                            <FormControl variant="outlined" margin="normal" fullWidth>
                                <InputLabel>Валюта</InputLabel>
                                <Select
                                    value={transactionCurrency}
                                    onChange={handleTransactionCurrencyChange}
                                    label="Валюта"
                                >
                                    <MenuItem value="USD">USD</MenuItem>
                                    <MenuItem value="EUR">EUR</MenuItem>
                                    <MenuItem value="RUB">RUB</MenuItem>
                                    <MenuItem value="CNY">CNY</MenuItem>
                                    <MenuItem value="BYN">BYN</MenuItem>
                                </Select>
                            </FormControl>
                            <Button
                                onClick={handleAddTransaction}
                                variant="contained"
                                color="primary"
                                fullWidth
                                style={{ marginTop: 20 }}
                            >
                                Добавить транзакцию
                            </Button>
                        </Box>
                    </FormContainer>
                </ContentContainer>
            </Box>
        </MenuContainer>
    );
};

export default AccountTransactionsPage;
