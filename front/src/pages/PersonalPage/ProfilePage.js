import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import FlagIcon from '@mui/icons-material/Flag';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import BadgeIcon from '@mui/icons-material/Badge';
import { styled } from '@mui/material/styles';
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import Menu from '../../components/verticalMenu/menu';
import { useParams } from 'react-router-dom';


const StyledListItem = styled(ListItem)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: theme.palette.primary.light,
  },
}));

function ProfilePage() {
  const { id } = useParams();
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    axios.get('financial-analyst/<int:pk>/')
      .then(response => {
        setProfileData(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the profile data!', error);
      });
  }, []);

  if (!profileData) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <div>
      <Menu />
      <Box sx={{ flexGrow: 1, padding: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={9}>
            <Typography variant="h4" component="h1" gutterBottom>
              Профиль {profileData.username}
            </Typography>
            <Box sx={{ border: 1, borderRadius: 1, padding: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Информация об организации
              </Typography>
              <List>
                <StyledListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <FlagIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary="Страна:" secondary={profileData.country} />
                </StyledListItem>
                <StyledListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <LocationCityIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary="Город:" secondary={profileData.city} />
                </StyledListItem>
                <StyledListItem>
                  <ListItemText primary="Название:" secondary={profileData.organization} />
                </StyledListItem>
              </List>
            </Box>
            <Box sx={{ border: 1, borderRadius: 1, padding: 2 }}>
              <Typography variant="h6" gutterBottom>
                Информация о сотруднике
              </Typography>
              <List>
                <StyledListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <BadgeIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary="ФИО:" secondary={profileData.fullName} />
                </StyledListItem>
                <StyledListItem>
                  <ListItemText primary="Должность:" secondary={profileData.position} />
                </StyledListItem>
                <StyledListItem>
                  <ListItemText primary="Место работы:" secondary={profileData.workLocation} />
                </StyledListItem>
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
