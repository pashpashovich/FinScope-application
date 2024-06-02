import React, { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Box, Button, TextField, Container } from '@mui/material';
import axios from 'axios';
import { styled } from '@mui/system';

const MyButton = styled(Button)({
  background: '#6a65ff',
  ':hover': {
    background: '#5a55e0',
  },
});

const apiUrl = 'http://localhost:8000/transactions/count-by-type/';

const TransactionTypePieChart = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Количество транзакций по типам',
        data: [],
        backgroundColor: ['#a29bfe', '#6c5ce7', '#341f97'],
      },
    ],
  });

  const fetchTransactionCounts = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);


    axios
      .get(`${apiUrl}?start_date=${start.toISOString().split('T')[0]}&end_date=${end.toISOString().split('T')[0]}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      .then(response => {
        const data = response.data;
        setChartData({
          labels: Object.keys(data),
          datasets: [
            {
              ...chartData.datasets[0],
              data: Object.values(data),
            },
          ],
        });
      })
      .catch(error => console.error('Ошибка при загрузке данных:', error));
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Начальная дата"
            value={startDate}
            onChange={date => setStartDate(date)}
            renderInput={(params) => <TextField {...params} />}
          />
          <DatePicker
            label="Конечная дата"
            value={endDate}
            onChange={date => setEndDate(date)}
            renderInput={(params) => <TextField {...params} />}
          />
        </LocalizationProvider>
        <MyButton variant="contained" onClick={fetchTransactionCounts}>
          Применить
        </MyButton>
      </Box>
      <Pie data={chartData} />
    </Container>
  );
};

export default TransactionTypePieChart;
