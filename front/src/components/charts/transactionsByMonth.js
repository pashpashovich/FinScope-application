import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Статистика за предыдущий 6 период',
    },
  },
};

const labels = ['Янв', 'Фев', 'Мар', 'Апр', 'Май'];

const data = {
  labels,
  datasets: [
    {
      label: 'Транзакции',
      data: [200, 300, 150, 800, 1200],
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    },
  ],
};

const MonthlyTransactionChart = () => {
  return <Bar options={options} data={data} />;
};

export default MonthlyTransactionChart;
