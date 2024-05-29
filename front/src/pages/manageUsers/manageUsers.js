import React, { useState, useEffect, useCallback } from 'react';
import { Box, Container, Typography, AppBar, Toolbar, IconButton, Avatar, CssBaseline, TextField, Button, FormControl, Select, MenuItem, InputLabel, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import BankDirectorMenu from '../../components/verticalMenu/directorMenu';
import LogoutIcon from '@mui/icons-material/Logout';
import axios from 'axios';

const apiUrl = 'http://localhost:8000/clients';

const UserManagementPage = () => {
    const { userID } = useParams();
    const [users, setUsers] = useState([]);
    const [userDetails, setUserDetails] = useState({});
    const [selectedRole, setSelectedRole] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);

    const fetchUsers = useCallback(() => {
        fetch(`${apiUrl}/users`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setUsers(data);
                data.forEach(user => fetchUserDetails(user.id, user.role));
            })
            .catch(error => console.error('Error fetching users:', error));
    }, []);

    const fetchCurrentUser = useCallback(() => {
        axios.get(`http://localhost:8000/users/${userID}/`, {
            withCredentials: true
        })
        .then(response => setUserData(response.data))
        .catch(error => console.error('Error fetching user data:', error));
    }, [userID]);

    useEffect(() => {
        fetchUsers();
        fetchCurrentUser();
    }, [fetchUsers, fetchCurrentUser]);

    const fetchUserDetails = (userId, role) => {
        let endpoint = '';
        if (role === 'client') {
            endpoint = `${apiUrl}/${userId}/`;
        } else if (role === 'analyst') {
            endpoint = `${apiUrl}/financial-analyst/${userId}/`;
        }

        if (endpoint) {
            fetch(endpoint)
                .then(response => {
                    if (!response.ok) {
                        return {}; 
                    }
                    return response.json();
                })
                .then(data => {
                    setUserDetails(prevState => ({
                        ...prevState,
                        [userId]: data,
                    }));
                })
                .catch(error => console.error('Error fetching user details:', error));
        } else {
            setUserDetails(prevState => ({
                ...prevState,
                [userId]: {
                    first_name: '',
                    last_name: '',
                    income: '',
                    phone_number: '',
                    address: '',
                    bank_department_number: '',
                },
            }));
        }
    };

    const handleUpdateRole = (userId) => {
        const role = selectedRole[userId];
        const userDetail = {
            role,
            first_name: userDetails[userId]?.first_name || '',
            last_name: userDetails[userId]?.last_name || '',
            income: userDetails[userId]?.income || '',
            phone_number: userDetails[userId]?.phone_number || '',
            address: userDetails[userId]?.address || '',
            bank_department_number: userDetails[userId]?.bank_department_number || ''
        };

        fetch(`${apiUrl}/update-role/${userId}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userDetail),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(() => {
            setUsers(users.map(user => user.id === userId ? { ...user, role } : user));
            fetchUserDetails(userId, role);
        })
        .catch(error => console.error('Error updating role:', error));
    };

    const handleDelete = (userId) => {
        fetch(`${apiUrl}/delete-user/${userId}/`, {
            method: 'DELETE',
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(() => setUsers(users.filter(user => user.id !== userId)))
        .catch(error => console.error('Error deleting user:', error));
    };

    const handleBlockUnblock = (userId, action) => {
        fetch(`${apiUrl}/block-unblock-user/${userId}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(() => setUsers(users.map(user => user.id === userId ? { ...user, is_active: action === 'unblock' } : user)))
        .catch(error => console.error('Error blocking/unblocking user:', error));
    };

    const handleInputChange = (e, userId) => {
        const { name, value } = e.target;
        setUserDetails(prevState => ({
            ...prevState,
            [userId]: {
                ...prevState[userId],
                [name]: value,
            },
        }));
    };

    const handleRoleChange = (e, userId) => {
        const { value } = e.target;
        setSelectedRole(prevState => ({
            ...prevState,
            [userId]: value,
        }));
        fetchUserDetails(userId, value);
    };

    const handleSaveDetails = (userId, role) => {
        const details = userDetails[userId];
        let endpoint = '';
        let data = {};

        if (role === 'client') {
            endpoint = `${apiUrl}/client/${userId}/`;
            data = {
                first_name: details.first_name,
                last_name: details.last_name,
                income: details.income,
                phone_number: details.phone_number,
                address: details.address,
            };
        } else if (role === 'analyst') {
            endpoint = `${apiUrl}/analyst/${userId}/`;
            data = {
                first_name: details.first_name,
                last_name: details.last_name,
                bank_department_number: details.bank_department_number,
                phone_number: details.phone_number,
            };
        }

        fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .catch(error => console.error('Error saving details:', error));
    };

    const handleLogout = () => {
        axios.post('http://localhost:8000/api/logout', {})
            .then(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('userRole');
                navigate('/login');
            })
            .catch((error) => console.error('Error during logout:', error));
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const filteredUsers = users.filter(user => {
        return user.email.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const sortedUsers = [...filteredUsers].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <BankDirectorMenu userID={userID} />
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, background: '#030E32' }}>
                    <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h6" noWrap component="div">
                            Управление пользователями
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {userData && (
                                <Avatar
                                    alt={userData.first_name}
                                    src={userData.avatar || "/static/images/avatar/1.jpg"}
                                    sx={{ width: 40, height: 40, marginRight: 2 }}
                                />
                            )}
                            <IconButton onClick={handleLogout}>
                                <LogoutIcon style={{ color: 'white' }} />
                            </IconButton>
                        </Box>
                    </Toolbar>
                </AppBar>
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
                                        <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                                            <TableSortLabel
                                                active={sortConfig.key === 'id'}
                                                direction={sortConfig.direction}
                                                onClick={() => handleSort('id')}
                                            >
                                                ID
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                                            <TableSortLabel
                                                active={sortConfig.key === 'email'}
                                                direction={sortConfig.direction}
                                                onClick={() => handleSort('email')}
                                            >
                                                Email
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                                            <TableSortLabel
                                                active={sortConfig.key === 'role'}
                                                direction={sortConfig.direction}
                                                onClick={() => handleSort('role')}
                                            >
                                                Role
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                                            <TableSortLabel
                                                active={sortConfig.key === 'is_active'}
                                                direction={sortConfig.direction}
                                                onClick={() => handleSort('is_active')}
                                            >
                                                Status
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sortedUsers.map((user) => (
                                        <TableRow key={user.id} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' } }}>
                                            <TableCell>{user.id}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <FormControl sx={{ minWidth: 120 }}>
                                                    <InputLabel>Role</InputLabel>
                                                    <Select
                                                        value={selectedRole[user.id] || user.role}
                                                        onChange={(e) => handleRoleChange(e, user.id)}
                                                        displayEmpty
                                                    >
                                                        <MenuItem value="client">Client</MenuItem>
                                                        <MenuItem value="analyst">Analyst</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </TableCell>
                                            <TableCell>{user.is_active ? 'Active' : 'Blocked'}</TableCell>
                                            <TableCell>
                                                <Button variant="contained" color="primary" onClick={() => handleUpdateRole(user.id)} sx={{ marginRight: 1 }}>
                                                    Update Role
                                                </Button>
                                                <Button variant="contained" color="secondary" onClick={() => handleDelete(user.id)} sx={{ marginRight: 1 }}>
                                                    Delete
                                                </Button>
                                                <Button variant="contained" onClick={() => handleBlockUnblock(user.id, user.is_active ? 'block' : 'unblock')}>
                                                    {user.is_active ? 'Block' : 'Unblock'}
                                                </Button>
                                                {userDetails[user.id] && (
                                                    <>
                                                        <TextField
                                                            name="first_name"
                                                            label="First Name"
                                                            value={userDetails[user.id]?.first_name || ''}
                                                            onChange={(e) => handleInputChange(e, user.id)}
                                                            fullWidth
                                                            margin="normal"
                                                        />
                                                        <TextField
                                                            name="last_name"
                                                            label="Last Name"
                                                            value={userDetails[user.id]?.last_name || ''}
                                                            onChange={(e) => handleInputChange(e, user.id)}
                                                            fullWidth
                                                            margin="normal"
                                                        />
                                                        {selectedRole[user.id] === 'client' && (
                                                            <>
                                                                <TextField
                                                                    name="income"
                                                                    label="Income"
                                                                    value={userDetails[user.id]?.income || ''}
                                                                    onChange={(e) => handleInputChange(e, user.id)}
                                                                    fullWidth
                                                                    margin="normal"
                                                                />
                                                                <TextField
                                                                    name="phone_number"
                                                                    label="Phone Number"
                                                                    value={userDetails[user.id]?.phone_number || ''}
                                                                    onChange={(e) => handleInputChange(e, user.id)}
                                                                    fullWidth
                                                                    margin="normal"
                                                                />
                                                                <TextField
                                                                    name="address"
                                                                    label="Address"
                                                                    value={userDetails[user.id]?.address || ''}
                                                                    onChange={(e) => handleInputChange(e, user.id)}
                                                                    fullWidth
                                                                    margin="normal"
                                                                />
                                                            </>
                                                        )}
                                                        {selectedRole[user.id] === 'analyst' && (
                                                            <>
                                                                <TextField
                                                                    name="bank_department_number"
                                                                    label="Bank Department Number"
                                                                    value={userDetails[user.id]?.bank_department_number || ''}
                                                                    onChange={(e) => handleInputChange(e, user.id)}
                                                                    fullWidth
                                                                    margin="normal"
                                                                />
                                                                <TextField
                                                                    name="phone_number"
                                                                    label="Phone Number"
                                                                    value={userDetails[user.id]?.phone_number || ''}
                                                                    onChange={(e) => handleInputChange(e, user.id)}
                                                                    fullWidth
                                                                    margin="normal"
                                                                />
                                                            </>
                                                        )}
                                                        <Button variant="contained" color="primary" onClick={() => handleSaveDetails(user.id, selectedRole[user.id] || user.role)} sx={{ marginTop: 1 }}>
                                                            Save Details
                                                        </Button>
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
