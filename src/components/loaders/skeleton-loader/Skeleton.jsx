import React, { useContext } from 'react';
import styles from './Skeleton.module.scss'
import { ElementContext } from '../../../providers/ElementProvider'


function SkeletonLoader({width, height, shape}){
    const { theme, setElementColors } = useContext(ElementContext);

    const circleLoader = () =>{
        return(
            <div className={styles['circle-skeleton']}
                style={{
                    width: width,
                    height: height,
                    '--first-color': theme.loader_first_color,
                    '--second-color': theme.loader_second_color,
                }}>
            </div>
        )
    }
    const rectangleLoader = () =>{
        return(
            <div className={styles['rect-skeleton']}
                style={{
                    width: width,
                    height: height,
                    '--first-color': theme.loader_first_color,
                    '--second-color': theme.loader_second_color,
                    
                }}>
            </div>
        )
    }

    return(
        <>
            {shape === 'rect' ? rectangleLoader() : circleLoader()}
        </>
    )
}
export default SkeletonLoader