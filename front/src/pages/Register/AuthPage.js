import React, { useState } from 'react';
import Button from "@material-ui/core/Button";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import TextField from "@material-ui/core/TextField";
import IconButton from '@material-ui/core/IconButton';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import { useNavigate } from 'react-router-dom';
import index from "./auth.module.css";
import axios from 'axios';

const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  const validateEmail = (email) => {
    // Regular expression for basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    // Add your password complexity rules here
    // For example, require at least 8 characters, one uppercase, one lowercase, and one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async () => {
    // Validate email format
    if (!validateEmail(email)) {
      setEmailError('Invalid email format');
      return;
    } else {
      setEmailError(null);
    }

    // Validate password strength
    if (!validatePassword(password)) {
      setPasswordError('Password must be at least 8 characters with one uppercase, one lowercase, and one number');
      return;
    } else {
      setPasswordError(null);
    }

    try {
      // Check email uniqueness before registration
      const emailCheckResponse = await axios.get(`http://localhost:8000/api/check-email?email=${email}`);
      if (emailCheckResponse.data.exists) {
        setEmailError('This email is already registered');
        return;
      }
      const response = await axios.post('http://localhost:8000/api/register', {
        name,
        email,
        password
      });
      
      console.log('Успешно зарегистрирован:', response.data);
      navigate('/login');
    
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      
    }
  };

  return (
    <div className={index.finance_scope}>

    <div className={index.container}>
      <Header />
      <div className={index.form_container}>
        <div className={index.form_auth}>
        <h1>Регистрация</h1>
        <TextField fullWidth margin="normal"  id="outlined-basic" label="Имя" variant="outlined" value={name} onChange={(e) => setName(e.target.value)} />
          <TextField fullWidth margin="normal"    error={!!emailError} helperText={emailError}  id="outlined-basic" label="Email" variant="outlined" value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField fullWidth margin="normal"  error={!!passwordError} helperText={passwordError}  id="outlined-basic" label="Пароль" variant="outlined" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} InputProps={{ endAdornment: (<IconButton onClick={() => setShowPassword(!showPassword)}> {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />} </IconButton>)}}/>          <Button variant="outlined" onClick={handleSubmit}>Регистрация</Button>
        </div>
      </div>
    </div>
    <Footer />
    </div>
  );
};

export default SignIn;