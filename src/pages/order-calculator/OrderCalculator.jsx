import React, { useContext, useEffect, useState } from 'react';
import { ElementContext } from '../../providers/ElementProvider.jsx';
import styles from './OrderCalculator.module.scss';
import '../../themes/default.scss';
import { useNavigate } from 'react-router-dom';

const PREDEFINED_ITEMS = [
    { name: 'Шаурма классика', defaultPrice: 200, color: '#FF5733' },
    { name: '4 сыра', defaultPrice: 275, color: '#ffbb00' },
    { name: 'Запеченная', defaultPrice: 220, color: '#C70039' },
    { name: 'Ассорти', defaultPrice: 250, color: '#900C3F' },
    { name: 'Бургер с курицей', defaultPrice: 180, color: '#f9e7aa' },
    { name: 'Сэндвич', defaultPrice: 150, color: '#fb510e' }
];

function OrderCalculator() {
    const { theme, setElementColors } = useContext(ElementContext);
    const navigateTo = useNavigate();
    const [orderItems, setOrderItems] = useState([]);

    useEffect(() => {
        setElementColors({
            iconColor: theme.icon_color,
            titleColor: theme.text_first_color,
            showArrow: true,
            arrowColor: theme.text_first_color,
            arrowLink: () => navigateTo('/menu'),
            isHeaderBackground: true,
            headerBackground: theme.background_color,
            isHeader: true,
            isFooter: true,
            footerBackground: theme.background_color,
            activeElementIndex: 0,
            background: theme.background_color
        });
        document.body.style.background = theme.background_color;
    }, [theme, setElementColors, navigateTo]);

    const addItem = (item) => {
        setOrderItems([...orderItems, { id: Date.now() + Math.random(), name: item.name, price: item.defaultPrice, color: item.color }]);
    };

    const removeItem = (id) => {
        setOrderItems(orderItems.filter(item => item.id !== id));
    };

    const updatePrice = (id, newPrice) => {
        setOrderItems(orderItems.map(item => item.id === id ? { ...item, price: newPrice } : item));
    };

    const totalPrice = orderItems.reduce((acc, item) => acc + (Number(item.price) || 0), 0);

    const minDrinks = orderItems.length > 0 ? (orderItems.length * 0.5).toFixed(1) : 0;
    const maxDrinks = orderItems.length > 0 ? (orderItems.length * 0.8).toFixed(1) : 0;
    const drinksRecommendation = orderItems.length > 0 ? `${minDrinks} - ${maxDrinks} литра` : '0 литров';

    return (
        <div className={styles.container}>
            <div className={styles.headerTitle} style={{ color: theme.text_first_color }}>
                Добавить в заказ:
            </div>
            <div className={styles.addButtonsBlock}>
                {PREDEFINED_ITEMS.map((item, idx) => (
                    <button 
                        key={idx} 
                        className={styles.addButton} 
                        style={{ background: theme.block_first_color, color: theme.text_first_color, borderColor: theme.block_border_color }}
                        onClick={() => addItem(item)}
                    >
                        {item.name}
                    </button>
                ))}
            </div>

            <div className={styles.receiptContainer}>
                {orderItems.length > 0 ? (
                    orderItems.map((item) => (
                        <div key={item.id} className={styles.lessonBody} style={{ background: theme.element_first_color }}>
                            <div className={styles.lessonCircle} style={{ background: item.color || theme.first_color }}>
                                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5.5 0L11 11H0L5.5 0Z" fill="#fff"/>
                                </svg>
                            </div>
                            <div className={styles.lessonInfo}>
                                <div className={styles.lessonName} style={{ color: theme.text_first_color }}>{item.name}</div>
                            </div>
                            <div className={styles.priceEditContainer}>
                                <input 
                                    type="number" 
                                    className={styles.priceInput} 
                                    style={{ color: theme.text_first_color, borderBottomColor: theme.text_third_color }}
                                    value={item.price} 
                                    onChange={(e) => updatePrice(item.id, e.target.value)}
                                />
                                <span style={{ color: theme.text_first_color }}>с</span>
                            </div>
                            <button className={styles.removeBtn} onClick={() => removeItem(item.id)} style={{ color: theme.text_first_color }}>
                                ✕
                            </button>
                        </div>
                    ))
                ) : (
                    <div className={styles.infoBody} style={{ color: theme.text_first_color }}>
                        Ваш чек пуст
                    </div>
                )}
            </div>

            <div className={styles.totalContainer} style={{ background: theme.element_first_color, color: theme.text_first_color }}>
                <div className={styles.totalText}>Итого:</div>
                <div className={styles.totalValue}>{totalPrice} с</div>
            </div>

            <div className={styles.drinksContainer} style={{ background: theme.block_third_color }}>
                <div className={styles.drinksTitle} style={{ color: theme.text_first_color }}>Рекомендуемый объем сушняка</div>
                <div className={styles.drinksValue} style={{ color: theme.text_first_color }}>{drinksRecommendation}</div>
            </div>
        </div>
    );
}

export default OrderCalculator;
