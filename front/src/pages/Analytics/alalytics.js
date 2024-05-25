import React, { useState, useEffect } from "react";
import { Box, AppBar, Toolbar, IconButton, Typography, CssBaseline, MenuItem, Select, FormControl, InputLabel, Container } from '@mui/material';
import { styled } from '@mui/system';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import Menu from '../../components/verticalMenu/menu';
import AccountDistributionChart from '../../components/charts/accTypes';
import TransactionsByDateChart from '../../components/charts/transactionsByDateChart';
import ClientsAccountsChart from "../../components/charts/clientsAccountsChart";

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

const Analytics = () => {
  const { userID } = useParams();
  const navigate = useNavigate();
  const [chartType, setChartType] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [transactionsByDate, setTransactionsByDate] = useState([]);

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
      default:
        return <Typography variant="h6">Пожалуйста, выберите тип графика</Typography>;
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Menu userID={userID} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Header position="fixed">
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={() => navigate(-1)} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Графики
            </Typography>
          </Toolbar>
        </Header>
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
