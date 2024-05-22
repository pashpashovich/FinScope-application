import React from 'react';
import index from "./headerReg.module.css";
import logo from "./../../images/logo.png";
import { NavLink } from "react-router-dom";

const Header = () => {
    return (
        <header className={index.header}>
            <div className={index.logo_container}>
                <img src={logo} alt="FinanceScope logo" className={index.logo_img} />
                <div className={index.logo_text}>FinanceScope</div>
            </div>
            <nav className={index.nav_container}>
                <div className={index.nav_links}>
                    <NavLink className={index.nav_link} to="/">Главная</NavLink>
                    <NavLink className={index.nav_link} to="/info">Информация</NavLink>
                    <NavLink className={index.nav_link} to="/support">Служба поддержки</NavLink>
                </div>
                <NavLink to="/reg">
                    <button className={index.login_btn}>Регистрация</button>
                </NavLink>
            </nav>
        </header>
    );
}

export default Header;
