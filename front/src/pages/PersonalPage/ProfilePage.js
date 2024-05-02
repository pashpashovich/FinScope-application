import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import FlagIcon from '@mui/icons-material/Flag';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import BadgeIcon from '@mui/icons-material/Badge';
import Header from "../../components/header/header"
import Footer from "../../components/footer/footer"
import index from "./personalPage.module.css";





function ProfilePage() {
  return (
    <div className={index.finance_scope}>
    <Header />
    <Box sx={{ flexGrow: 1, padding: 3 }}>
      <Grid container spacing={3}>
        {/* Left Side Navigation */}
        <Grid item xs={3}>
          <List>
            <ListItem>
              <ListItemAvatar>
                <Avatar>
                 <AccountBoxIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary="Профиль" />
            </ListItem>
            <ListItem>
              <ListItemAvatar>
                <Avatar>
                 <AccountBoxIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary="Данные" />
            </ListItem>
          </List>
        </Grid>

        {/* Main Content */}
        <Grid item xs={9}>
          <Typography variant="h4" component="h1" gutterBottom>
            Профиль pasprashovich
          </Typography>

          {/* Organization Information */}
          <Box sx={{ border: 1, borderRadius: 1, padding: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Информация об организации
            </Typography>
            <List>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <FlagIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary="Страна:" secondary="Беларусь" />
              </ListItem>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                  <LocationCityIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary="Город:" secondary="Минск" />
              </ListItem>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary="Название:" secondary="БЕЛАРУСБАНК" />
              </ListItem>
            </List>
          </Box>

          {/* Employee Information */}
          <Box sx={{ border: 1, borderRadius: 1, padding: 2 }}>
            <Typography variant="h6" gutterBottom>
              Информация о сотруднике
            </Typography>
            <List>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                  <BadgeIcon />

                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary="ФИО:" secondary="Косович Павел Владимирович" />
              </ListItem>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="Должность:" 
                  secondary="Финансовый аналитик" 
                />
              </ListItem>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="Место работы:" 
                  secondary="Головной офис, г.Минск, пр.Дзержинского, 18" 
                />
              </ListItem>
            </List>
          </Box>
        </Grid>
      </Grid>
    </Box>
    <Footer />
    </div>
  );
}

export default ProfilePage;