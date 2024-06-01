import Chart from 'chart.js/auto';
import {useEffect} from "react";



const countAccountTypes = (accounts) => {
    const counts = {
        'CheckingAccount': 0,
        'SavingsAccount': 0,
        'CreditAccount': 0,
        'SocialAccount': 0
    };

    accounts.forEach(account => {
        counts[account.account_type] += 1;
    });

    return Object.values(counts);
};

const AccountDistributionChart = ({ accounts }) => {
   useEffect(() => {
    const canvas = document.getElementById('accountDistributionChart');
    const ctx = canvas.getContext('2d');
    if (window.myChart) {
        window.myChart.destroy();
    }

    const accountCounts = countAccountTypes(accounts);

    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Checking Account', 'Savings Account', 'Credit Account', 'Social Account'],
            datasets: [{
                label: 'Account Distribution',
                data: accountCounts,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1
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
}, [accounts]);

return <canvas id="accountDistributionChart" width="10" height="10"></canvas>;
};
export default AccountDistributionChart
