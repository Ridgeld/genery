import React, { useContext, useEffect, useState } from 'react';
import styles from './ImageViewer.module.scss'
import { ElementContext } from '../../../providers/ElementProvider';
import { AnimatePresence, FlatTree, motion, useMotionValue } from 'framer-motion';

function ImageViewer({isShow, images, index, onClose}){
    const { theme, setElementColors } = useContext(ElementContext);
    // const [imagesArray, setImagesArray] = useState(images);
    const [currentIndex, setCurrentIndex] = useState(index);
    const [imageUrls, setImageUrls] = useState([]);
    const [isDraging, setIsDraging] = useState(false);
    const dragX = useMotionValue(0)
    

    useEffect(() => {
        let updatedImageUrls = [];
        if (!Array.isArray(images)) {
            updatedImageUrls.push(images);
            setImageUrls(updatedImageUrls);
            console.log(updatedImageUrls)
        } else {
            setImageUrls(images);
        }
        // setImageUrls(updatedImageUrls);
    }, [images]);


    // useEffect(() => {
    //     if (images) {
    //       setImageUrls(images);
    //     }
    //   }, [images]);

    useEffect(() => {
        setCurrentIndex(index);
    }, [index]);


    const showNextPhoto = () => {
        setCurrentIndex(index => {
            if(index === imageUrls.length - 1) return 0
            return index + 1
        })
      };
    // useEffect(() =>{
    //     const unsubscribe = dragX.onChange((latest) => {
    //         console.log('dragX changed to', latest);
    //         if(!isDraging && dragX.get() < -10){
    //             setCurrentIndex(index =>{
    //                 if(index === 0) return imageUrls.length - 1
    //                 return index - 1
    //             })
    //         }
    //         if(!isDraging && dragX.get() > 50){
    //             setCurrentIndex(index =>{
    //                 if(index === imageUrls.length - 1) return 0
    //                 return index + 1
    //             })
    //         }
    //       });

    //     return () => unsubscribe();
    // }, [dragX])

    const showPrevPhoto = () => {
        setCurrentIndex(index =>{
            if(index === 0) return imageUrls.length - 1
            return index - 1
        })
    };
    const onDragStart = () => {
        setIsDraging(true);

    }
    const onDragEnd = () => {
        setIsDraging(false);
        if (dragX.get() < -50) {
            setCurrentIndex(index => {
              if (index === 0) return imageUrls.length - 1;
              return index - 1;
            });
          } else if (dragX.get() > 50) {
            setCurrentIndex(index => {
              if (index === imageUrls.length - 1) return 0;
              return index + 1;
            });
          }
      
          // Reset dragX to 0 after the drag ends
          dragX.set(0);
        // console.log(dragX.get())
    }

    const variants = {
        enter : {opacity: 0, x:90, scale: 0.5,  transition: { duration: 0.2 }},
        center: {opacity: 1, x:0, scale: 1,  transition: { duration: 0.2 }},
        exit: {opacity: 0, x: -90, scale: 0.5, transition: { duration: 0.2 }}
    }
    return(
        //  ${styles['animated']} ${isShow ? styles['show'] : ''}
        <div className={`${styles['viewer-area']} ${styles['animated']} ${isShow ? styles['show'] : ''}`}>
            <div className={styles['viewer-actions']}>
                <button className={`${styles['viewer-button']} ${styles['close']}`}
                    onClick={onClose}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 9H9M17 9L9 9M9 9V1M9 9L9 17" stroke={theme.text_first_color} stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
            </div>
            <div className={styles['image-wrapper']}>
                {imageUrls.length > 1 && 
                    <button className={styles['prev-button']}
                        onClick={showPrevPhoto}>
                        <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14.3638 6.36395C14.9161 6.36395 15.3638 6.81167 15.3638 7.36395C15.3638 7.91624 14.9161 8.36395 14.3638 8.36395L14.3638 6.36395ZM0.92874 8.07106C0.538216 7.68053 0.538216 7.04737 0.92874 6.65684L7.2927 0.292884C7.68323 -0.0976401 8.31639 -0.09764 8.70692 0.292884C9.09744 0.683409 9.09744 1.31657 8.70692 1.7071L3.05006 7.36395L8.70691 13.0208C9.09744 13.4113 9.09744 14.0445 8.70691 14.435C8.31639 14.8255 7.68322 14.8255 7.2927 14.435L0.92874 8.07106ZM14.3638 8.36395L1.63585 8.36395L1.63585 6.36395L14.3638 6.36395L14.3638 8.36395Z" fill={theme.text_first_color}/>
                        </svg>
                    </button>
                }
                {/* <AnimatePresence initial={false}> */}
                    <motion.div className={styles['image-view']}
                        variants={variants}
                        style={{ x: dragX }}
                        drag ='x'
                        dragConstraints={{
                            left: 0,
                            right: 0
                        }}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                        key={imageUrls[currentIndex]}
                        initial='enter' 
                        animate='center'
                        exit='exit'
                        transition={{
                            type: 'tween',
                        }}
                        >
                        <div className={styles['image-view-bg']}>
                            <div className={styles['image-no-select']}></div>
                            <img 
                                key={imageUrls[currentIndex]}
                                src={imageUrls && imageUrls[currentIndex]}
                                />
                        </div>
                    </motion.div>
                {/* </AnimatePresence> */}
                {imageUrls.length > 1 && 
                    <button className={styles['next-button']}
                        onClick={showNextPhoto}>
                        <svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 9C0.447715 9 0 8.55228 0 8C0 7.44772 0.447715 7 1 7L1 9ZM14.435 7.29289C14.8256 7.68342 14.8256 8.31658 14.435 8.70711L8.07107 15.0711C7.68054 15.4616 7.04738 15.4616 6.65685 15.0711C6.26633 14.6805 6.26633 14.0474 6.65685 13.6569L12.3137 8L6.65685 2.34315C6.26633 1.95262 6.26633 1.31946 6.65685 0.928932C7.04738 0.538408 7.68054 0.538408 8.07107 0.928932L14.435 7.29289ZM1 7L13.7279 7V9L1 9L1 7Z" fill={theme.text_first_color}/>
                        </svg>
                    </button>
                }
            </div>
        </div>
    )
}
export default ImageViewer