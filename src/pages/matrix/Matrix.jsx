import React, { useContext, useEffect, useState } from 'react';
import { ElementContext, useTheme } from '../../providers/ElementProvider.jsx';

import styles from './Matrix.module.scss'
export default function Matrix(){
    const {theme, setThemeById, elementColors, setElementColors } = useContext(ElementContext);
    useEffect(() => {
        setElementColors({
            iconColor: theme.icon_color,
            titleColor: theme.text_first_color,
            showArrow: true,
            arrowColor: theme.text_first_color,
            isHeaderBackground: true,
            headerBackground: theme.background_color,
            isHeader: true,
            isFooter: true,
            footerBackground: theme.background_color,
            activeElementIndex: 4,
            background: theme.background_color
        });
        document.body.style.background = theme.background_color
        },[ElementContext]);

    const [matrix, setMatrix] = useState([[1,2], [3,4]]);
    const [transMatrix, setTransMatrix] = useState([]);

    // console.log(matrix)
    const transparationMatrix = (matrix) => {
        const transposedMatrix = matrix[0].map((_, colIndex) => 
            matrix.map(row => row[colIndex])
        );
        return transposedMatrix;
    };
    const A = [
        [1, 2],
        [3, 4]
    ];
    
    const B = [
        [1, 2, 3],
        [4, 5, 6],
    ];

    const multiplyMatrices = (A, B) => {
        const rowsA = A.length; // Количество строк в A
        const colsA = A[0].length; // Количество столбцов в A
        const rowsB = B.length; // Количество строк в B
        const colsB = B[0].length; // Количество столбцов в B
    
        // Проверка на совместимость матриц для умножения
        if (colsA !== rowsB) {
            throw new Error("Количество столбцов в A должно быть равно количеству строк в B");
        }
    
        // Создаем результирующую матрицу C размером rowsA x colsB
        const C = Array.from({ length: rowsA }, () => Array(colsB).fill(0));
    
        // Умножение матриц
        for (let i = 0; i < rowsA; i++) {
            for (let j = 0; j < colsB; j++) {
                for (let k = 0; k < colsA; k++) {
                    C[i][j] += A[i][k] * B[k][j];
                }
            }
        }
    
        return C;
    };
    const transparation = () =>{
        console.log(transparationMatrix(B))
    }
    const multiply = () =>{
        console.log(multiplyMatrices(A, B))
        // multiplyMatrices(A, B)
    }
    

    return(
        <div className={styles['container']}>
            <button className={styles['main-button']}
                style={{
                    background: theme.first_color
                }}
                onClick={transparation}>
                Транспонировать
            </button>
            <button className={styles['main-button']}
                style={{
                    background: theme.first_color
                }}
                onClick={multiply}>
                Умножить
            </button>
        </div>
    )
}