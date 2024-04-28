import React from 'react';
import index from "./index.module.css";
import logo from "./../../images/logo.png" 
import tablet from "./../../images/tablet.png" 
import socials from "./../../images/socials.png"
import Header from "../../components/header/header"

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
                <button href="#" className={index.register_btn}>Регистрация</button>
                <button href="#" className={index.learn_more_btn}>Узнать больше</button>
            </div>
            <img src={tablet} alt="FinanceScope app preview" className={index.hero_img} />
            <footer className={index.footer}>
                <div className={index.footer_content}>
                    <div className={index.footer_top}>
                        <div className={index.footer_logo}>
                            <div className={index.footer_logo_container}>
                                <img src={logo} alt="FinanceScope logo" className={index.logo_img} />
                                <div className={index.footer_logo_text}>FinanceScope</div>
                            </div>
                            <img src={socials} alt="Social media icons" className={index.footer_social_icons} />
                        </div>
                        <div className={index.footer_links}>
                            <a href="#" className={index.footer_link}>Сервисы</a>
                            <a href="#" className={index.footer_link}>Продукт</a>
                            <a href="#" className={index.footer_link}>Компания</a>
                            <a href="#" className={index.footer_link}>Больше</a>
                        </div>
                    </div>
                    <div className={index.footer_copyright}>
                        © 2024 FinanceScope Все права защищены
                    </div>
                </div>
            </footer>
            {/* <script>
                document.getElementById(index.login_btn).addEventListener("click", function() {
                    window.location.href = "/login/"
                }
                );
            </script> */}
        </div>
    );
};

export default MainPageUser;