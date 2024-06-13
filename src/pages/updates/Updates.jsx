import React, { useContext, useEffect } from 'react';
import styles from './Updates.module.scss'
import { ElementContext } from '../../providers/ElementProvider.jsx';
import updates from './Updates.js';
import UpdateBody from './UpdateBody.jsx';

function Updates(){
    const { elementColors, setElementColors } = useContext(ElementContext);

    useEffect(() => {
        setElementColors({
            iconColor: 'var(--first-color)',
            titleColor: 'var(--text-first-color)',
            showArrow: true,
            arrowLink: '#/menu',
            arrowColor: 'var(--text-first-color)',
            isHeaderBackground: true,
            headerBackground: 'var(--background-color)',
            isHeader: true,
            isFooter: true,
            footerBackground: 'var(--background-color)',
            activeElementIndex: 3,
        });
        },[ElementContext]);
    return(
        <div className={styles.container}>
            {updates.map((update) => (
                <UpdateBody
                    data={update.data}
                    update={update.update}
                    corrections={update.corrections}/>
                // <div>
                //     <div>{update.data}</div>
                //     {update.update && <div>{update.update}</div>}
                //     {update.corrections && <div>{update.corrections}</div>}
                // </div>
                
            ))}
        </div>
    )
}
export default Updates