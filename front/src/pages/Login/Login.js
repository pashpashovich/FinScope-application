import React, { useState } from 'react';
import { Button, TextField, IconButton, Box, Typography, Paper, Avatar } from '@material-ui/core';
import { Visibility, VisibilityOff, LockOutlined } from '@material-ui/icons';
import { styled } from '@material-ui/core/styles';
import axios from 'axios';
import index from './login.module.css';
import Header from "../../components/headerReg/headerReg"
import Footer from "../../components/footer/footer"
import { jwtDecode } from 'jwt-decode';
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
      const response = await axios.post('http://localhost:8000/api/login', {
        email,
        password,
      });
      localStorage.setItem('token', response.data.jwt);
      const decodedToken = jwtDecode(response.data.jwt);
      const id = response.data.id
      const role = decodedToken.role;
      if (role === 'analyst') {
        navigate(`/profile/${response.data.id}`);
      } else if (role === 'client') {
        navigate(`client/${response.data.id}`);
      } else if (role === 'director') {
        navigate('/director-dashboard');
      } else {
        setErrorMessage('Неизвестная роль пользователя');
      }    } catch (error) {
      console.error('Ошибка при авторизации:', error);
      setErrorMessage('Неверный логин или пароль');
    }
  };

  return (
    <div className={index.finance_scope}>
      <Header />
      <Box className={index.container}>
        <Paper color='red' className={index.form_container} elevation={3}>
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
