import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  CssBaseline,
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Grid,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import BankDirectorMenu from "../../components/verticalMenu/directorMenu";
import LogoutIcon from "@mui/icons-material/Logout";
import axios from "axios";
import { styled } from "@mui/system";

const apiUrl = "http://localhost:8000/clients";
const apiUrl2 = "http://localhost:8000/clients/bank-director/";

const Header = styled(AppBar)({
  zIndex: 1300,
  backgroundColor: "#030E32",
});

const MyButton = styled(Button)({
  background: "#6a65ff",
  ":hover": {
    background: "#5a55e0",
  },
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

const UserManagementPage = () => {
  const { userID } = useParams();
  const [users, setUsers] = useState([]);
  const [userDetails, setUserDetails] = useState({});
  const [selectedRole, setSelectedRole] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");

  const fetchAvatar = useCallback(() => {
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
          navigate('/forbidden'); 
        } else if (error.response && error.response.status === 401) {
          navigate('/login'); 
        }
      });
  }, [userID, navigate]);

  const fetchUsers = useCallback(() => {
    fetch(`${apiUrl}/users`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setUsers(data);
        data.forEach((user) => fetchUserDetails(user.id, user.role));
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        if (error.response && error.response.status === 401) {
          navigate('/login');
        }
      });
  }, [navigate]);

  const fetchCurrentUser = useCallback(() => {
    axios
      .get(`http://localhost:8000/users/${userID}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      .then((response) => setUserData(response.data))
      .catch((error) => {
        console.error("Error fetching user data:", error);
        if (error.response && error.response.status === 401) {
          navigate('/login');
        }
      });
  }, [userID, navigate]);

  useEffect(() => {
    fetchUsers();
    fetchCurrentUser();
    fetchAvatar();
  }, [fetchUsers, fetchCurrentUser, fetchAvatar]);

  const fetchUserDetails = (userId, role) => {
    let endpoint = "";
    if (role === "client") {
      endpoint = `${apiUrl}/${userId}/`;
    } else if (role === "analyst") {
      endpoint = `${apiUrl}/financial-analyst/${userId}/`;
    }

    if (endpoint) {
      fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            return {};
          }
          return response.json();
        })
        .then((data) => {
          setUserDetails((prevState) => ({
            ...prevState,
            [userId]: data,
          }));
        })
        .catch((error) => {
          console.error("Error fetching user details:", error);
          if (error.response && error.response.status === 401) {
            navigate('/login');
          }
        });
    } else {
      setUserDetails((prevState) => ({
        ...prevState,
        [userId]: {
          first_name: "",
          last_name: "",
          income: "",
          phone_number: "",
          address: "",
          bank_department_number: "",
        },
      }));
    }
  };

  const handleUpdateRole = (userId) => {
    const role = selectedRole[userId];
    const userDetail = {
      role,
      first_name: userDetails[userId]?.first_name || "",
      last_name: userDetails[userId]?.last_name || "",
      income: userDetails[userId]?.income || "",
      phone_number: userDetails[userId]?.phone_number || "",
      address: userDetails[userId]?.address || "",
      bank_department_number: userDetails[userId]?.bank_department_number || "",
    };

    fetch(`${apiUrl}/update-role/${userId}/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userDetail),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(() => {
        setUsers(
          users.map((user) => (user.id === userId ? { ...user, role } : user))
        );
        fetchUserDetails(userId, role);
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error updating role:", error);
        if (error.response && error.response.status === 401) {
          navigate('/login');
        }
      });
  };

  const handleDelete = (userId) => {
    fetch(`${apiUrl}/delete-user/${userId}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(() => setUsers(users.filter((user) => user.id !== userId)))
      .catch((error) => {
        console.error("Error deleting user:", error);
        if (error.response && error.response.status === 401) {
          navigate('/login');
        }
      });
  };

  const handleBlockUnblock = (userId, action) => {
    fetch(`${apiUrl}/block-unblock-user/${userId}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: JSON.stringify({ action }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(() =>
        setUsers(
          users.map((user) =>
            user.id === userId
              ? { ...user, is_active: action === "unblock" }
              : user
          )
        )
      )
      .catch((error) => {
        console.error("Error blocking/unblocking user:", error);
        if (error.response && error.response.status === 401) {
          navigate('/login');
        }
      });
  };

  const handleInputChange = (e, userId) => {
    const { name, value } = e.target;
    setUserDetails((prevState) => ({
      ...prevState,
      [userId]: {
        ...prevState[userId],
        [name]: value,
      },
    }));
  };

  const handleRoleChange = (e, userId) => {
    const { value } = e.target;
    setSelectedRole((prevState) => ({
      ...prevState,
      [userId]: value,
    }));
    fetchUserDetails(userId, value);
  };

  const handleSaveDetails = (userId, role) => {
    const details = userDetails[userId];
    let endpoint = "";
    let data = {};

    if (role === "client") {
      endpoint = `${apiUrl}/client/${userId}/`;
      data = {
        first_name: details.first_name,
        last_name: details.last_name,
        income: details.income,
        phone_number: details.phone_number,
        address: details.address,
      };
    } else if (role === "analyst") {
      endpoint = `${apiUrl}/analyst/${userId}/`;
      data = {
        first_name: details.first_name,
        last_name: details.last_name,
        bank_department_number: details.bank_department_number,
        phone_number: details.phone_number,
      };
    }

    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .catch((error) => {
        console.error("Error saving details:", error);
        if (error.response && error.response.status === 401) {
          navigate('/login');
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

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filteredUsers = users.filter((user) => {
    return user.email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <BankDirectorMenu userID={userID} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Header position="fixed">
          <MyToolbar>
            <Typography
              style={{ color: "white" }}
              variant="h6"
              noWrap
              component="div"
            >
              Пользователи
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <HeaderAvatar
                alt={"User Avatar"}
                src={avatarUrl || "/static/images/avatar/1.jpg"}
              />
              <IconButton onClick={handleLogout}>
                <LogoutIcon style={{ color: "white" }} />
              </IconButton>
            </Box>
          </MyToolbar>
        </Header>
        <Toolbar />
        <Container maxWidth="lg">
          <Typography variant="h4" gutterBottom>
            Управление пользователями
          </Typography>
          <TextField
            label="Search by Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <Paper sx={{ p: 2, marginTop: 2 }}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{ backgroundColor: "#f5f5f5", fontWeight: "bold" }}
                    >
                      <TableSortLabel
                        active={sortConfig.key === "id"}
                        direction={sortConfig.direction}
                        onClick={() => handleSort("id")}
                      >
                        ID
                      </TableSortLabel>
                    </TableCell>
                    <TableCell
                      sx={{ backgroundColor: "#f5f5f5", fontWeight: "bold" }}
                    >
                      <TableSortLabel
                        active={sortConfig.key === "email"}
                        direction={sortConfig.direction}
                        onClick={() => handleSort("email")}
                      >
                        Электронная почта
                      </TableSortLabel>
                    </TableCell>
                    <TableCell
                      sx={{ backgroundColor: "#f5f5f5", fontWeight: "bold" }}
                    >
                      <TableSortLabel
                        active={sortConfig.key === "role"}
                        direction={sortConfig.direction}
                        onClick={() => handleSort("role")}
                      >
                        Роль
                      </TableSortLabel>
                    </TableCell>
                    <TableCell
                      sx={{ backgroundColor: "#f5f5f5", fontWeight: "bold" }}
                    >
                      <TableSortLabel
                        active={sortConfig.key === "is_active"}
                        direction={sortConfig.direction}
                        onClick={() => handleSort("is_active")}
                      >
                        Статус
                      </TableSortLabel>
                    </TableCell>
                    <TableCell
                      sx={{ backgroundColor: "#f5f5f5", fontWeight: "bold" }}
                    >
                      Действия
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      sx={{
                        "&:nth-of-type(odd)": { backgroundColor: "#f9f9f9" },
                      }}
                    >
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <FormControl sx={{ minWidth: 120 }}>
                          <InputLabel>Роль</InputLabel>
                          <Select
                            value={selectedRole[user.id] || user.role}
                            onChange={(e) => handleRoleChange(e, user.id)}
                            displayEmpty
                          >
                            <MenuItem value="client">Клиент</MenuItem>
                            <MenuItem value="analyst">Аналитик</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        {user.is_active ? "Активен" : "Заблокирован"}
                      </TableCell>
                      <TableCell>
                        <Grid container spacing={1}>
                          <Grid item xs={12} sm={6} md={4}>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleUpdateRole(user.id)}
                              fullWidth
                            >
                              Обновить роль
                            </Button>
                          </Grid>
                          <Grid item xs={12} sm={6} md={4}>
                            <MyButton
                              variant="contained"
                              color="secondary"
                              onClick={() => handleDelete(user.id)}
                              fullWidth
                            >
                              Удалить
                            </MyButton>
                          </Grid>
                          <Grid item xs={12} sm={6} md={4}>
                            <Button
                              variant="contained"
                              onClick={() =>
                                handleBlockUnblock(
                                  user.id,
                                  user.is_active ? "block" : "unblock"
                                )
                              }
                              fullWidth
                            >
                              {user.is_active ? "Заблокировать" : "Разблокировать"}
                            </Button>
                          </Grid>
                        </Grid>
                        {userDetails[user.id] && (
                          <>
                            <TextField
                              name="first_name"
                              label="Имя"
                              value={userDetails[user.id]?.first_name || ""}
                              onChange={(e) => handleInputChange(e, user.id)}
                              fullWidth
                              margin="normal"
                            />
                            <TextField
                              name="last_name"
                              label="Фамилия"
                              value={userDetails[user.id]?.last_name || ""}
                              onChange={(e) => handleInputChange(e, user.id)}
                              fullWidth
                              margin="normal"
                            />
                            {selectedRole[user.id] === "client" && (
                              <>
                                <TextField
                                  name="income"
                                  label="Доход"
                                  value={userDetails[user.id]?.income || ""}
                                  onChange={(e) =>
                                    handleInputChange(e, user.id)
                                  }
                                  fullWidth
                                  margin="normal"
                                />
                                <TextField
                                  name="phone_number"
                                  label="Номер телефона"
                                  value={
                                    userDetails[user.id]?.phone_number || ""
                                  }
                                  onChange={(e) =>
                                    handleInputChange(e, user.id)
                                  }
                                  fullWidth
                                  margin="normal"
                                />
                                <TextField
                                  name="address"
                                  label="Адрес"
                                  value={userDetails[user.id]?.address || ""}
                                  onChange={(e) =>
                                    handleInputChange(e, user.id)
                                  }
                                  fullWidth
                                  margin="normal"
                                />
                              </>
                            )}
                            {selectedRole[user.id] === "analyst" && (
                              <>
                                <TextField
                                  name="bank_department_number"
                                  label="Номер банковского отделения"
                                  value={
                                    userDetails[user.id]
                                      ?.bank_department_number || ""
                                  }
                                  onChange={(e) =>
                                    handleInputChange(e, user.id)
                                  }
                                  fullWidth
                                  margin="normal"
                                />
                                <TextField
                                  name="phone_number"
                                  label="Номер телефона"
                                  value={
                                    userDetails[user.id]?.phone_number || ""
                                  }
                                  onChange={(e) =>
                                    handleInputChange(e, user.id)
                                  }
                                  fullWidth
                                  margin="normal"
                                />
                              </>
                            )}
                            <MyButton
                              variant="contained"
                              color="primary"
                              onClick={() =>
                                handleSaveDetails(
                                  user.id,
                                  selectedRole[user.id] || user.role
                                )
                              }
                              sx={{ marginTop: 1 }}
                            >
                              Сохранить изменения
                            </MyButton>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default UserManagementPage;
