import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box, Typography } from '@mui/material';

const DailyTransactionsChart = ({ data }) => {
  const formattedData = data.map(item => ({
    day: item.day,
    deposits: item.deposits,
    withdrawals: item.withdrawals,
  }));

  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <Typography variant="h6" gutterBottom>
        Ежедневные транзакции
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="deposits" fill="#82ca9d" name="Зачисления" />
          <Bar dataKey="withdrawals" fill="#8884d8" name="Списания" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default DailyTransactionsChart;
