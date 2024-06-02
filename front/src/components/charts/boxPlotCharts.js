import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { Box, FormControl, InputLabel, Select, MenuItem, TextField, Button } from '@mui/material';
import { styled } from '@mui/system';


const MyButton = styled(Button)({
  background: '#6a65ff',
  ':hover': {
    background: '#5a55e0', 
  },
});

const BoxPlotChart = ({ startDate, endDate, transactionType, setStartDate, setEndDate, setTransactionType }) => {
  const [plotData, setPlotData] = useState([]);

  const fetchBoxPlotData = async () => {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
      transaction_type: transactionType
    }).toString();

    try {
      const response = await fetch(`http://localhost:8000/transactions/boxplot?${params}`);
      const data = await response.json();
      setPlotData(formatPlotData(data));
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
    }
  };

  const formatPlotData = (data) => {
    return data.labels.map((label, index) => ({
      y: data.datasets[0].data[index],
      type: 'box',
      name: label,
      boxpoints: 'all'
    }));
  };
  

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
        <TextField
          label="Начальная дата"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Конечная дата"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <FormControl variant="outlined">
          <InputLabel>Тип транзакции</InputLabel>
          <Select
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value)}
            label="Тип транзакции"
          >
            <MenuItem value="transfer">Перевод</MenuItem>
            <MenuItem value="withdrawal">Снятие</MenuItem>
            <MenuItem value="deposit">Начисление</MenuItem>
          </Select>
        </FormControl>
        <MyButton variant="contained" color="primary" onClick={fetchBoxPlotData}>
          Применить
        </MyButton>
      </Box>
      {plotData.length > 0 && (
        <Plot
          data={plotData}
          layout={{
            width: 900,
            height: 400,
            title: 'Коробчатый график транзакций',
            yaxis: { title: 'Сумма транзакции' }
          }}
        />
      )}
    </Box>
  );
};

export default BoxPlotChart;
