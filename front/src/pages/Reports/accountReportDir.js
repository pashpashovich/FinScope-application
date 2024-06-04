import React, { useState, useEffect } from "react";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import {
  Button,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  CssBaseline,
  Avatar,
  TextField,
  Paper,
  Grid,
  CircularProgress,
  LinearProgress,
} from "@mui/material";
import { styled } from "@mui/system";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate, useParams } from "react-router-dom";
import BankDirectorMenu from "../../components/verticalMenu/directorMenu";
import axios from "axios";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import ruLocale from "date-fns/locale/ru";

const apiUrl = "http://localhost:8000/transactions/";
const statsUrl = "http://localhost:8000/transactions/stats/";
const pdfUrl = "http://localhost:8000/transactions/generate-pdf/";
const profileUrl = "http://localhost:8000/api/";
const apiUrl2 = "http://localhost:8000/clients/bank-director/";

const StyledBox = styled(Box)({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  width: "100%",
  padding: "20px",
  backgroundColor: "#f5f5f5",
});

const MyButton = styled(Button)({
  background: "#6a65ff",
  ":hover": {
    background: "#5a55e0",
  },
});

const Header = styled(AppBar)({
  zIndex: 1300,
  backgroundColor: "#030E32",
});

const MyToolbar = styled(Toolbar)({
  display: "flex",
  justifyContent: "space-between",
  "@media (max-width: 600px)": {
    flexWrap: "wrap",
  },
});

const HeaderAvatar = styled(Avatar)({
  width: 40,
  height: 40,
});

const DateContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  "@media (min-width: 600px)": {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  marginBottom: "20px",
});

const DatePickerGrid = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(1),
}));

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarQuickFilter />
      <GridToolbarFilterButton />
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}

