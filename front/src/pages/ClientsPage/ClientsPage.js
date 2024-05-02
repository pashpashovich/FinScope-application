import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useState, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom'; 

const apiUrl = 'http://localhost:8000/clients/'; 

function ClientsDataGrid() {
    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'first_name', headerName: 'Имя', width: 130 },
        { field: 'last_name', headerName: 'Фамилия', width: 130 },
        { field: 'email', headerName: 'Email', width: 200 },
        { field: 'phone_number', headerName: 'Телефон', width: 150 },
        { field: 'address', headerName: 'Адрес', width: 200 },
        { field: 'date_created', headerName: 'Дата создания', width: 170 },
        { 
            field: 'details',
            headerName: 'Подробнее',
            width: 150,
            renderCell: (params) => (
                <IconButton onClick={() => handleDetailsClick(params.row.id)}>Подробнее</IconButton>
            )
        },
    ];
    const [clients, setClients] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const navigate = useNavigate(); 

    useEffect(() => {
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => setClients(data))
            .catch(error => console.error(error));
    }, []);

    const handleDeleteSelected = () => {
        selectedRows.forEach(id => {
            fetch(`${apiUrl}${id}/`, {
                method: 'DELETE',
            })
                .then(response => {
                    if (response.ok) {
                        setClients(clients => clients.filter(client => client.id !== id));
                    } else {
                        console.error('Ошибка при удалении:', response.status);
                    }
                })
                .catch(error => console.error(error));
        });
    };

    function handleDetailsClick(clientId) {
        navigate(`/client/${clientId}`);
    }

    return (
        <div style={{ height: 400, width: '100%' }}>
            <DataGrid
                rows={clients}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5, 10, 20]}
                checkboxSelection
                disableSelectionOnClick
                onPageChange={(params) => console.log(params)}
                onRowSelectionModelChange={(newSelection) => setSelectedRows(newSelection)}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                <IconButton onClick={handleDeleteSelected}>
                    <DeleteIcon />
                </IconButton>
            </div>
        </div>
    );
}

export default ClientsDataGrid;
