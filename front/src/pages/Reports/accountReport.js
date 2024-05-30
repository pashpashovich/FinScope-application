import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Box, AppBar, Toolbar, IconButton, Typography, CssBaseline, Avatar, TextField } from '@mui/material';
import { styled } from '@mui/system';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate, useParams } from 'react-router-dom';
import Menu from '../../components/verticalMenu/menu';
import axios from 'axios';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ruLocale from 'date-fns/locale/ru';

const apiUrl = 'http://localhost:8000/transactions/';
const pdfUrl = 'http://localhost:8000/transactions/generate-pdf/';
const profileUrl = 'http://localhost:8000/api/';

const StyledBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
  padding: '20px',
  backgroundColor: '#f5f5f5',
});

const Header = styled(AppBar)({
  zIndex: 1300,
  backgroundColor: '#030E32',
});

const MyToolbar = styled(Toolbar)({
  color: '#051139', 
});

const DateContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '20px',
});

const TransactionsReport = () => {
  const { userID } = useParams();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [userData, setUserData] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'sender_account', headerName: 'Счет отправителя', width: 130 },
    { field: 'recipient_account', headerName: 'Счет получателя', width: 130 },
    { field: 'amount', headerName: 'Сумма', width: 130 },
    { field: 'transaction_time', headerName: 'Дата', width: 150 },
    { field: 'transaction_type', headerName: 'Тип', width: 130 },
  ];

  useEffect(() => {
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => setTransactions(data))
      .catch(error => console.error('Ошибка при загрузке транзакций:', error));

    axios.get(`${profileUrl}${userID}/`, {
      withCredentials: true
    })
      .then((response) => {
        setUserData(response.data);
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
      });
  }, [userID]);

  const downloadPDF = () => {
    fetch(`${pdfUrl}?start_date=${startDate ? startDate.toISOString().split('T')[0] : ''}&end_date=${endDate ? endDate.toISOString().split('T')[0] : ''}`)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'transactions_report.pdf');
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      })
      .catch(error => console.error('Ошибка при загрузке PDF:', error));
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

  const handleDateChange = () => {
    fetch(`${apiUrl}?start_date=${startDate ? startDate.toISOString().split('T')[0] : ''}&end_date=${endDate ? endDate.toISOString().split('T')[0] : ''}`)
      .then(response => response.json())
      .then(data => setTransactions(data))
      .catch(error => console.error('Ошибка при загрузке транзакций:', error));
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Menu userID={userID} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Header position="fixed">
          <MyToolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography style={{ color: 'white' }} variant="h6" noWrap component="div">
              Анализ
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton edge="start" color="inherit" onClick={() => navigate(-1)} sx={{ mr: 2 }}>
                <ArrowBackIcon />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {userData && (
                <Avatar
                  alt={userData.first_name}
                  src={userData.avatar || "/static/images/avatar/1.jpg"}
                  sx={{ width: 40, height: 40, mr: 2 }}
                />
              )}
              <IconButton onClick={handleLogout}>
                <LogoutIcon style={{ color: 'white' }} />
              </IconButton>
            </Box>
          </MyToolbar>
        </Header>
        <Toolbar />
        <StyledBox>
          <DateContainer>
            <LocalizationProvider dateAdapter={AdapterDateFns} locale={ruLocale}>
              <DatePicker
                label="Начальная дата"
                value={startDate}
                onChange={(date) => setStartDate(date)}
                renderInput={(params) => <TextField {...params} />}
              />
              <DatePicker
                label="Конечная дата"
                value={endDate}
                onChange={(date) => setEndDate(date)}
                renderInput={(params) => <TextField {...params} />}
              />
              <Button variant="contained" color="primary" onClick={handleDateChange}>
                Применить
              </Button>
            </LocalizationProvider>
          </DateContainer>
          <Box sx={{ marginBottom: 2 }}>
            <Button variant="contained" color="primary" onClick={downloadPDF}>
              Скачать отчет в PDF
            </Button>
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <DataGrid
              rows={transactions}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 20, 50]}
              disableSelectionOnClick
              autoHeight
            />
          </Box>
        </StyledBox>
      </Box>
    </Box>
  );
};

export default TransactionsReport;
