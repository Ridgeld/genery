import React, { useContext, useState } from 'react';
import styles from './SearchInput.module.scss';
import { ElementContext } from '../../../providers/ElementProvider';

function SearchInput({value, onChange, placeholder}){
    const { theme, setElementColors } = useContext(ElementContext);

    const [searchValue, setSearchValue] = useState('');

    const handleClick = () =>{
        onClick(searchValue)
    }
    // const handleInput = (e) =>{
    //     setSearchValue(e.target.value)
    // }
    return(
        <div className={styles['container']}
            style={{
                background: theme.element_first_color
            }}>
            <div className={styles['icon']}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.8637 11.7356C12.8296 10.5965 13.4157 9.10026 13.4157 7.46154C13.4157 3.89293 10.6363 1 7.20785 1C3.77935 1 1 3.89293 1 7.46154C1 11.0301 3.77935 13.9231 7.20785 13.9231C9.06196 13.9231 10.7262 13.077 11.8637 11.7356ZM11.8637 11.7356L15 15" stroke={theme.text_first_color} stroke-linejoin="round"/>
                </svg>
            </div>
            <input 
                className={styles['input']}
                placeholder={placeholder}
                onChange={onChange}
                style={{
                    '--caret-color': theme.first_color,
                    '--placeholder-color': theme.text_third_color,
                    color: theme.text_first_color
                }}/>
            {/* <button className={styles['button']}
                style={{
                    background: theme.first_color
                }}
                onClick={handleClick}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.8637 11.7356C12.8296 10.5965 13.4157 9.10026 13.4157 7.46154C13.4157 3.89293 10.6363 1 7.20785 1C3.77935 1 1 3.89293 1 7.46154C1 11.0301 3.77935 13.9231 7.20785 13.9231C9.06196 13.9231 10.7262 13.077 11.8637 11.7356ZM11.8637 11.7356L15 15" stroke={theme.text_first_color} stroke-linejoin="round"/>
                </svg>
            </button> */}
        </div>
    )
}
export default SearchInput