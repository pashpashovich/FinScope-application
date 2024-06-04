import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, AppBar, Toolbar, CssBaseline, IconButton, Avatar, FormControl, InputLabel, Select, MenuItem, CircularProgress, Button } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import LogoutIcon from '@mui/icons-material/Logout';
import ClientMenu from '../../components/verticalMenu/ClientMenu';
import DailyTransactionsChart from '../../components/charts/dailyTransactionChart';
import TransactionStats from '../../components/stats/statsUserTransactions';
import axios from "axios";
import useMediaQuery from '@material-ui/core/useMediaQuery';

const apiUrl = 'http://localhost:8000/clients';
const pdfUrl = 'http://localhost:8000/transactions/generate-pdf-client/';

const MenuContainer = styled(Box)({
  display: 'flex',
});

const ContentContainer = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  maxWidth: 800,
  margin: '0 auto',
  boxSizing: 'border-box',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
}));

const MyToolbar = styled(Toolbar)({
  color: '#051139',
});

const HeaderAvatar = styled(Avatar)({
  width: 40,
  height: 40,
});

const UserReportPage = () => {
  const { userID } = useParams();
  const [data, setData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [dailyTransactions, setDailyTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [downloading, setDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`http://localhost:8000/accounts/exact/${userID}/socials`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
      }).then(response => response.json()),
      fetch(`http://localhost:8000/accounts/exact/${userID}/credit`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
      }).then(response => response.json()),
      fetch(`http://localhost:8000/accounts/exact/${userID}/savings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
      }).then(response => response.json()),
      fetch(`http://localhost:8000/accounts/exact/${userID}/checking`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
      }).then(response => response.json())
    ])
      .then(([socialsData, creditData, savingsData, checkingData]) => {
        const combinedAccounts = [...socialsData, ...creditData, ...savingsData, ...checkingData];
        setAccounts(combinedAccounts);
        if (combinedAccounts.length > 0 && !selectedAccount) {
          setSelectedAccount(combinedAccounts[0].account_num);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching accounts data:', error);
        setLoading(false);
      });

    fetch(`${apiUrl}/${userID}/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
    })
      .then(response => {
        if (!response.ok) {
          if (response.status === 403) {
            navigate('/forbidden');
          } else if (response.status === 401) {
            navigate('/login');
          }
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setUserData(data);
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
      });
  }, [userID, selectedAccount, navigate]);

  useEffect(() => {
    if (selectedAccount && selectedMonth) {
      fetchTransactionData(selectedAccount, selectedMonth);
      fetchTransactionStats(selectedAccount, selectedMonth);
    }
  }, [selectedAccount, selectedMonth]);

  const fetchTransactionData = async (account, month) => {
    try {
      const response = await fetch(`http://localhost:8000/transactions/${account}/${month}/daily`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setDailyTransactions(data);
    } catch (error) {
      console.error('Error refreshing transaction data:', error);
    }
  };

  const fetchTransactionStats = async (account, month) => {
    try {
      const response = await fetch(`http://localhost:8000/transactions/${account}/${month}/stats`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error('Error refreshing transaction data:', error);
    }
  };

  const handleLogout = () => {
    axios.post(
      'http://localhost:8000/api/logout',
      {
        refresh_token: localStorage.getItem('refreshToken'),
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        withCredentials: true
      }
    )
    .then(response => {
      if (response.status !== 200) {
        console.log(localStorage.getItem('refreshToken'));
        return;
      }
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      navigate('/login');
    })
    .catch(error => {
      console.error(error);
      console.log(localStorage.getItem('refreshToken'));
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  const downloadPDF = () => {
    if (!selectedAccount) {
      setErrorMessage("Выберите счет для скачивания отчета");
      return;
    }

    setDownloading(true);
    const params = new URLSearchParams({
      account: selectedAccount,
      month: selectedMonth,
    }).toString();

    fetch(`${pdfUrl}?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
    })
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "user_report.pdf");
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      })
      .catch((error) => console.error("Error downloading PDF:", error))
      .finally(() => setDownloading(false));
  };

  if (!userData) {
    return <CircularProgress />;
  }

  const { user, first_name} = userData;
  const { avatar: avatarUrl } = user;

  const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
  const selectedMonthName = monthNames[selectedMonth - 1];

  const getCurrentDateOrEndOfMonth = (selectedMonth) => {
    const today = new Date();
    const year = today.getFullYear();
    if (selectedMonth === today.getMonth() + 1) {
      return today.getDate();
    }
    const lastDay = new Date(year, selectedMonth, 0).getDate();
    return lastDay;
  };

  const displayDate = getCurrentDateOrEndOfMonth(selectedMonth);

  return (
    <MenuContainer>
      <CssBaseline />
      <ClientMenu userID={userID} />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, background: '#030E32' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6" noWrap component="div">
            Отчетность
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <HeaderAvatar alt={first_name} src={avatarUrl || "/static/images/avatar/1.jpg"} />
            <IconButton onClick={handleLogout}>
              <LogoutIcon style={{ color: 'white' }} />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <ContentContainer>
        <Toolbar />
        <Paper elevation={3} sx={{ padding: 2, width: '100%', mt: 3 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
              <CircularProgress />
            </Box>
          ) : (
            <>
              <FormControl fullWidth margin="normal">
                <InputLabel>Счет</InputLabel>
                <Select
                  value={selectedAccount || ''}
                  onChange={e => setSelectedAccount(e.target.value)}
                >
                  {accounts.map(account => (
                    <MenuItem key={account.account_num} value={account.account_num}>
                      {account.account_num}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>Месяц</InputLabel>
                <Select
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <MenuItem key={i} value={i + 1}>
                      {`${monthNames[i]}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <DailyTransactionsChart data={dailyTransactions} />
              <TransactionStats data={data} selectedMonthName={selectedMonthName} displayDate={displayDate} />
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Button variant="contained" color="primary" onClick={downloadPDF} disabled={downloading}>
                  {downloading ? "Загрузка..." : "Скачать отчет в PDF"}
                </Button>
              </Box>
              {errorMessage && (
                <Typography color="error" sx={{ mt: 2 }}>
                  {errorMessage}
                </Typography>
              )}
            </>
          )}
        </Paper>
      </ContentContainer>
    </MenuContainer>
  );
};

export default UserReportPage;
