import React from 'react';
import { Box, Typography, Paper, LinearProgress, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  width: '100%',
  marginTop: theme.spacing(3),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  fontWeight: 'bold',
}));

const StatBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
}));

const ProgressBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

const HighlightedText = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 'bold',
}));

const TransactionStats = ({ data, selectedMonthName, displayDate }) => {
  if (!data) {
    return <div>Хмммммм</div>;
  }

  return (
    <StyledPaper elevation={3}>
      <Typography variant="h6" gutterBottom>
        Ваш отчет за {selectedMonthName} 2024
      </Typography>
      <Typography variant="subtitle1">
        Ваши транзакции по {displayDate} {selectedMonthName} 2024
      </Typography>
      
      <SectionTitle variant="h6">Общая сумма</SectionTitle>
      <ProgressBox>
        <StatBox>
          <Typography>Списания</Typography>
          <HighlightedText>{data.total_withdrawals.toFixed(2)} BYN</HighlightedText>
        </StatBox>
        <LinearProgress variant="determinate" value={(data.total_withdrawals / (data.total_withdrawals + data.total_deposits)) * 100} />
        <StatBox>
          <Typography>Зачисления</Typography>
          <HighlightedText>{data.total_deposits.toFixed(2)} BYN</HighlightedText>
        </StatBox>
        <LinearProgress variant="determinate" color="secondary" value={(data.total_deposits / (data.total_withdrawals + data.total_deposits)) * 100} />
      </ProgressBox>

      <SectionTitle variant="h6">Статистика операций</SectionTitle>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <StatBox>
            <Typography>Максимальная операция</Typography>
            <HighlightedText>{data.max_transaction.toFixed(2)} BYN</HighlightedText>
          </StatBox>
        </Grid>
        <Grid item xs={4}>
          <StatBox>
            <Typography>Минимальная операция</Typography>
            <HighlightedText>{data.min_transaction.toFixed(2)} BYN</HighlightedText>
          </StatBox>
        </Grid>
        <Grid item xs={4}>
          <StatBox>
            <Typography>Средняя операция</Typography>
            <HighlightedText>{data.avg_transaction.toFixed(2)} BYN</HighlightedText>
          </StatBox>
        </Grid>
      </Grid>
    </StyledPaper>
  );
};

export default TransactionStats;
