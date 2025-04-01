import React, { useContext } from 'react';
import styles from './UserItem.module.scss';
import { ElementContext } from '../../../providers/ElementProvider';

function UserItem({ id, name, photo, onClick, canDelete, removeUser, isSelect}){
    const { theme, setElementColors } = useContext(ElementContext);

    const handleClick = (e) =>{
        onClick(id)
        // console.log(9)
    }
    const handleDeleteUser = (e) =>{
        e.stopPropagation();
        removeUser(id, name);
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
            <div className={styles['info-group']}>
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
            {isSelect && 
                <div className={styles['selected']}
                    style={{
                        background: theme.first_color
                    }}>
                    <div className={styles['inside-circle']}
                        style={{
                            background: theme.text_first_color
                        }}/>
                </div>}
            {canDelete && 
                <button className={styles['delete-button']}
                    style={{
                        background: theme.element_first_color
                    }}
                    onClick={handleDeleteUser}>
                    <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.3031 1.1967L6.99984 6.5M1.69654 11.8033L6.99984 6.5M6.99984 6.5L12.3031 11.8033M6.99984 6.5L1.69654 1.1967" stroke={theme.text_first_color} stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>}
        </div>
    )
}
export default UserItem