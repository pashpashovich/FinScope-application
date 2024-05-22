import React, { useState, useEffect } from 'react';
import { Scatter } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

const apiUrl = 'http://localhost:8000/accounts/clients-accounts/';

const ClientsAccountsChart = () => {
    const [chartData, setChartData] = useState({ datasets: [] });

    useEffect(() => {
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                const scatterData = data.map(item => ({
                    x: item.income,
                    y: item.account_balance
                }));

                setChartData({
                    datasets: [{
                        label: 'Доход vs Баланс счета',
                        data: scatterData,
                        backgroundColor: 'rgba(75,192,192,1)',
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
                    text: 'Баланс счета'
                }
            }
        }
    };

    return (
        <div>
            <h2>График корреляции доходов клиентов и балансов их счетов</h2>
            <Scatter data={chartData} options={options} />
        </div>
    );
};

export default ClientsAccountsChart;
