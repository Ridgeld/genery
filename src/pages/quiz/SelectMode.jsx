import React, { useContext, useEffect, useState } from 'react';
import styles from './Quiz.module.scss';
import { ElementContext, useTheme } from '../../providers/ElementProvider.jsx';
import Block from './Block.jsx';
import { useNavigate } from 'react-router-dom';

function SelectMode(){
    const {theme, setThemeById, elementColors, setElementColors } = useContext(ElementContext);
    const navigateTo = useNavigate()
    const [mode, setMode] = useState();

    const blocks = [
        {
            blockColor: theme.second_color,
            name: 'English',
            labelName: '5 секунд',
            textColor: theme.background_color,
            labelcolor: theme.background_color,
            labelTextColor: theme.text_first_color,
            arrowBackground: theme.block_arrow_first_color,
            onClick: () => navigateTo('/quiz/english')
        },
        {
            blockColor: theme.third_color,
            name: 'Кыргызский язык',
            labelName: '20 секунд',
            textColor: theme.text_first_color,
            labelcolor: theme.text_first_color,
            labelTextColor: theme.background_color,
            arrowBackground: theme.block_arrow_first_color,
            onClick:  () => navigateTo('/quiz/kyrgyz')
        },
        {
            blockColor: theme.first_color,
            name: 'Русский язык',
            labelName: '15 секунд',
            textColor: theme.text_first_color,
            labelcolor: theme.text_first_color,
            labelTextColor: theme.background_color,
            arrowBackground: theme.block_arrow_first_color,
            onClick:  () => navigateTo('/quiz/russian')
        },
        {
            blockColor: theme.second_color,
            name: 'Математика',
            labelName: '20 секунд',
            textColor: theme.background_color,
            labelcolor: theme.background_color,
            labelTextColor: theme.text_first_color,
            arrowBackground: theme.block_arrow_first_color,
            onClick: () => navigateTo('/quiz/math')
        },

    ]

    useEffect(() => {
        setElementColors({
            iconColor: theme.icon_color,
            titleColor: theme.text_first_color,
            showArrow: true,
            arrowLink: '#/game-menu',
            arrowColor: theme.text_first_color,
            isHeaderBackground: true,
            headerBackground: theme.background_color,
            isHeader: true,
            isFooter: false,
            footerBackground: theme.background_color,
            activeElementIndex: 0,
            background: theme.background_color
        });
        document.body.style.background = theme.background_color
        },[ElementContext]);
    
    return(
        <div className={styles['container']}>
            <style>{`
                ::-webkit-scrollbar {
                  width: 10px; /* Ширина ползунка */
                }

                /* Стилизация ползунка скроллбара */
                ::-webkit-scrollbar-thumb {
                  background: ${theme.first_color}; /* Цвет ползунка */
                  border-radius: 5px; /* Закругление углов ползунка */
                  cursor: pointer;
                }

                /* Стилизация фона скроллбара */
                ::-webkit-scrollbar-track {
                  background-color: rgba($color: #000000, $alpha: 0.3); /* Цвет фона */
                }
            `}</style>
            <h4 className={styles['title']}
                style={{
                    color: theme.text_first_color
                }}>Выберите режим:</h4>
            {blocks.map((block, index) => (
                <Block 
                    key={index}
                    blockColor={block.blockColor}
                    name={block.name}
                    textColor={block.textColor}
                    labelColor={block.labelcolor}
                    labelName={block.labelName}
                    labelTextColor={block.labelTextColor}
                    arrowBackground={block.arrowBackground}
                    onClick={block.onClick}/>
            ))}
        </div>
    )
}
export default SelectMode