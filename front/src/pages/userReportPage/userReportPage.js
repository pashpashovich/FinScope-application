import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Button, AppBar, Toolbar, CssBaseline, IconButton, Avatar, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import Drawer from '@mui/material/Drawer';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LogoutIcon from '@mui/icons-material/Logout';
import Menu from '../../components/verticalMenu/ClientMenu';
import TrPlot from '../../components/charts/transactionsByMonth';
import axios from 'axios';

const drawerWidth = 240;

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

const MyToolbar = styled(Toolbar)({
  color: '#051139',
});

const UserReportPage = () => {
  const { userID } = useParams();
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    Promise.all([
        fetch(`http://localhost:8000/accounts/exact/${userID}/socials`).then(response => response.json()),
        fetch(`http://localhost:8000/accounts/exact/${userID}/credit`).then(response => response.json()),
        fetch(`http://localhost:8000/accounts/exact/${userID}/savings`).then(response => response.json()),
        fetch(`http://localhost:8000/accounts/exact/${userID}/checking`).then(response => response.json())
      ])
      .then(([socialsData, creditData, savingsData, checkingData]) => {
        const combinedAccounts = [...socialsData, ...creditData, ...savingsData, ...checkingData];
        setAccounts(combinedAccounts);
        if (combinedAccounts.length > 0 && !selectedAccount) {
          setSelectedAccount(combinedAccounts[0].id);
        }
      });
  }, [userID, selectedAccount]); 

  useEffect(() => {
    if (selectedAccount && selectedMonth) {
      axios.get(`http://localhost:8000/transactions/${selectedAccount}/${selectedMonth}/stats`)
        .then(response => {
          setData(response.data);
        })
        .catch(error => {
          console.error('Error fetching transaction data:', error);
        });
    }
    console.log(data)
  }, [selectedAccount, selectedMonth]);

  const handleLogout = () => {
    axios.post('http://localhost:8000/api/logout').then(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      navigate('/login');
    }).catch(error => {
      console.error('Error during logout:', error);
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <MenuContainer>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, background: '#030E32' }}>
        <MyToolbar>
          <IconButton edge="start" color="inherit" onClick={handleBack}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Отчетность
          </Typography>
          <IconButton edge="end" color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </MyToolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backgroundColor: '#030E32', color: 'white' },
        }}
        open
      >
        <Menu userID={userID} />
      </Drawer>
      <ContentContainer>
        <Toolbar />
        <Paper elevation={3} sx={{ padding: 2, width: '100%', mt: 3 }}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Счет</InputLabel>
            <Select
              value={selectedAccount || ''}
              onChange={e => setSelectedAccount(e.target.value)}
            >
              {accounts.map(account => (
                <MenuItem key={account.account_num} value={account.account_num}>
                  {account.account_num}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Месяц </InputLabel>
            <Select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
            >
             {Array.from({ length: 12 }, (_, i) => (
                <MenuItem key={i} value={i + 1}>
                  {`${i + 1} месяц`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TrPlot data={data} />
          <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={() => {
            // Trigger a re-fetch of the data when the user wants to refresh the stats
            axios.get(`http://localhost:8000/api/transactions/${selectedAccount}/${selectedMonth}/stats`)
              .then(response => {
                setData(response.data);
              })
              .catch(error => {
                console.error('Error refreshing transaction data:', error);
              });
          }}>
            Обновить данные
          </Button>
        </Paper>
      </ContentContainer>
    </MenuContainer>
  );
};

export default UserReportPage;
