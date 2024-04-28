import React from 'react';
import index from "./header.module.css";
import logo from "./../../images/logo.png" 

const Header = () => {
    return ( 
        <header>
                <div className={index.logo_container}>
                    <img src={logo} alt="FinanceScope logo" className={index.logo_img} />
                    <a className={index.logo} href="#">
                        <div className={index.logo_text}>FinanceScope</div>
                    </a>
                </div>
                <nav className={index.nav_container}>
                    <div className={index.nav_links}>
                        <a className={index.nav_link} href="#">Главная</a>
                        <a className={index.nav_link} href="#">Информация</a>
                        <a className={index.nav_link} href="#">Служба поддержки</a>
                    </div>
                    <button id={index.login_btn} className={index.login_btn}>Войти</button>
                </nav>
            </header>
     );
}
 
export default Header;