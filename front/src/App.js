import React from 'react';
import MainPageUser from "./pages/mainPage/MainPageUser";
import RegisterPage from "./pages/Register/AuthPage";
import LoginPage from "./pages/Login/Login"
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProfilePage from './pages/PersonalPage/ProfilePage';
import ClientsPage from './pages/ClientsPage/ClientsPage';
import ClientsAccountPage from './pages/ClientsAccountPage/ClientsAccountPage';
import EditClietnPage from './pages/EditClient/EditClient';
import AccountTransactionsPage from './pages/AccountTransactions/AccountTransactionsPage';
import Analytics from "./pages/Analytics/alalytics";
import TransactionsReport from "./pages/Reports/accountReport";
import Menu from "./components/verticalMenu/menu";




function App() {
  return (
    <div>
        <Router>
            <Routes>
                <Route path="/" element={<MainPageUser/>}></Route>
                <Route path="/reg" element={<RegisterPage/>}></Route>
                <Route path="/login" element={<LoginPage/>}></Route>
                <Route path="/profile/:userID" element={<ProfilePage/>}></Route>
                <Route path="/data/:userID" element={<ClientsPage/>}></Route>
                <Route path="/login/client/:clientId" element={<ClientsAccountPage />} />
                <Route path="/client/edit/:clientId" element={<EditClietnPage />} />
                <Route path="/account/:accountID" element={<AccountTransactionsPage />} />
                <Route path="/analytics/:userID" element={<Analytics/>} />
                <Route path="/analysis/:userID" element={<TransactionsReport/>} />
                <Route path="/menu" element={<Menu/>} />
            </Routes>
        </Router>
    </div>
  );
}

export default App;
