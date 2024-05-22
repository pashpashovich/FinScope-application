import React, { useEffect, useState } from "react";
import AccountDistributionChart from '../../components/charts/accTypes';
import TransactionsByDateChart from '../../components/charts/transactionsByDateChart'; // Импортируем новый компонент
import ClientsAccountsChart from "../../components/charts/clientsAccountsChart";
import index from "./accTypes.module.css";

const Analytics = () => {
    const [accounts, setAccounts] = useState([]);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [transactionsByDate, setTransactionsByDate] = useState([]);

    useEffect(() => {
        if (!dataLoaded) {
            Promise.all([
                fetch(`http://localhost:8000/accounts/socials`).then(response => response.json()),
                fetch(`http://localhost:8000/accounts/credit`).then(response => response.json()),
                fetch(`http://localhost:8000/accounts/savings`).then(response => response.json()),
                fetch(`http://localhost:8000/accounts/checking`).then(response => response.json())
            ])
                .then(([socialsData, creditData, savingsData, checkingData]) => {
                    setAccounts([...socialsData, ...creditData, ...savingsData, ...checkingData]);
                    setDataLoaded(true); // Устанавливаем флаг загрузки данных
                })
                .catch(error => {
                    console.error('Ошибка при загрузке данных:', error);
                    setDataLoaded(true); // В любом случае устанавливаем флаг, чтобы избежать зацикливания
                });
        }
    }, [dataLoaded]);

    const fetchTransactionsByDate = () => {
        fetch(`http://localhost:8000/transactions/date-range/?start_date=${startDate}&end_date=${endDate}`)
            .then(response => response.json())
            .then(data => setTransactionsByDate(data))
            .catch(error => console.error('Ошибка при загрузке транзакций:', error));
    };

    return (
        <div className={index.analyticsContainer}>
            <div className={index.accountDistributionChart}>
                <AccountDistributionChart accounts={accounts} />
            </div>
            <div className={index.dateFilterForm}>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="Start Date"
                />
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="End Date"
                />
                <button onClick={fetchTransactionsByDate}>Fetch Transactions</button>
            </div>
            <div className={index.transactionsByDateChart}>
                <TransactionsByDateChart transactions={transactionsByDate} />
            </div>
            {/* <ClientsAccountsChart />  */}
        </div>
    );
};

export default Analytics;
