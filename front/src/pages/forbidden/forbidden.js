import React from 'react';
import { Typography, Container, Box } from '@mui/material';

const Forbidden = () => {
    return (
        <Container>
            <Box mt={5} textAlign="center">
                <Typography variant="h3" color="error">
                    Доступ запрещен
                </Typography>
                <Typography variant="h6">
                    У вас нет прав для просмотра этой страницы.
                </Typography>
            </Box>
        </Container>
    );
};

export default Forbidden;
