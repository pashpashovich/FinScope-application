import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  List,
  Avatar,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Paper,
  Button,
  TextField,
  MenuItem,
  Box,
  AppBar,
  Toolbar,
  CssBaseline,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Menu from "../../components/verticalMenu/menu";
import { styled } from "@mui/material/styles";
import axios from "axios";
import LogoutIcon from "@mui/icons-material/Logout";

const apiUrl = "http://localhost:8000/clients/financial-analyst/";
const drawerWidth = 240;

const currencies = [
  { value: "BYN", label: "Белорусский рубль" },
  { value: "USD", label: "Доллар США" },
  { value: "EUR", label: "Евро" },
  { value: "RUB", label: "Российский рубль" },
  { value: "CNY", label: "Китайский юань" },
];

const MenuContainer = styled(Box)({
  display: "flex",
});

const DrawerHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(2),
  backgroundColor: "#030E32",
  color: "white",
  justifyContent: "center",
  fontWeight: "bold",
}));

const HeaderAvatar = styled(Avatar)({
  width: 40,
  height: 40,
});

const MyButton = styled(Button)({
  background: "#6a65ff",
  ":hover": {
    background: "#5a55e0",
  },
});

const BackButton = styled(IconButton)({
  color: "white",
  backgroundColor: "#6a65ff",
  "&:hover": {
    backgroundColor: "#5a55e0",
  },
  marginRight: 10,
});

const ContentContainer = styled(Box)({
  flexGrow: 1,
  p: 3,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
  maxWidth: 800,
  margin: "0 auto",
  boxSizing: "border-box",
});

const MyToolbar = styled(Toolbar)({
  color: "#051139",
});

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

