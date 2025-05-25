import React, { useContext, useEffect, useRef, useState } from 'react';
import styles from './EmojiPanel.module.scss';
import emojies from './Emojies';
import parse from "html-react-parser";
import { useAuth } from '../../../../providers/Authprovired';
import { ElementContext } from '../../../../providers/ElementProvider';
import { db } from '../../../../../firebase';
import { doc, getDoc } from 'firebase/firestore';

function EmojiPanel({isShow, isImages, isTop, marginTop, onEmojiSelect}) {
    const {theme, setThemeById, elementColors, setElementColors } = useContext(ElementContext);
    const { authUser } = useAuth();
    const [currentCategory, setCurrentCategory] = useState(emojies[0].name);
    const [userEmojies, setUserEmojies] = useState(['smiles', 'animals', 'food', 
                                                    'exercise','transport','objects', 
                                                    'flags']);
    const categoryRefs = useRef({});
    const categoriesRef = useRef();
    const containerRef = useRef();

    const [marginTopPanel, setMarginTopPanel] = useState();
    const [EmojiesToMap, setEmojiesToMap] = useState([])

    useEffect(() =>{
        setMarginTopPanel(marginTop)
    }, [marginTop])

    const handleCategoryClick = (category, isCustom) => {
        // setCurrentCategory(category);
        // if(isCustom) {
        //     const customCategory = filteredEmojies.find((category) => category.isCustom);
        //     if (customCategory) {
        //         alert(customCategory.name);
        //         containerRef.current.innerHTML = ;
        //     }
        // }

        setCurrentCategory(category);
        // if (categoryRefs.current[category]) {
        //     categoryRefs.current[category].scrollIntoView({
        //     behavior: 'smooth',
        //     block: 'start'
        //   });
        // }
        if (categoryRefs.current[category] && containerRef.current) {
            const scrollOffset = categoryRefs.current[category].offsetTop - containerRef.current.offsetTop;
            containerRef.current.scrollTo({
                top: scrollOffset,
                behavior: 'smooth'
            });
        }
    };
    
    const handleEmojiClick = (emoji, isImg, font) => {
        onEmojiSelect(emoji, isImg, font); // Передаем выбранный эмодзи в родительский компонент
    };

    useEffect(() => {
        const fetchUserPreferences = async () => {
            if (authUser && authUser._id) {
                const userDocRef = doc(db, 'users', authUser._id, 'info', 'preferences');
                const docSnap = await getDoc(userDocRef);

                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    // console.log(userData);
                    setUserEmojies((prevEmojies => [...prevEmojies, ...userData.boughtEmojies]));
                } else {
                    console.log("No such document!");
                }
            } else {
                console.error('authUser or authUser._id is undefined');
            }
        }

        fetchUserPreferences();
    }, []);

    const filteredEmojies = userEmojies ? 
        emojies.filter(emojie => userEmojies.includes(emojie.name))
    : []
    
    useEffect(() => {
        const handleWheel = (e) => {
          if (categoriesRef.current) {
            // alert(9)
            categoriesRef.current.scrollLeft += (e.deltaY / 5);
          }
        };
    
        const textarea = categoriesRef.current;
        if (textarea) {
          textarea.addEventListener('wheel', handleWheel);
        }
    
        return () => {
          if (textarea) {
            textarea.removeEventListener('wheel', handleWheel);
          }
        };
      }, []);

    useEffect(() => {
        const options = {
            root: containerRef.current,
            rootMargin: '0px',
            threshold: Array.from({ length: 101 }, (_, i) => i / 100)
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setCurrentCategory(entry.target.getAttribute('data-category'));
                }
            });
        }, options);

        const categoryElements = Object.values(categoryRefs.current);
        categoryElements.forEach(element => {
            observer.observe(element);
        });

        return () => {
            categoryElements.forEach(element => {
                observer.unobserve(element);
            });
        };
    }, []);


    return (
        <div className={`${styles['emoji-panel']} ${isShow ? styles['show'] : ''}`}
            style={{
                background: theme.element_first_color,
                bottom: isTop ? 'auto': '50px',
                // top: isTop ? `calc(50px + ${marginTopPanel})` : '0' ,
                top: isTop ? `${marginTop}` : 'auto',
                transformOrigin: isTop ? 'top left' : 'bottom left',
                boxShadow: `0 5px 10px 5px ${theme.shadow_color}`,

            }}>
                <style>{`
                    div::-webkit-scrollbar {
                      width: 6px; /* Ширина ползунка */
                    }

                    /* Стилизация ползунка скроллбара */
                    div::-webkit-scrollbar-thumb {
                      background-color: ${theme.text_second_color}; /* Цвет ползунка */
                      border-radius: 5px; /* Закругление углов ползунка */
                      cursor: pointer;
                    }

                    /* Стилизация фона скроллбара */
                    div::-webkit-scrollbar-track {
                      border-radius: 0 0 50px 0;
                      background-color: rgba($color: #000000, $alpha: 0.3); /* Цвет фона */
                    }
                `}</style>
            <div className={styles.categories}
                style={{
                    // background: theme.element_first_color
                }}
                ref={categoriesRef}>
                {/* Кнопки для категорий */}
                {filteredEmojies.map((category) => {
                const iconWithThemeColor = category.icon.replace(/{theme.text_first_color}/g, theme.text_first_color);
                return (
                    <button
                        key={category.name}
                        className={styles['emoji-category']}
                        onClick={() => handleCategoryClick(category.name, category.isCustom)}

                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = theme.element_second_color;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = currentCategory === category.name ? theme.element_second_color : 'none';
                        }}
                        style={{
                            background: currentCategory === category.name ? theme.element_second_color : 'none',
                            // fontFamily: category.fontFamily,
                            '--font': category.fontFamily,
                            color: theme.text_first_color
                        }}>
                        {category.emojiIcon ? category.icon : category.emojiIconImg ? <img src={category.icon} className={styles['emoji-img']}/>: parse(iconWithThemeColor)}
                    </button>
                );
            })}
            </div>
            <div className={styles['emojies-container']} 
                ref={containerRef}>
                {filteredEmojies.map((category) => (
                    <div 
                        key={category.name} 
                        className={styles['emojies-body']}
                        data-category={category.name}
                        ref={(el) => (categoryRefs.current[category.name] = el)}>
                        <h2 className={styles['category-name']} style={{ color: theme.text_first_color }}>{category.name}</h2>
                        <div className={styles['emojies-content']}>
                            {category.emojis.map((emoji, index) => {
                                return category.isImgEmoji ? (
                                    <img
                                        key={index}
                                        src={emoji}
                                        className={styles['emoji-img-text']}
                                        onClick={() => handleEmojiClick(emoji, category.isImgEmoji, category.fontFamily)}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = theme.element_second_color;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'none';
                                        }}
                                    />
                                ) : (
                                    <span
                                        className={styles.emoji}
                                        key={index}
                                        style={{
                                            fontFamily: category.fontFamily,
                                            color: theme.text_first_color
                                        }}
                                        onClick={() => handleEmojiClick(emoji, category.isImgEmoji, category.fontFamily)}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = theme.element_second_color;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'none';
                                        }}
                                    >
                                        {emoji}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default EmojiPanel;
