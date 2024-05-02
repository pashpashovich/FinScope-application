import React, { useState } from 'react';
import Button from "@material-ui/core/Button"
import Header from "../../components/header/header"
import Footer from "../../components/footer/footer"
import TextField from "@material-ui/core/TextField"
import IconButton from '@material-ui/core/IconButton';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import axios from 'axios';
import index from "./login.module.css";

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/login', {
        email,
        password
      });
      console.log('Успешная авторизация:', response.data);
    } catch (error) {
      console.error('Ошибка при авторизации:', error);
      // Устанавливаем сообщение об ошибке при неверных данных
      setErrorMessage('Неверный логин или пароль');
    }
  };

  return (
    <div className={index.finance_scope}>
      <div className={index.container}>
        <Header />
        <div className={index.form_container}>
          <div className={index.form_auth}>
            <h1>Авторизация</h1>
            <TextField fullWidth margin="normal"  id="outlined-basic" label="Email" variant="outlined" value={email} onChange={(e) => setEmail(e.target.value)} />
            <TextField fullWidth margin="normal"  id="outlined-basic" label="Пароль" variant="outlined" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} InputProps={{ endAdornment: (<IconButton onClick={() => setShowPassword(!showPassword)}> {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />} </IconButton>)}}/>         
            <Button variant="outlined" onClick={handleSubmit}>Войти</Button>
      
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SignIn;
