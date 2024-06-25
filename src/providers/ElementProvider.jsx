import React, { useState, createContext, useEffect, useContext } from "react";
// import { createContext } from "react";
import themes from "../themes/Themes";

export const ElementContext = createContext();

export function ElementProvider( {children} ){ 
    const storedTheme = localStorage.getItem('theme') || 'default';
    const [theme, setTheme] = useState(storedTheme);

    useEffect(() => {
        localStorage.setItem('theme', theme);
      }, [theme]);

    const setThemeById = (themeId) => {
        if (themes[themeId]) {
          setTheme(themeId);
        }
      };
    const [elementColors, setElementColors] = useState({
        iconColor: '#000000',
        titleColor: '#000000',
        arrowColor: '#000000',
        backgroundColor: '#FFFFFF',
        activeButton: 1,
    });


    return <ElementContext.Provider value={{ theme: themes[theme], setThemeById, elementColors, setElementColors }}>
            {children}
        </ElementContext.Provider>;
}
// export default ElementProvider // изменить позже
export const useTheme = () => useContext(ThemeContext);