import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button } from '@mui/material';

const apiUrl = 'http://localhost:8000/transactions/';
const pdfUrl = 'http://localhost:8000/transactions/generate-pdf/';

function TransactionsReport() {
    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'sender_account', headerName: 'Счет отправителя', width: 130 },
        { field: 'recipient_account', headerName: 'Счет получателя', width: 130 },
        { field: 'amount', headerName: 'Сумма', width: 130 },
        { field: 'transaction_time', headerName: 'Дата', width: 150 },
        { field: 'transaction_type', headerName: 'Тип', width: 130 }
    ];

    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => setTransactions(data))
            .catch(error => console.error('Ошибка при загрузке транзакций:', error));
    }, []);

    const downloadPDF = () => {
        fetch(pdfUrl)
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(new Blob([blob]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'transactions_report.pdf');
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
            })
            .catch(error => console.error('Ошибка при загрузке PDF:', error));
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 600, width: '100%' }}>
            <div style={{ marginBottom: 20 }}>
                <Button variant="contained" color="primary" onClick={downloadPDF}>
                    Скачать отчет в PDF
                </Button>
            </div>
            <div style={{ flexGrow: 1 }}>
                <DataGrid
                    rows={transactions}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10, 20, 50]}
                    disableSelectionOnClick
                />
            </div>
        </div>
    );
}

export default TransactionsReport;
