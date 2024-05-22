import React, { useEffect } from "react";
import Chart from 'chart.js/auto';

const groupTransactionsByDate = (transactions) => {
    const counts = {};

    transactions.forEach(transaction => {
        const date = transaction.transaction_time.split('T')[0]; // Получаем только дату
        if (!counts[date]) {
            counts[date] = 0;
        }
        counts[date] += 1;
    });

    const dates = Object.keys(counts).sort();
    const data = dates.map(date => counts[date]);

    return { dates, data };
};

const TransactionsByDateChart = ({ transactions }) => {
    useEffect(() => {
        const canvas = document.getElementById('transactionsByDateChart');
        const ctx = canvas.getContext('2d');

        if (window.myDateChart) {
            window.myDateChart.destroy();
        }

        const { dates, data } = groupTransactionsByDate(transactions);

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
    }, [transactions]);

    return <canvas id="transactionsByDateChart"></canvas>;
};

export default TransactionsByDateChart;
