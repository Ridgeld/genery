import React, { useContext } from 'react';
import styles from './SearchItem.module.scss';
import { ElementContext } from '../../../providers/ElementProvider';

function SearchItem({ id, name, photo, onClick}){
    const { theme, setElementColors } = useContext(ElementContext);

    const handleClick = () =>{
        onClick(id)
    }
    return(
        <div className={styles['body']}
            style={{
                borderTop: `1px solid ${theme.element_first_color}`,
                // borderWidth: '1px 0px',
                // borderStyle: 'solid',
                // borderColor: theme.text_first_color
            }}
            onClick={handleClick}>
            <div className={styles['photo']}>
                <img src={photo} alt='ава'/>
            </div>
            <div className={styles['info']}>
                <div className={styles['name']}
                    style={{
                        color: theme.text_first_color
                    }}>{name}</div>
            </div>
        </div>
    )
}
export default SearchItem