import React, { useState, useEffect } from "react";
import { Box, AppBar, Avatar, Toolbar, IconButton, Typography, CssBaseline, MenuItem, Select, FormControl, InputLabel, Container } from '@mui/material';
import { styled } from '@mui/system';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import Menu from '../../components/verticalMenu/menu';
import AccountDistributionChart from '../../components/charts/accTypes';
import TransactionsByDateChart from '../../components/charts/transactionsByDateChart';
import ClientsAccountsChart from "../../components/charts/clientsAccountsChart";
import BoxPlotChart from '../../components/charts/boxPlotCharts'; 
import LogoutIcon from '@mui/icons-material/Logout';
import axios from 'axios';

const apiUrl2 = 'http://localhost:8000/clients/financial-analyst/';

const Header = styled(AppBar)({
  zIndex: 1300,
  backgroundColor: '#030E32',
});

const StyledBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
  padding: '20px',
  backgroundColor: '#f5f5f5',
});

const HeaderAvatar = styled(Avatar)({
  width: 40,
  height: 40,
});

const Analytics = () => {
  const [avatarUrl, setAvatarUrl] = useState('');
  const { userID } = useParams();
  const navigate = useNavigate();
  const [chartType, setChartType] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [transactionsByDate, setTransactionsByDate] = useState([]);
  const [transactionType, setTransactionType] = useState(''); 

  useEffect(() => {
    if (!dataLoaded) {
      Promise.all([
        fetch(`http://localhost:8000/accounts/socials`).then(response => response.json()),
        fetch(`http://localhost:8000/accounts/credit`).then(response => response.json()),
        fetch(`http://localhost:8000/accounts/savings`).then(response => response.json()),
        fetch(`http://localhost:8000/accounts/checking`).then(response => response.json())
      ])
        .then(([socialsData, creditData, savingsData, checkingData]) => {
          setAccounts([...socialsData, ...creditData, ...savingsData, ...checkingData]);
          setDataLoaded(true);
        })
        .catch(error => {
          console.error('Ошибка при загрузке данных:', error);
          setDataLoaded(true);
        });
    }
    axios.get(`${apiUrl2}${userID}/`)
    .then((response) => {
      setAvatarUrl(response.data.user.avatar);
    })
    .catch((error) => console.error('Error fetching avatar:', error));
  }, [dataLoaded]);

  useEffect(() => {
    if (chartType === 'transactionsByDate' && startDate && endDate) {
      fetchTransactionsByDate();
    }
  }, [chartType, startDate, endDate]);

  const fetchTransactionsByDate = () => {
    fetch(`http://localhost:8000/transactions/date-range/?start_date=${startDate}&end_date=${endDate}`)
      .then(response => response.json())
      .then(data => setTransactionsByDate(data))
      .catch(error => console.error('Ошибка при загрузке транзакций:', error));
  };

  const handleChartTypeChange = (event) => {
    setChartType(event.target.value);
  };

  const renderChart = () => {
    switch (chartType) {
      case 'accountDistribution':
        return <AccountDistributionChart accounts={accounts} />;
      case 'transactionsByDate':
        return (
          <TransactionsByDateChart
            transactions={transactionsByDate}
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            fetchTransactionsByDate={fetchTransactionsByDate}
          />
        );
      case 'clientsAccounts':
        return <ClientsAccountsChart />;
      case 'boxPlotChart': 
        return (
          <BoxPlotChart
            startDate={startDate}
            endDate={endDate}
            transactionType={transactionType}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            setTransactionType={setTransactionType}
          />
        );
      default:
        return <Typography variant="h6">Пожалуйста, выберите тип графика</Typography>;
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

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Menu userID={userID} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <AppBar style={{ background: '#030E32' }} position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" noWrap component="div">
              Графики
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
        <StyledBox>
          <Container maxWidth="md">
            <Box sx={{ marginBottom: 2 }}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Тип графика</InputLabel>
                <Select
                  value={chartType}
                  onChange={handleChartTypeChange}
                  label="Тип графика"
                >
                  <MenuItem value="accountDistribution">Распределение счетов</MenuItem>
                  <MenuItem value="transactionsByDate">Транзакции по дате</MenuItem>
                  <MenuItem value="clientsAccounts">Доходы клиентов и балансы их счетов</MenuItem>
                  <MenuItem value="boxPlotChart">Коробчатый график транзакций</MenuItem> {/* новый пункт меню */}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ marginTop: 4 }}>
              {renderChart()}
            </Box>
          </Container>
        </StyledBox>
      </Box>
    </Box>
  );
};

export default Analytics;
