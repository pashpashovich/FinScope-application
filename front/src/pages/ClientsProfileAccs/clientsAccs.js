import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, List, ListItem, ListItemText, ListItemIcon, Button, ListItemSecondaryAction, IconButton, Divider, Paper, Box, AppBar, Toolbar, CssBaseline, Drawer, Avatar } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuIcon from '@mui/icons-material/Menu';
import { styled } from '@mui/material/styles';
import Menu from '../../components/verticalMenu/ClientMenu';

const drawerWidth = 240;

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
          <Typography variant="h6" noWrap component="div">
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
        <Menu  userID={userID} />
      </StyledDrawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />
        <ContentContainer>
          <Paper elevation={3} style={{ padding: 20, width: '100%' }}>
            <IconButton onClick={handleBack} style={{ marginBottom: 10 }}>
              <ArrowBackIcon /> Назад
            </IconButton>
            {clientInfo && (
              <div style={{ marginBottom: 20, textAlign: 'center' }}>
                <Avatar
                  alt={clientInfo.first_name}
                  src={clientInfo.user.avatar || "/static/images/avatar/1.jpg"}
                  style={{ width: 120, height: 120, margin: '0 auto', marginBottom: 20 }}
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
          </Paper>
        </ContentContainer>
      </Box>
    </MenuContainer>
  );
};

export default ClientProfilePage;
