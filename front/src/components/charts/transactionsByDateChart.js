import React, { useEffect, useState } from "react";
import { Box, TextField, Button, Container } from '@mui/material';
import Chart from 'chart.js/auto';
import { styled } from '@mui/system';


const MyButton = styled(Button)({
    background: '#6a65ff',
    ':hover': {
      background: '#5a55e0', 
    },
  });

const groupTransactionsByDate = (transactions) => {
    const counts = {};

    transactions.forEach(transaction => {
        const date = transaction.transaction_time.split('T')[0]; 
        if (!counts[date]) {
            counts[date] = 0;
        }
        counts[date] += 1;
    });

    const dates = Object.keys(counts).sort();
    const data = dates.map(date => counts[date]);

    return { dates, data };
};

const TransactionsByDateChart = ({ transactions, startDate, endDate, setStartDate, setEndDate, fetchTransactionsByDate }) => {
    const [filteredTransactions, setFilteredTransactions] = useState(transactions);

    useEffect(() => {
        if (startDate && endDate) {
            fetchTransactionsByDate();

        }
    }, [startDate, endDate]);

    useEffect(() => {
        const canvas = document.getElementById('transactionsByDateChart');
        const ctx = canvas.getContext('2d');

        if (window.myDateChart) {
            window.myDateChart.destroy();
        }

        const { dates, data } = groupTransactionsByDate(filteredTransactions);

        window.myDateChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Transactions by Date',
                    data: data,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    fill: true,
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }, [filteredTransactions]);

    const handleFilter = () => {
        const filtered = transactions.filter(transaction => {
            const date = transaction.transaction_time.split('T')[0];
            return date >= startDate && date <= endDate;
        });
        setFilteredTransactions(filtered);
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <TextField
                    label="Начальная дата"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ marginRight: 2 }}
                />
                <TextField
                    label="Конечная дата"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ marginRight: 2 }}
                />
                <MyButton variant="contained" onClick={handleFilter}>
                    Применить
                </MyButton>
            </Box>
            <canvas id="transactionsByDateChart"></canvas>
        </Container>
    );
};

export default TransactionsByDateChart;