const ClientAccountsPage = () => {
  const { userID } = useParams();
  const { clientId } = useParams();
  const [clientInfo, setClientInfo] = useState(null);
  const [userData, setUserData] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [newAccountData, setNewAccountData] = useState({
    account_num: "",
    account_type: "",
    account_balance: "",
    currency: "",
    open_date: new Date().toISOString().slice(0, 10),
    account_activity: true,
    overdraft_limit: "",
    interest_rate: "",
    credit_limit: "",
    social_benefit_type: "",
  });
  const [errorText, setErrorText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${apiUrl}${userID}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      .then((response) => {
        setUserData(response.data);
        setAvatarUrl(response.data.user.avatar);
      })
      .catch((error) => handleRequestError(error, navigate));

    fetch(`http://localhost:8000/clients/${clientId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setClientInfo(data))
      .catch((error) => {
        if (error.response && error.response.status === 403) {
          navigate('/forbidden'); 
        } else if (error.response && error.response.status === 401) {
          navigate('/login'); 
        }
      });

    Promise.all([
      fetch(`http://localhost:8000/accounts/exact/${clientId}/socials`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }).then((response) => response.json()),
      fetch(`http://localhost:8000/accounts/exact/${clientId}/credit`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }).then((response) => response.json()),
      fetch(`http://localhost:8000/accounts/exact/${clientId}/savings`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }).then((response) => response.json()),
      fetch(`http://localhost:8000/accounts/exact/${clientId}/checking`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }).then((response) => response.json()),
    ]).then(([socialsData, creditData, savingsData, checkingData]) => {
      setAccounts([
        ...socialsData,
        ...creditData,
        ...savingsData,
        ...checkingData,
      ]);
    });
  }, [clientId, navigate, userID]);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setNewAccountData({
      ...newAccountData,
      [name]: type === "checkbox" ? checked : value,
    });
    if (name === "account_num") {
      checkAccountExists(value);
    }
  };

  const checkAccountExists = (accountNum) => {
    fetch(`http://localhost:8000/accounts/${accountNum}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          setErrorText("");
          return;
        }
        throw new Error("Такой номер счета уже существует");
      })
      .catch((error) => setErrorText(error.message));
  };

  const validateForm = () => {
    const {
      account_num,
      account_type,
      account_balance,
      currency,
    } = newAccountData;
    if (!account_num || !account_type || !account_balance || !currency) {
      return false;
    }
    if (isNaN(account_balance)) {
      return false;
    }
    if (errorText) {
      return false;
    }
    return true;
  };

  const handleAddAccount = () => {
    if (!validateForm()) {
      return;
    }

    const {
      account_num,
      account_type,
      account_balance,
      currency,
      overdraft_limit,
      interest_rate,
      credit_limit,
      social_benefit_type,
    } = newAccountData;

    fetch("http://localhost:8000/accounts/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        account_num: account_num,
        account_type: account_type,
        account_balance: account_balance,
        currency: currency,
        overdraft_limit: overdraft_limit,
        interest_rate: interest_rate,
        credit_limit: credit_limit,
        social_benefit_type: social_benefit_type,
        open_date: new Date().toISOString().slice(0, 10),
        account_activity: true,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setAccounts([...accounts, data]);
        setNewAccountData({
          account_num: "",
          account_type: "",
          account_balance: "",
          currency: "",
          overdraft_limit: "",
          interest_rate: "",
          credit_limit: "",
          social_benefit_type: "",
        });
        setErrorText("");
      })
      .catch((error) => console.error("Ошибка при добавлении счета:", error));
  };

  const handleDetailsClick = (accountId) => {
    navigate(`/account/${accountId}/${userID}`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleAccountTypeChange = (event) => {
    const { name, value } = event.target;
    setNewAccountData({ ...newAccountData, [name]: value });
  };

  const renderAdditionalField = () => {
    switch (newAccountData.account_type) {
      case "checking":
        return (
          <TextField
            label="Лимит овердрафта"
            name="overdraft_limit"
            value={newAccountData.overdraft_limit}
            onChange={handleInputChange}
            variant="outlined"
            margin="normal"
            fullWidth
          />
        );
      case "savings":
        return (
          <TextField
            label="Процентная ставка"
            name="interest_rate"
            value={newAccountData.interest_rate}
            onChange={handleInputChange}
            variant="outlined"
            margin="normal"
            fullWidth
          />
        );
      case "credit":
        return (
          <TextField
            label="Кредитный лимит"
            name="credit_limit"
            value={newAccountData.credit_limit}
            onChange={handleInputChange}
            variant="outlined"
            margin="normal"
            fullWidth
          />
        );
      case "socials":
        return (
          <TextField
            label="Тип социальной выплаты"
            name="social_benefit_type"
            value={newAccountData.social_benefit_type}
            onChange={handleInputChange}
            variant="outlined"
            margin="normal"
            fullWidth
          />
        );
      default:
        return null;
    }
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
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      )
      .then((response) => {
        if (response.status !== 200) return;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/login");
      })
      .catch((error) => handleRequestError(error, navigate));
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
          style={{ background: "#030E32" }}
          position="fixed"
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h6" noWrap component="div">
              Клиенты
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <HeaderAvatar
                alt="avatar"
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
            <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
              <BackButton onClick={() => navigate(-1)}>
                <ArrowBackIcon />
              </BackButton>
              <Typography variant="h5">Назад</Typography>
            </Box>
            {clientInfo && (
              <div style={{ marginBottom: 20 }}>
                <Typography variant="h5" gutterBottom>
                  Личная информация о клиенте {clientInfo.first_name}{" "}
                  {clientInfo.last_name}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Email: {clientInfo.user.email}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Телефон: {clientInfo.phone_number}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Адрес: {clientInfo.address}
                </Typography>
              </div>
            )}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Typography variant="h5" gutterBottom>
                Счета клиента
              </Typography>
            </Box>
            <List>
              {Array.isArray(accounts) &&
                accounts.map((account) => (
                  <div key={account.account_num}>
                    <ListItem>
                      <ListItemText
                        primary={account.account_type}
                        secondary={`Баланс: ${account.account_balance} ${account.currency}`}
                      />
                      <ListItemSecondaryAction>
                        <Button
                          onClick={() =>
                            handleDetailsClick(account.account_num)
                          }
                        >
                          Подробнее
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </div>
                ))}
            </List>
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Typography variant="h5" gutterBottom>
                Добавить счет
              </Typography>
            </Box>
            <TextField
              label="Номер счета"
              name="account_num"
              value={newAccountData.account_num}
              onChange={handleInputChange}
              variant="outlined"
              margin="normal"
              error={!!errorText}
              helperText={errorText}
              fullWidth
            />
            <TextField
              select
              label="Тип счета"
              name="account_type"
              value={newAccountData.account_type}
              onChange={handleAccountTypeChange}
              variant="outlined"
              margin="normal"
              fullWidth
            >
              <MenuItem value="checking">Текущий</MenuItem>
              <MenuItem value="savings">Депозит</MenuItem>
              <MenuItem value="credit">Кредит</MenuItem>
              <MenuItem value="socials">Социальный</MenuItem>
            </TextField>
            <TextField
              label="Баланс"
              name="account_balance"
              value={newAccountData.account_balance}
              onChange={handleInputChange}
              variant="outlined"
              margin="normal"
              error={isNaN(newAccountData.account_balance)}
              helperText={isNaN(newAccountData.account_balance) ? "Введите числовое значение" : ""}
              fullWidth
            />
            <FormControl variant="outlined" margin="normal" fullWidth>
              <InputLabel>Валюта</InputLabel>
              <Select
                value={newAccountData.currency}
                onChange={handleInputChange}
                label="Валюта"
                name="currency"
              >
                {currencies.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {renderAdditionalField()}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <MyButton
                onClick={handleAddAccount}
                variant="contained"
                color="primary"
                style={{ marginTop: 20 }}
                disabled={!validateForm()}
              >
                Добавить счет
              </MyButton>
            </Box>
          </Paper>
        </ContentContainer>
      </Box>
    </MenuContainer>
  );
};

export default ClientAccountsPage;
