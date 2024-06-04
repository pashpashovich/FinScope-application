import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Button,
  Box,
  Divider,
  useMediaQuery,
  useTheme,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  AppBar,
  Toolbar,
  Avatar,
  CssBaseline,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { styled } from "@mui/material/styles";
import Menu from "../../components/verticalMenu/menu";

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.withCredentials = true;

const drawerWidth = 240;

const colors = {
  primary: "#6A65FF",
  secondary: "#051139",
  third: "#082899",
  tertiary: "#0D1849",
  accent1: "#0976B4",
  accent2: "#9C08FF",
  accent3: "#00A3FF",
};

const HeaderAvatar = styled(Avatar)({
  width: 40,
  height: 40,
});

const CustomButton = styled(Button)({
  backgroundColor: colors.third,
  color: "white",
});

const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: 800,
  margin: "auto",
  marginTop: theme.spacing(3),
  "@media (max-width: 600px)": {
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
  maxWidth: 800,
  margin: "0 auto",
  boxSizing: "border-box",
  padding: theme.spacing(3),
  "@media (max-width: 600px)": {
    padding: theme.spacing(2),
  },
}));

const BackButton = styled(IconButton)({
  color: "white",
  backgroundColor: "#6a65ff",
  "&:hover": {
    backgroundColor: "#5a55e0",
  },
  marginRight: 10,
});

const MenuContainer = styled(Box)({
  display: "flex",
});

