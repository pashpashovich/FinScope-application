import React from 'react';
import { Typography, Container, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/system';



const MyButton = styled(Button)({
    background: '#6a65ff',
  });
  
const Forbidden = () => {
    const navigate = useNavigate();

    const handleLoginRedirect = () => {
        navigate('/login');
    };

    return (
        <Container>
            <Box mt={5} textAlign="center">
                <Typography variant="h3" color="error">
                    Доступ запрещен
                </Typography>
                <Typography variant="h6" mb={2}>
                    У вас нет прав для просмотра этой страницы.
                </Typography>
                <MyButton variant="contained" color="primary" onClick={handleLoginRedirect}>
                    К авторизации
                </MyButton>
            </Box>
        </Container>
    );
};

export default Forbidden;

