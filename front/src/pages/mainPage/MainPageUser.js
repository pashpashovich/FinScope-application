import React from 'react';
import index from "./index.module.css";
import tablet from "./../../images/tablet.png" 
import Header from "../../components/header/header"
import Footer from "../../components/footer/footer"
import { NavLink } from "react-router-dom";


const MainPageUser = () => {
    return (
        <div className={index.finance_scope}>
            <Header />
            <h1 className={index.hero_title}>
                Регистрируйтесь для эффективного анализа ваших финансов ️
            </h1>
            <p className={index.hero_subtitle}>
                Слишком много данных, чтобы что-то понять? <br />
                <span style={{ fontStyle: 'italic' }}>FinanceScope</span> поможет
            </p>
            <div className={index.hero_cta}>
            <NavLink className={index.nav} to="/reg">
                <button className={index.register_btn}>Регистрация</button>
            </NavLink>
                <button href="#" className={index.learn_more_btn}>Узнать больше</button>
            </div>
            <img src={tablet} alt="FinanceScope app preview" className={index.hero_img} />
            <Footer />
        </div>
    );
};

export default MainPageUser;