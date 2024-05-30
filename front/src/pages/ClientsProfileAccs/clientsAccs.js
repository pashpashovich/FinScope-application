import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, List, ListItem, ListItemText, Button, ListItemSecondaryAction, IconButton, Divider, Paper, Box, AppBar, Toolbar, CssBaseline, Drawer, Avatar } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LogoutIcon from '@mui/icons-material/Logout';
import { styled } from '@mui/material/styles';
import Menu from '../../components/verticalMenu/ClientMenu';
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

const ClientProfilePage = () => {
  const { userID } = useParams();
  const [clientInfo, setClientInfo] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:8000/clients/${userID}`)
      .then(response => response.json())
      .then(data => setClientInfo(data))
      .catch(error => console.error(error));

    Promise.all([
      fetch(`http://localhost:8000/accounts/exact/${userID}/socials`).then(response => response.json()),
      fetch(`http://localhost:8000/accounts/exact/${userID}/credit`).then(response => response.json()),
      fetch(`http://localhost:8000/accounts/exact/${userID}/savings`).then(response => response.json()),
      fetch(`http://localhost:8000/accounts/exact/${userID}/checking`).then(response => response.json())
    ])
      .then(([socialsData, creditData, savingsData, checkingData]) => {
        setAccounts([...socialsData, ...creditData, ...savingsData, ...checkingData]);
      });
  }, [userID]);

  const handleDetailsClick = (accountId) => {
    navigate(`/ClAccs/${accountId}/${userID}`);
  };

  const handleBack = () => {
    navigate(-1);
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
    <MenuContainer>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, background: '#030E32' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6" noWrap component="div">
            Счета
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {clientInfo && (
              <Avatar
                alt={clientInfo.first_name}
                src={clientInfo.user.avatar || "/static/images/avatar/1.jpg"}
                sx={{ width: 40, height: 40 }}
              />
            )}
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
        <Menu userID={userID} />
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />
        <ContentContainer>
          <Paper elevation={3} sx={{ padding: 2, width: '100%' }}>
            <IconButton onClick={handleBack} sx={{ marginBottom: 1 }}>
              <ArrowBackIcon /> Назад
            </IconButton>
            {clientInfo && (
              <Box sx={{ marginBottom: 2, textAlign: 'center' }}>
                <Avatar
                  alt={clientInfo.first_name}
                  src={clientInfo.user.avatar || "/static/images/avatar/1.jpg"}
                  sx={{ width: 120, height: 120, margin: '0 auto', marginBottom: 2 }}
                />
                <Typography variant="h5" gutterBottom>
                  {clientInfo.first_name} {clientInfo.last_name}
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
              </Box>
            )}
            <Typography variant="h5" gutterBottom>
              Счета клиента
            </Typography>
            <List>
              {Array.isArray(accounts) && accounts.map(account => (
                <Box key={account.account_num}>
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
                </Box>
              ))}
            </List>
          </Paper>
        </ContentContainer>
      </Box>
    </MenuContainer>
  );
};

export default ClientProfilePage;
