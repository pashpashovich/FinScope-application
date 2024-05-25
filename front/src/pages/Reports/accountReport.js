import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Box, AppBar, Toolbar, IconButton, Typography, CssBaseline } from '@mui/material';
import { styled } from '@mui/system';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import Menu from '../../components/verticalMenu/menu';
import { useParams } from 'react-router-dom';


const apiUrl = 'http://localhost:8000/transactions/';
const pdfUrl = 'http://localhost:8000/transactions/generate-pdf/';

const StyledBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
  padding: '20px',
  backgroundColor: '#f5f5f5',
});

const Header = styled(AppBar)({
  zIndex: 1300,
  backgroundColor: '#030E32',
});

const TransactionsReport = () => {
  const { userID } = useParams();
  console.log(userID)
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'sender_account', headerName: 'Счет отправителя', width: 130 },
    { field: 'recipient_account', headerName: 'Счет получателя', width: 130 },
    { field: 'amount', headerName: 'Сумма', width: 130 },
    { field: 'transaction_time', headerName: 'Дата', width: 150 },
    { field: 'transaction_type', headerName: 'Тип', width: 130 },
  ];

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
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Menu userID={userID} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Header position="fixed">
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={() => navigate(-1)} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Анализ
            </Typography>
          </Toolbar>
        </Header>
        <Toolbar />
        <StyledBox>
          <Box sx={{ marginBottom: 2 }}>
            <Button variant="contained" color="primary" onClick={downloadPDF}>
              Скачать отчет в PDF
            </Button>
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <DataGrid
              rows={transactions}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 20, 50]}
              disableSelectionOnClick
              autoHeight
            />
          </Box>
        </StyledBox>
      </Box>
    </Box>
  );
};

export default TransactionsReport;
