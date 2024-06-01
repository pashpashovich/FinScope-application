import React, { useState } from 'react';
import { Button, TextField, IconButton, Box, Typography, Paper, Avatar } from '@mui/material';
import { Visibility, VisibilityOff, LockOutlined } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import index from './login.module.css';
import Header from "../../components/headerReg/headerReg";
import Footer from "../../components/footer/footer";
import { useNavigate } from 'react-router-dom';

const MyAvatar = styled(Avatar)({
  backgroundColor: '#6a65ff'
});

const MyButton = styled(Button)({
  marginTop: "30px",
  backgroundColor: '#6a65ff',
  color: "white"
});


const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    try {
      axios.post(
        'http://localhost:8000/api/login',
        { email, password },
      )
      .then(response => {
        if (response.status !== 200) return;

        localStorage.setItem('accessToken', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
        const { id, role } = response.data;
        localStorage.setItem('userRole', role);

        switch (role) {
          case 'analyst':
            navigate(`/profile/${id}`);
            break;
          case 'client':
            navigate(`/profileCl/${id}`);
            break;
          case 'director':
            navigate(`/profileDir/${id}`);
            break;
          default:
            setErrorMessage('Неизвестная роль пользователя');
        }
      })
      .catch(error => {
        console.log(error.response.status);
        if (error.response.status === 403) {
          setErrorMessage('Ваш аккаунт деактивирован. Пожалуйста, свяжитесь с поддержкой.');
        } else {
          console.error('Ошибка при авторизации:', error);
          setErrorMessage('Неверный логин или пароль');
        }
      });
    } catch (error) {
      console.error('Ошибка при авторизации:', error);
      setErrorMessage('Неверный логин или пароль');
    }
  };

  return (
    <div className={index.finance_scope}>
      <Header />
      <Box className={index.container}>
        <Paper className={index.form_container} elevation={3}>
          <MyAvatar>
            <LockOutlined />
          </MyAvatar>
          <Typography component="h1" variant="h5">
            Авторизация
          </Typography>
          <form className={index.form_auth} noValidate>
            <TextField
              variant="outlined"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Пароль"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />
            {errorMessage && <Typography color="error">{errorMessage}</Typography>}
            <MyButton
              fullWidth
              variant="contained"
              className={index.submit}
              onClick={handleSubmit}
            >
              Войти
            </MyButton>
          </form>
        </Paper>
      </Box>
      <Footer />
    </div>
  );
};

export default SignIn;
