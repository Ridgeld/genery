import React, { useContext } from "react";
import styles from './Footer.module.scss'
import FooterItem from './FooterItem';
import {ElementContext} from '../../../providers/ElementProvider'
import { useNavigate } from "react-router-dom";
import { motion, AnimateSharedLayout, LayoutGroup} from 'framer-motion';

function defaultFooter() {
    const { elementColors, theme } = useContext(ElementContext);
    const footerItems = [
        { icon: 
            <svg width="26" height="25" viewBox="0 0 26 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24.5 21.4781V12.988C24.5 12.3039 24.359 11.6269 24.0855 10.9982C23.812 10.3696 23.4118 9.80239 22.9092 9.3312L14.7608 1.69353C14.2858 1.24827 13.6557 1 13.0006 1C12.3455 1 11.7154 1.24827 11.2405 1.69353L3.09083 9.3312C2.58822 9.80239 2.188 10.3696 1.91452 10.9982C1.64103 11.6269 1.5 12.3039 1.5 12.988V21.4781C1.5 22.1469 1.76925 22.7884 2.2485 23.2613C2.72776 23.7343 3.37778 24 4.05556 24H21.9444C22.6222 24 23.2722 23.7343 23.7515 23.2613C24.2308 22.7884 24.5 22.1469 24.5 21.4781Z" stroke={theme.text_first_color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>, 
          link: '#/menu' },
        { icon: 
            <svg width="26" height="25" viewBox="0 0 26 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.66667 7.38889H18.3333M7.66667 12.5H15.6667M14.3333 18.8889L7.66667 22.7222V18.8889H5C3.93913 18.8889 2.92172 18.485 2.17157 17.7661C1.42143 17.0472 1 16.0722 1 15.0556V4.83333C1 3.81667 1.42143 2.84165 2.17157 2.12276C2.92172 1.40387 3.93913 1 5 1H21C22.0609 1 23.0783 1.40387 23.8284 2.12276C24.5786 2.84165 25 3.81667 25 4.83333V11.8611M22.3333 16.3333L19.6667 20.1667H25L22.3333 24" stroke={theme.text_first_color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>, 
          link: '#/messenger' },
        { icon: 
            <svg width="26" height="27" viewBox="0 0 26 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.8333 7.74997H16.8461M14.9167 24.3611H5.33333C4.31667 24.3611 3.34165 23.9572 2.62276 23.2383C1.90387 22.5194 1.5 21.5444 1.5 20.5278V5.19442C1.5 4.17775 1.90387 3.20273 2.62276 2.48384C3.34165 1.76495 4.31667 1.36108 5.33333 1.36108H20.6667C21.6833 1.36108 22.6584 1.76495 23.3772 2.48384C24.0961 3.20273 24.5 4.17775 24.5 5.19442V13.5" stroke={theme.text_first_color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1.5 17.9721L7.88889 11.5832C9.07467 10.4422 10.5364 10.4422 11.7222 11.5832L16.8333 16.6944" stroke={theme.text_first_color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15.5557 15.4167L16.8334 14.1389C17.6883 13.3173 18.6862 13.0873 19.619 13.4489M21.9446 17.9723L19.389 21.8056H24.5001L21.9446 25.6389" stroke={theme.text_first_color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>, 
          link: '#/posts' },
        { icon: 
            <svg width="26" height="17" viewBox="0 0 26 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1.5H25" stroke={theme.text_first_color} strokeWidth="2" strokeLinecap="round"/>
                <path d="M1 8.5H25" stroke={theme.text_first_color} strokeWidth="2" strokeLinecap="round"/>
                <path d="M1 15.5H25" stroke={theme.text_first_color} strokeWidth="2" strokeLinecap="round"/>
            </svg>, 
          link: '#/list-menu' },
        // Добавьте другие элементы, как необходимо
      ];

    
      return (
        elementColors.isFooter && (
            <div className={styles.footer}
              style={{
                background: elementColors.footerBackground
              }}>
                <LayoutGroup id="footer">
                    {footerItems.map((item, index) => (
                      <FooterItem 
                          key={index}
                          icon={item.icon}
                          link={item.link}
                          isActive={index === elementColors.activeElementIndex}
                        // onClick={handleItemClick}
                      />
                    ))}
                </LayoutGroup>
            </div>
        )
    );

}
export default defaultFooter