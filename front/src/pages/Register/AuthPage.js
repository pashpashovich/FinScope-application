import React, { useState } from 'react';
import Button from "@material-ui/core/Button";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import IconButton from '@material-ui/core/IconButton';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import { useNavigate } from 'react-router-dom';
import { styled } from '@material-ui/core/styles';
import index from "./auth.module.css";
import axios from 'axios';

const MyButton = styled(Button)({
  marginTop: "30px",
  backgroundColor: '#6a65ff',
  color: "white"
});

const SignUp = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async () => {
    if (!validateEmail(email)) {
      setEmailError('Неверный формат email');
      return;
    } else {
      setEmailError('');
    }

    if (!validatePassword(password)) {
      setPasswordError('Пароль должен состоять минимум из 8 символов, одной большой и маленькой буквы латинского алфавита');
      return;
    } else {
      setPasswordError('');
    }

    try {
      const emailCheckResponse = await axios.get(`http://localhost:8000/api/check-email?email=${email}`, {withCredentials: true});
      if (emailCheckResponse.data.exists) {
        setEmailError('Этот email уже зарегистрирован');
        return;
      }

      const response = await axios.post('http://localhost:8000/api/register', {
        name,
        email,
        password
      });

      if (response.status === 201) {
        localStorage.setItem('accessToken', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
        console.log('Successfully registered:', response.data);
        navigate('/login');
      }
    } catch (error) {
      console.error('Error during registration:', error);
    }
  };

  return (
    <div className={index.finance_scope}>
      <div className={index.container}>
        <Header />
        <div className={index.form_container}>
          <div className={index.form_auth}>
          <Typography component="h1" variant="h5">
            Регистрация
          </Typography>
            <TextField
              fullWidth
              margin="normal"
              id="outlined-basic"
              label="Имя"
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={index.text_field}
            />
            <TextField
              fullWidth
              margin="normal"
              error={!!emailError}
              helperText={emailError}
              id="outlined-basic"
              label="Email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={index.text_field}
            />
            <TextField
              fullWidth
              margin="normal"
              error={!!passwordError}
              helperText={passwordError}
              id="outlined-basic"
              label="Пароль"
              variant="outlined"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                ),
              }}
              className={index.text_field}
            />
            <MyButton
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              className={index.submit_button}
            >
              Регистрация
            </MyButton>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SignUp;
