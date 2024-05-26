import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Grid, Card, CardContent, Avatar, CircularProgress, AppBar, Toolbar, IconButton, CssBaseline, Input } from '@mui/material';
import { styled } from '@mui/system';
import ClientMenu from '../../components/verticalMenu/ClientMenu';
import LogoutIcon from '@mui/icons-material/Logout';

const apiUrl = 'http://localhost:8000/clients';

const ProfileContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: 20,
  backgroundColor: '#f5f5f5',
  borderRadius: 8,
  marginTop: 20,
  width: '100%',
});

const ProfileCard = styled(Card)({
  width: '100%',
  maxWidth: 600,
  marginTop: 20,
  padding: 20,
});

const ProfileAvatar = styled(Avatar)({
  width: 100,
  height: 100,
  marginBottom: 20,
  cursor: 'pointer',
});

const HeaderAvatar = styled(Avatar)({
  width: 40,
  height: 40,
});

const HiddenInput = styled(Input)({
  display: 'none',
});

const ClientProfilePage = () => {
  const navigate = useNavigate();
  const { userID } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    fetch(`${apiUrl}/${userID}/`, {
      credentials: 'include',
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setUserData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
        setLoading(false);
        if (error.response && error.response.status === 403) {
          navigate('/forbidden');
        } else if (error.response && error.response.status === 401) {
          navigate('/login');
        }
      });
  }, [userID, navigate]);

  const handleAvatarChange = (e) => {
    setAvatar(e.target.files[0]);
    handleAvatarUpload(e.target.files[0]);
  };

  const handleAvatarUpload = (file) => {
    const formData = new FormData();
    formData.append('avatar', file);

    fetch(`http://localhost:8000/clients/upload-avatar/${userID}/`, {
      method: 'POST',
      body: formData,
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setUserData({ ...userData, user: { ...userData.user, avatar: data.avatar } });
        window.location.reload();
      })
      .catch(error => {
        console.error('Error uploading avatar:', error);
      });
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (!userData) {
    return <Typography variant="h6">Пользователь не найден</Typography>;
  }

  const { user, first_name, last_name, phone_number, address, income } = userData;
  const { email, role, avatar: avatarUrl } = user;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <ClientMenu userID={userID} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, background: '#030E32' }}>
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" noWrap component="div">
              Профиль
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <HeaderAvatar alt={first_name} src={avatarUrl || "/static/images/avatar/1.jpg"} />
              <IconButton onClick={() => console.log('Logout')}>
                <LogoutIcon style={{ color: 'white' }} />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
        <Toolbar />
        <Container maxWidth="md">
          <ProfileContainer>
            <label htmlFor="avatar-upload">
              <ProfileAvatar
                alt={first_name}
                src={avatarUrl || "/static/images/avatar/1.jpg"}
                component="span"
              />
            </label>
            <HiddenInput id="avatar-upload" type="file" onChange={handleAvatarChange} />
            <Typography variant="h4">{`${first_name} ${last_name}`}</Typography>
            <Typography variant="h6" color="textSecondary">{role}</Typography>
            <ProfileCard>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" color="textSecondary">Email</Typography>
                    <Typography variant="body1">{email}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" color="textSecondary">Доход</Typography>
                    <Typography variant="body1">{income}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" color="textSecondary">Телефон</Typography>
                    <Typography variant="body1">{phone_number}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" color="textSecondary">Адрес</Typography>
                    <Typography variant="body1">{address}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </ProfileCard>
          </ProfileContainer>
        </Container>
      </Box>
    </Box>
  );
};

export default ClientProfilePage;
