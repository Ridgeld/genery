import React, { useContext, useState } from 'react';
import styles from './Messenger.module.scss';
import emojis from './Emojies';
import parse from "html-react-parser";
import { ElementContext } from '../../providers/ElementProvider.jsx';
function EmojiPanel(props) {
    const [currentCategory, setCurrentCategory] = useState(emojis[0].name);
    const {theme, setThemeById, elementColors, setElementColors } = useContext(ElementContext);

    const handleCategoryClick = (category) => {
        setCurrentCategory(category);
    };
    const handleEmojiClick = (emoji) => {
        props.onEmojiSelect(emoji); // Передаем выбранный эмодзи в родительский компонент
    };

    return (
        <div className={styles['emoji-panel']}
            style={{
                background: props.backgroundColor
            }}>
            <div className={styles.categories}>
                {/* Кнопки для категорий */}
                {emojis.map((category) => {
                const iconWithThemeColor = category.icon.replace(/{theme.text_first_color}/g, theme.text_first_color);
                return (
                    <button
                        key={category.name}
                        className={`${styles['emoji-category']} ${currentCategory === category.name ? styles['active'] : ''}`}
                        onClick={() => handleCategoryClick(category.name)}
                    >
                        {parse(iconWithThemeColor)}
                    </button>
                );
            })}
            </div>
            <div className={styles['emojies-container']}>
                {/* Условный рендеринг контейнера с категорией */}
                {emojis.map((category) => (
                    <div key={category.name} className={styles['emojies-body']} style={{ display: currentCategory === category.name ? 'block' : 'none' }}>
                        <h2 className={styles['category-name']} style={{ color: props.textColor }}>{category.name}</h2>
                        <div className={styles['emojies-content']}>
                            {category.emojis.map((emoji) => (
                                <span 
                                    className={styles.emoji} key={emoji} 
                                    onClick={() => handleEmojiClick(emoji)}>{emoji}</span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default EmojiPanel;
