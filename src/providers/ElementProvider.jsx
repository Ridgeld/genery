import React, { useState } from "react";
import { createContext } from "react";

export const ElementContext = createContext();

export function ElementProvider( {children} ){ 

    const [elementColors, setElementColors] = useState({
        iconColor: '#000000',
        titleColor: '#000000',
        arrowColor: '#000000',
        backgroundColor: '#FFFFFF',
        activeButton: 1,
    });


    return <ElementContext.Provider value={{ elementColors, setElementColors }}>{children}</ElementContext.Provider>;
}