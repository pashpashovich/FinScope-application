import React, { useState, useEffect } from 'react';
import { Scatter } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

const apiUrl = 'http://localhost:8000/accounts/clients-income-accounts/';

const ClientsIncomeAccountsChart = () => {
    const [chartData, setChartData] = useState({ datasets: [] });

    useEffect(() => {
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                const scatterData = data.map(item => ({
                    x: item.income,
                    y: item.account_count
                }));
            console.log(data)

                setChartData({
                    datasets: [{
                        label: 'Доход vs Количество счетов',
                        data: scatterData,
                        backgroundColor: 'rgba(153,102,255,1)',
                    }]
                });
            })
            .catch(error => console.error('Ошибка при загрузке данных:', error));
    }, []);

    const options = {
        scales: {
            x: {
                type: 'linear',
                position: 'bottom',
                title: {
                    display: true,
                    text: 'Доход'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Количество счетов'
                }
            }
        }
    };

    return (
        <div>
            <Scatter data={chartData} options={options} />
        </div>
    );
};

export default ClientsIncomeAccountsChart;
