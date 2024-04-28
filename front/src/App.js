import React from 'react';
import MainPageUser from "./pages/mainPage/MainPageUser";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';



function App() {
  return (
    <div>
        <Router>
            <Routes>
                <Route path="/" element={<MainPageUser/>}></Route>
            </Routes>
        </Router>
    </div>
  );
}

export default App;