const AccountTransactionsPage = () => {
  const { accountID, userID } = useParams();
  const [accountInfo, setAccountInfo] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [convertedBalance, setConvertedBalance] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [transactionCurrency, setTransactionCurrency] = useState("BYN");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [newTransactionData, setNewTransactionData] = useState({
    sender_account: "",
    recipient_account: "",
    amount: "",
    transaction_type: "deposit",
  });
  const [amountError, setAmountError] = useState("");
  const [balanceError, setBalanceError] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const apiUrl = "http://localhost:8000/accounts";
  const apiUrl2 = "http://localhost:8000/clients/financial-analyst/";

  useEffect(() => {
    fetchAccountInfo();
    fetchTransactions();
    fetchAvatar();
  }, [accountID, userID]);

  const fetchAccountInfo = () => {
    Promise.any([
      axios
        .get(`${apiUrl}/${accountID}/socials`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        })
        .then((response) => response.data),
      axios
        .get(`${apiUrl}/${accountID}/credit`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        })
        .then((response) => response.data),
      axios
        .get(`${apiUrl}/${accountID}/savings`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        })
        .then((response) => response.data),
      axios
        .get(`${apiUrl}/${accountID}/checking`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        })
        .then((response) => response.data),
    ])
      .then((data) => {
        setAccountInfo(data);
        fetchConvertedBalance(
          data.account_balance.toString(),
          data.currency,
          selectedCurrency
        );
      })
      .catch((error) => console.error(error));
  };

  const fetchTransactions = () => {
    fetch(`http://localhost:8000/transactions/${accountID}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setTransactions(data))
      .catch((error) => {
        if (error.response && error.response.status === 403) {
          navigate("/forbidden");
        } else if (error.response && error.response.status === 401) {
          navigate("/login");
        }
      });
  };

  const fetchAvatar = () => {
    axios
      .get(`${apiUrl2}${userID}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      .then((response) => {
        setAvatarUrl(response.data.user.avatar);
      })
      .catch((error) => {
        if (error.response && error.response.status === 403) {
          navigate("/forbidden");
        } else if (error.response && error.response.status === 401) {
          navigate("/login");
        }
      });
  };

  const handleLogout = () => {
    axios
      .post(
        "http://localhost:8000/api/logout",
        {
          refresh_token: localStorage.getItem("refreshToken"),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          withCredentials: true,
        }
      )
      .then((response) => {
        if (response.status !== 200) {
          console.log(localStorage.getItem("refreshToken"));
          return;
        }
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/login");
      })
      .catch((error) => {
        console.error(error);
        console.log(localStorage.getItem("refreshToken"));
      });
  };

  const fetchConvertedBalance = async (balance, fromCurrency, toCurrency) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/accounts/convert/${balance}/${fromCurrency}/${toCurrency}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      setConvertedBalance(response.data[toCurrency]);
    } catch (error) {
      console.error("Error fetching converted balance:", error);
    }
  };

  const handleRequestError = (error, navigate) => {
    if (error.response) {
      if (error.response.status === 401) {
        navigate("/login");
      } else if (error.response.status === 403) {
        navigate("/forbidden");
      }
    } else {
      console.error(error);
    }
  };

  const handleCurrencyChange = (event) => {
    const newCurrency = event.target.value;
    setSelectedCurrency(newCurrency);
    if (accountInfo) {
      fetchConvertedBalance(
        accountInfo.account_balance,
        accountInfo.currency,
        newCurrency
      );
    }
  };

  const handleTransactionCurrencyChange = (event) => {
    setTransactionCurrency(event.target.value);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewTransactionData({ ...newTransactionData, [name]: value });
    if (name === "amount") {
      const numericValue = parseFloat(value);
      if (isNaN(numericValue) || numericValue <= 0) {
        setAmountError("Введите корректное число больше 0");
      } else {
        setAmountError("");
        checkBalance(numericValue);
      }
    }
  };

  const checkBalance = (amount) => {
    let availableBalance = accountInfo.account_balance;
    if (accountInfo.account_type === "Текущий счет") {
      availableBalance += accountInfo.overdraft_limit;
    }
    if (
      newTransactionData.transaction_type === "withdrawal" ||
      newTransactionData.transaction_type === "transfer"
    ) {
      if (amount > availableBalance) {
        setBalanceError("Недостаточно средств для выполнения операции.");
      } else {
        setBalanceError("");
      }
    }
  };

  const generateReceipt = async (transactionId) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/transactions/receipt/${transactionId}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `receipt_${transactionId}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      handleRequestError(error, navigate);
    }
  };

  const handleAddTransaction = async () => {
    const { amount, sender_account, transaction_type, recipient_account } =
      newTransactionData;
    const transactionData = {
      sender_account: "",
      recipient_account: "",
      amount: amount,
      transaction_type: transaction_type,
      currency: transactionCurrency,
    };
    if (transaction_type === "transfer") {
      transactionData.sender_account = accountID;
      transactionData.recipient_account = recipient_account;
    }
    if (transaction_type === "deposit") {
      transactionData.sender_account = "";
      transactionData.recipient_account = accountID;
    }

    if (transaction_type === "withdrawal") {
      transactionData.sender_account = accountID;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/transactions/",
        transactionData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      setTransactions([...transactions, response.data]);
      setNewTransactionData({
        sender_account: "",
        recipient_account: "",
        amount: "",
        transaction_type: "withdrawal",
        currency: "BYN",
      });
      await generateReceipt(response.data.id);
      fetchAccountInfo();
      window.location.reload();
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setBalanceError("Недостаточно средств для выполнения операции.");
      } else {
        handleRequestError(error, navigate);
      }
    }
  };

  const renderAdditionalAccountInfo = () => {
    if (!accountInfo) return null;

    switch (accountInfo.account_type) {
      case "Текущий счет":
        return (
          <Typography variant="body1" gutterBottom>
            Лимит овердрафта: {accountInfo.overdraft_limit} BYN
          </Typography>
        );
      case "Сберегательный счет":
        return (
          <Typography variant="body1" gutterBottom>
            Процентная ставка: {accountInfo.interest_rate}%
          </Typography>
        );
      case "Кредитный счет":
        return (
          <Typography variant="body1" gutterBottom>
            Кредитный лимит: {accountInfo.credit_limit} BYN
          </Typography>
        );
      case "Социальный счет":
        return (
          <Typography variant="body1" gutterBottom>
            Социальные выплаты:{" "}
            {accountInfo.social_payments ? "Включены" : "Отключены"}
          </Typography>
        );
      default:
        return null;
    }
  };

  return (
    <MenuContainer>
      <CssBaseline />
      <Menu userID={userID} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <AppBar
          position="fixed"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            background: "#030E32",
          }}
        >
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h6" noWrap component="div">
              Клиенты
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <HeaderAvatar
                alt={"Ooo"}
                src={avatarUrl || "/static/images/avatar/1.jpg"}
              />
              <IconButton onClick={handleLogout}>
                <LogoutIcon style={{ color: "white" }} />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
        <Toolbar />
        <ContentContainer>
          <Paper elevation={3} style={{ padding: 20, width: "100%" }}>
            <Box display="flex" alignItems="center" marginBottom={2}>
              <BackButton onClick={() => navigate(-1)}>
                <ArrowBackIcon />
              </BackButton>
              <Typography variant="h5">Назад</Typography>
            </Box>
            {accountInfo && (
              <Box marginBottom={3}>
                <Typography variant="h5" gutterBottom>
                  Информация о счете {accountID}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Номер счета: {accountInfo.account_num}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Тип счета: {accountInfo.account_type}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Баланс:{" "}
                  {convertedBalance
                    ? convertedBalance.toFixed(2)
                    : accountInfo.account_balance}{" "}
                  {selectedCurrency}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Дата открытия: {accountInfo.open_date}
                </Typography>
                {renderAdditionalAccountInfo()}
                <FormControl variant="outlined" margin="normal" fullWidth>
                  <InputLabel>Валюта</InputLabel>
                  <Select
                    value={selectedCurrency}
                    onChange={handleCurrencyChange}
                    label="Валюта"
                  >
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="EUR">EUR</MenuItem>
                    <MenuItem value="RUB">RUB</MenuItem>
                    <MenuItem value="CNY">CNY</MenuItem>
                    <MenuItem value="BYN">BYN</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}
            <Divider />
            <Box marginTop={3}>
              <Typography variant="h5" gutterBottom>
                Транзакции счета {accountID}
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Время</TableCell>
                      <TableCell>Тип</TableCell>
                      <TableCell>Сумма</TableCell>
                      <TableCell>Валюта</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.transaction_time}</TableCell>
                        <TableCell>{transaction.transaction_type}</TableCell>
                        <TableCell>{transaction.amount}</TableCell>
                        <TableCell>{transaction.currency}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            <Box marginTop={3}>
              <Typography
                variant="h5"
                gutterBottom
                style={{ textAlign: "center" }}
              >
                Добавить транзакцию
              </Typography>
              <FormControl variant="outlined" margin="normal" fullWidth>
                <InputLabel>Тип транзакции</InputLabel>
                <Select
                  name="transaction_type"
                  value={newTransactionData.transaction_type}
                  onChange={handleInputChange}
                  label="Тип транзакции"
                >
                  <MenuItem value="withdrawal">Снятие</MenuItem>
                  <MenuItem value="transfer">Перевод</MenuItem>
                  <MenuItem value="deposit">Депозит</MenuItem>
                </Select>
              </FormControl>
              {newTransactionData.transaction_type === "transfer" && (
                <TextField
                  label="Номер счета получателя"
                  name="recipient_account"
                  value={newTransactionData.recipient_account}
                  onChange={handleInputChange}
                  variant="outlined"
                  margin="normal"
                  fullWidth
                />
              )}
              <TextField
                label="Сумма"
                name="amount"
                value={newTransactionData.amount}
                onChange={handleInputChange}
                variant="outlined"
                margin="normal"
                error={!!amountError}
                helperText={amountError}
                fullWidth
              />
              {balanceError && (
                <Typography color="error" variant="body2">
                  {balanceError}
                </Typography>
              )}
              <FormControl variant="outlined" margin="normal" fullWidth>
                <InputLabel>Валюта</InputLabel>
                <Select
                  value={transactionCurrency}
                  onChange={handleTransactionCurrencyChange}
                  label="Валюта"
                >
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
                  <MenuItem value="RUB">RUB</MenuItem>
                  <MenuItem value="CNY">CNY</MenuItem>
                  <MenuItem value="BYN">BYN</MenuItem>
                </Select>
              </FormControl>
              <CustomButton
                onClick={handleAddTransaction}
                variant="contained"
                fullWidth
                style={{ marginTop: 20 }}
                disabled={!!amountError || !!balanceError}
              >
                Добавить транзакцию
              </CustomButton>
            </Box>
          </Paper>
        </ContentContainer>
      </Box>
    </MenuContainer>
  );
};

export default AccountTransactionsPage;
