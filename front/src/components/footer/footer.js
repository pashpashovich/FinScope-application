import React from 'react';
import logo from "./../../images/logo.png"
import index from "./footer.module.css";
import socials from "./../../images/socials.png" 


const Footer = () => {
    return (
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
    );
}

export default Footer;