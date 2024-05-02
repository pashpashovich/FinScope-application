import React from 'react';
import MainPageUser from "./pages/mainPage/MainPageUser";
import RegisterPage from "./pages/Register/AuthPage";
import LoginPage from "./pages/Login/Login"
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProfilePage from './pages/PersonalPage/ProfilePage';
import ClientsPage from './pages/ClientsPage/ClientsPage';
import ClientsAccountPage from './pages/ClientsAccountPage/ClientsAccountPage';
import AccountTransactionsPage from './pages/AccountTransactions/AccountTransactionsPage';






function App() {
  return (
    <div>
        <Router>
            <Routes>
                <Route path="/" element={<MainPageUser/>}></Route>
                <Route path="/reg" element={<RegisterPage/>}></Route>
                <Route path="/login" element={<LoginPage/>}></Route>
                <Route path="/profile" element={<ProfilePage/>}></Route>
                <Route path="/clients" element={<ClientsPage/>}></Route>
                <Route path="/client/:clientId" element={<ClientsAccountPage />} />
                <Route path="/account/:accountID" element={<AccountTransactionsPage />} />
            </Routes>
        </Router>
    </div>
  );
}

export default App;
