import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, List, ListItem, ListItemText, ListItemIcon, ListItemSecondaryAction, IconButton, Divider, Paper, Button, TextField, MenuItem, Box, AppBar, Toolbar, CssBaseline, Drawer } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import LogoutIcon from '@mui/icons-material/Logout';
import { styled } from '@mui/material/styles';
import logo from "./../../images/logo.png";

const drawerWidth = 240;

const currencies = [
  { value: 'BYN', label: 'Белорусский рубль' },
  { value: 'USD', label: 'Доллар США' },
  { value: 'EUR', label: 'Евро' },
  { value: 'RUB', label: 'Российский рубль' },
  { value: 'CNY', label: 'Китайский юань' },
];

const MenuContainer = styled(Box)({
  display: 'flex',
});

const DrawerHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  backgroundColor: '#030E32',
  color: 'white',
  justifyContent: 'center',
  fontWeight: 'bold',
}));

const StyledDrawer = styled(Drawer)({
  '.MuiDrawer-paper': {
    backgroundColor: '#030E32',
    color: 'white',
    width: drawerWidth,
  },
});

const ListItemStyled = styled(ListItem)({
  '&:hover': {
    backgroundColor: '#3A3A55',
  },
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

const MyToolbar = styled(Toolbar)({
  color: '#051139',
});

const ClientAccountsPage = () => {
  const { userID } = useParams();
  const { clientId } = useParams();
  const [clientInfo, setClientInfo] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [newAccountData, setNewAccountData] = useState({
    account_num: '',
    account_type: '',
    account_balance: '',
    currency: ' ',
    open_date: new Date().toISOString().slice(0, 10),
    account_activity: true,
    overdraft_limit: '',
    interest_rate: '',
    credit_limit: '',
    social_benefit_type: '',
  });
  const [errorText, setErrorText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:8000/clients/${clientId}`)
      .then(response => response.json())
      .then(data => setClientInfo(data))
      .catch(error => console.error(error));

    Promise.all([
      fetch(`http://localhost:8000/accounts/exact/${clientId}/socials`).then(response => response.json()),
      fetch(`http://localhost:8000/accounts/exact/${clientId}/credit`).then(response => response.json()),
      fetch(`http://localhost:8000/accounts/exact/${clientId}/savings`).then(response => response.json()),
      fetch(`http://localhost:8000/accounts/exact/${clientId}/checking`).then(response => response.json())
    ])
      .then(([socialsData, creditData, savingsData, checkingData]) => {
        setAccounts([...socialsData, ...creditData, ...savingsData, ...checkingData]);
      })
  }, [clientId]);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setNewAccountData({
      ...newAccountData,
      [name]: type === 'checkbox' ? checked : value
    });
    if (name === 'account_num') {
      checkAccountExists(value);
    }
  };

  const checkAccountExists = (accountNum) => {
    fetch(`http://localhost:8000/accounts/${accountNum}`)
      .then(response => {
        if (!response.ok) {
          setErrorText('');
          return;
        }
        throw new Error('Такой номер счета уже существует');
      })
      .catch(error => setErrorText(error.message));
  };

  const handleAddAccount = () => {
    const { account_num, account_type, account_balance, currency, overdraft_limit, interest_rate, credit_limit, social_benefit_type } = newAccountData;
    fetch('http://localhost:8000/accounts/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        account_num: account_num,
        account_type: account_type,
        account_balance: account_balance,
        currency: currency,
        overdraft_limit: overdraft_limit,
        interest_rate: interest_rate,
        credit_limit: credit_limit,
        social_benefit_type: social_benefit_type,
        open_date: new Date().toISOString().slice(0, 10),
        account_activity: true
      }),
    })
      .then(response => response.json())
      .then(data => {
        setAccounts([...accounts, data]);
        setNewAccountData({
          account_num: '',
          account_type: '',
          account_balance: '',
          currency: '',
          overdraft_limit: '',
          interest_rate: '',
          credit_limit: '',
          social_benefit_type: ''
        });
        setErrorText('');
      })
      .catch(error => console.error('Ошибка при добавлении счета:', error));
  };

  const handleDetailsClick = (accountId) => {
    navigate(`/account/${accountId}/${userID}`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleAccountTypeChange = (event) => {
    const { name, value } = event.target;
    setNewAccountData({ ...newAccountData, [name]: value });
  };

  const renderAdditionalField = () => {
    switch (newAccountData.account_type) {
      case 'checking':
        return (
          <TextField
            label="Лимит овердрафта"
            name="overdraft_limit"
            value={newAccountData.overdraft_limit}
            onChange={handleInputChange}
            variant="outlined"
            margin="normal"
            fullWidth
          />
        );
      case 'savings':
        return (
          <TextField
            label="Процентная ставка"
            name="interest_rate"
            value={newAccountData.interest_rate}
            onChange={handleInputChange}
            variant="outlined"
            margin="normal"
            fullWidth
          />
        );
      case 'credit':
        return (
          <TextField
            label="Кредитный лимит"
            name="credit_limit"
            value={newAccountData.credit_limit}
            onChange={handleInputChange}
            variant="outlined"
            margin="normal"
            fullWidth
          />
        );
      case 'socials':
        return (
          <TextField
            label="Тип социальной выплаты"
            name="social_benefit_type"
            value={newAccountData.social_benefit_type}
            onChange={handleInputChange}
            variant="outlined"
            margin="normal"
            fullWidth
          />
        );
      default:
        return null;
    }
  };

  const drawer = (
    <>
      <DrawerHeader>
        <img width={30} src={logo} alt="FinanceScope logo" />
        <Typography variant="h6">FinanceScope</Typography>
      </DrawerHeader>
      <Divider />
      <List>
        <ListItemStyled button>
          <ListItemIcon>
            <HomeIcon style={{ color: 'white' }} />
          </ListItemIcon>
          <ListItemText primary="Профиль" />
        </ListItemStyled>
        <ListItemStyled button>
          <ListItemIcon>
            <DataUsageIcon style={{ color: 'white' }} />
          </ListItemIcon>
          <ListItemText primary="Данные" />
        </ListItemStyled>
        <ListItemStyled button>
          <ListItemIcon>
            <AssessmentIcon style={{ color: 'white' }} />
          </ListItemIcon>
          <ListItemText primary="Анализ" />
        </ListItemStyled>
        <ListItemStyled button>
          <ListItemIcon>
            <ShowChartIcon style={{ color: 'white' }} />
          </ListItemIcon>
          <ListItemText primary="Графики" />
        </ListItemStyled>
        <ListItemStyled button>
          <ListItemIcon>
            <BarChartIcon style={{ color: 'white' }} />
          </ListItemIcon>
          <ListItemText primary="Отчеты" />
        </ListItemStyled>
      </List>
      <Divider />
      <List>
        <ListItemStyled button>
          <ListItemIcon>
            <LogoutIcon style={{ color: 'white' }} />
          </ListItemIcon>
          <ListItemText primary="Выход" />
        </ListItemStyled>
      </List>
    </>
  );

  return (
    <MenuContainer>
      <CssBaseline />
      <AppBar style={{ background: '#030E32' }} position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <MyToolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography  variant="h6" noWrap component="div">
            Клиенты
          </Typography>
        </MyToolbar>
      </AppBar>
      <StyledDrawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open
      >
        {drawer}
      </StyledDrawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />
        <ContentContainer>
          <Paper elevation={3} style={{ padding: 20, width: '100%' }}>
            <IconButton onClick={handleBack} style={{ marginBottom: 10 }}>
              <ArrowBackIcon /> Назад
            </IconButton>
            {clientInfo && (
              <div style={{ marginBottom: 20 }}>
                <Typography variant="h5" gutterBottom>
                  Личная информация о клиенте {clientInfo.first_name} {clientInfo.last_name}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Email: {clientInfo.user.email}
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
              {Array.isArray(accounts) && accounts.map(account => (
                <div key={account.account_num}>
                  <ListItem>
                    <ListItemText
                      primary={account.account_type}
                      secondary={`Баланс: ${account.account_balance} ${account.currency}`}
                    />
                    <ListItemSecondaryAction>
                      <Button onClick={() => handleDetailsClick(account.account_num)}>Подробнее</Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                </div>
              ))}
            </List>
            <Typography variant="h5" gutterBottom>
              Добавить счет
            </Typography>
            <TextField
              label="Номер счета"
              name="account_num"
              value={newAccountData.account_num}
              onChange={handleInputChange}
              variant="outlined"
              margin="normal"
              error={!!errorText}
              helperText={errorText}
              fullWidth
            />
            <TextField
              select
              label="Тип счета"
              name="account_type"
              value={newAccountData.account_type}
              onChange={handleAccountTypeChange}
              variant="outlined"
              margin="normal"
              fullWidth
            >
              <MenuItem value="checking">Текущий</MenuItem>
              <MenuItem value="savings">Депозит</MenuItem>
              <MenuItem value="credit">Кредит</MenuItem>
              <MenuItem value="socials">Социальный</MenuItem>
            </TextField>
            <TextField
              label="Баланс"
              name="account_balance"
              value={newAccountData.account_balance}
              onChange={handleInputChange}
              variant="outlined"
              margin="normal"
              fullWidth
            />
            <TextField
              select
              label="Валюта"
              name="currency"
              value={newAccountData.currency}
              onChange={handleInputChange}
              variant="outlined"
              margin="normal"
              fullWidth
            >
              {currencies.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            {renderAdditionalField()}
            <Button onClick={handleAddAccount} variant="contained" color="primary" style={{ marginTop: 20 }}>
              Добавить счет
            </Button>
          </Paper>
        </ContentContainer>
      </Box>
    </MenuContainer>
  );
};

export default ClientAccountsPage;
