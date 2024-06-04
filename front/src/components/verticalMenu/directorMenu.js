import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LogoutIcon from '@mui/icons-material/Logout';
import logo from './../../images/logo.png';

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

const BankDirectorMenu = ({ userID }) => {  
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <>
      <DrawerHeader>
        <img width={30} src={logo} alt="FinanceScope logo" />
        <Typography variant="h6">FinanceScope</Typography>
      </DrawerHeader>
      <Divider />
      <List>
        <ListItemStyled button component={Link} to={`/profileDir/${userID}`}>
          <ListItemIcon>
            <HomeIcon style={{ color: 'white' }} />
          </ListItemIcon>
          <ListItemText primary="Профиль" />
        </ListItemStyled>
        <ListItemStyled button component={Link} to={`/director/users/${userID}`}>
          <ListItemIcon>
            <PeopleIcon style={{ color: 'white' }} />
          </ListItemIcon>
          <ListItemText primary="Пользователи" />
        </ListItemStyled>
        <ListItemStyled button component={Link} to={`/director/reports/${userID}`}>
          <ListItemIcon>
            <AssessmentIcon style={{ color: 'white' }} />
          </ListItemIcon>
          <ListItemText primary="Отчетность" />
        </ListItemStyled>
      </List>
    </>
  );

  return (
    <MenuContainer>
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <StyledDrawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, 
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
          }}
        >
          {drawer}
        </StyledDrawer>
        <StyledDrawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
          }}
          open
        >
          {drawer}
        </StyledDrawer>
      </Box>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        onClick={handleDrawerToggle}
        sx={{ mr: 2, display: { sm: 'none' } }}
      >
        <MenuIcon />
      </IconButton>
    </MenuContainer>
  );
};

export default BankDirectorMenu;