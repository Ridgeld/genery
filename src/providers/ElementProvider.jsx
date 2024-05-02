import React, { useState } from "react";
import { createContext } from "react";

export const ElementContext = createContext();

export function ElementProvider( {children} ){ 
    // const [elementColor, setElementColor] = useState('');
    // const [activeIndex, setActiveIndex] = useState(0); // Инициализируйте активный индекс по умолчанию
    const [elementColors, setElementColors] = useState({
        iconColor: '#000000',
        titleColor: '#000000',
        arrowColor: '#000000',
        backgroundColor: '#FFFFFF',
        activeButton: 1,
    });

    // const values = {
    //     elementColor,
    //     setElementColor,
    //     activeIndex,
    //     setActiveIndex,
    // };

    return <ElementContext.Provider value={{ elementColors, setElementColors }}>{children}</ElementContext.Provider>;
}