const TransactionsReport = () => {
  const { userID } = useParams();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [userData, setUserData] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filterModel, setFilterModel] = useState({
    items: [],
  });

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "sender_account", headerName: "Счет отправителя", width: 130 },
    { field: "recipient_account", headerName: "Счет получателя", width: 130 },
    { field: "amount", headerName: "Сумма", width: 130 },
    { field: "currency", headerName: "Валюта", width: 130 },
    { field: "transaction_time", headerName: "Дата", width: 150 },
    { field: "transaction_type", headerName: "Тип", width: 130 },
  ];

  useEffect(() => {
    axios
      .get(`${apiUrl2}${userID}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      .then((response) => {
        setFirstName(response.data.first_name);
        setLastName(response.data.last_name);
        setAvatarUrl(response.data.user.avatar);
      })
      .catch((error) => {
        if (error.response && error.response.status === 403) {
          navigate('/forbidden'); 
        } else if (error.response && error.response.status === 401) {
          navigate('/login'); 
        }
      });

    axios
      .get(`${profileUrl}${userID}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      .then((response) => setUserData(response.data))
      .catch((error) => {
        if (error.response && error.response.status === 403) {
          navigate('/forbidden'); 
        } else if (error.response && error.response.status === 401) {
          navigate('/login'); 
        }
      });

    fetch(
      `${apiUrl}?start_date=${
        startDate ? startDate.toISOString().split("T")[0] : ""
      }&end_date=${endDate ? endDate.toISOString().split("T")[0] : ""}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
      })
      .then((response) => response.json())
      .then((data) => {
        setTransactions(data);
        setFilteredTransactions(data);
      })
      .catch((error) => {
        if (error.response && error.response.status === 403) {
          navigate('/forbidden'); 
        } else if (error.response && error.response.status === 401) {
          navigate('/login'); 
        }
      });

    fetchStats(startDate, endDate);
  }, [userID, startDate, endDate]);

  useEffect(() => {
    if (searchText) {
      const filteredData = transactions.filter((transaction) =>
        String(transaction.sender_account).includes(searchText) ||
        String(transaction.recipient_account).includes(searchText)
      );
      setFilteredTransactions(filteredData);
    } else {
      setFilteredTransactions(transactions);
    }
  }, [searchText, transactions]);

  const fetchStats = async (startDate, endDate) => {
    setLoading(true);
    try {
      const response = await axios.get(statsUrl, {
        params: {
          start_date: startDate ? startDate.toISOString().split("T")[0] : "",
          end_date: endDate ? endDate.toISOString().split("T")[0] : "",
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      setStats(response.data);
    } catch (error) {
      console.error("Ошибка при загрузке статистики:", error);
    }
    setLoading(false);
  };

  const downloadPDF = () => {
    setDownloading(true);
    const params = new URLSearchParams({
      start_date: startDate ? startDate.toISOString().split("T")[0] : "",
      end_date: endDate ? endDate.toISOString().split("T")[0] : "",
      first_name: first_name,
      last_name: last_name,
    }).toString();

    fetch(`${pdfUrl}?${params}`)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "transactions_report.pdf");
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      })
      .catch((error) => console.error("Ошибка при загрузке PDF:", error))
      .finally(() => setDownloading(false));
  };

  const handleSearch = (event) => {
    setSearchText(event.target.value);
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

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <BankDirectorMenu userID={userID} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Header position="fixed">
          <MyToolbar>
            <Typography style={{ color: "white" }} variant="h6" noWrap component="div">
              Анализ
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <HeaderAvatar alt={"User Avatar"} src={avatarUrl || "/static/images/avatar/1.jpg"} />
              <IconButton onClick={handleLogout}>
                <LogoutIcon style={{ color: "white" }} />
              </IconButton>
            </Box>
          </MyToolbar>
        </Header>
        <Toolbar />
        <StyledBox>
          <DateContainer>
            <LocalizationProvider dateAdapter={AdapterDateFns} locale={ruLocale}>
              <DatePickerGrid item xs={12} sm={6} md={4}>
                <DatePicker
                  label="Начальная дата"
                  value={startDate}
                  onChange={(date) => setStartDate(date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </DatePickerGrid>
              <DatePickerGrid item xs={12} sm={6} md={4}>
                <DatePicker
                  label="Конечная дата"
                  value={endDate}
                  onChange={(date) => setEndDate(date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </DatePickerGrid>
            </LocalizationProvider>
          </DateContainer>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <MyButton variant="contained" color="primary" onClick={downloadPDF} disabled={downloading}>
              {downloading ? "Загрузка..." : "Скачать отчет в PDF"}
            </MyButton>
          </Box>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
              <CircularProgress />
            </Box>
          ) : (
            stats && (
              <Paper elevation={3} sx={{ padding: 2, width: "100%", mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Статистика транзакций
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ padding: 2, height: "100%" }}>
                      <Typography variant="body1">
                        <strong>Максимальная транзакция:</strong> {stats.max_transaction}  <strong>BYN</strong>
                      </Typography>
                      <LinearProgress variant="determinate" value={(stats.max_transaction / stats.max_transaction) * 100} />
                      <Typography variant="body1">
                        <strong>Минимальная транзакция:</strong> {stats.min_transaction} <strong>BYN</strong>
                      </Typography>
                      <LinearProgress variant="determinate" value={(stats.min_transaction / stats.max_transaction) * 100} />
                      <Typography variant="body1">
                        <strong>Средняя транзакция:</strong> {stats.avg_transaction} <strong>BYN</strong>
                      </Typography>
                      <LinearProgress variant="determinate" value={(stats.avg_transaction / stats.max_transaction) * 100} />
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ padding: 2, height: "100%" }}>
                      <Typography variant="body1">
                        <strong>Всего зачислений:</strong> {stats.total_deposits} <strong>BYN</strong>
                      </Typography>
                      <CircularProgress variant="determinate" value={(stats.total_deposits / (stats.total_deposits + stats.total_withdrawals)) * 100} />
                      <Typography variant="body1">
                        <strong>Всего списаний:</strong> {stats.total_withdrawals} <strong>BYN</strong>
                      </Typography>
                      <CircularProgress variant="determinate" value={(stats.total_withdrawals / (stats.total_deposits + stats.total_withdrawals)) * 100} />
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>
            )
          )}

          <TextField value={searchText} onChange={handleSearch} placeholder="Поиск по счетам" variant="outlined" fullWidth margin="normal" />
          <Box sx={{ height: 600, width: "100%" }}>
            <DataGrid
              rows={filteredTransactions}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 20, 50]}
              components={{
                Toolbar: CustomToolbar,
              }}
              filterModel={filterModel}
              onFilterModelChange={(model) => setFilterModel(model)}
            />
          </Box>
        </StyledBox>
      </Box>
    </Box>
  );
};

export default TransactionsReport;
