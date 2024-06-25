import React, { useContext, useEffect, useRef, useState } from 'react';
import styles from './MessageInput.module.scss'
import { ElementContext } from '../../../providers/ElementProvider';
import EmojiPanel from './emojiPanel/EmojiPanel';
import emojis from './emojiPanel/Emojies';
import parser from 'html-react-parser'
import SlipNotification from '../../notifictions/SlipNotification/SlipNotification';

function MessageInput({isPanelTop, placeholder, onSend}){
    const { theme, setElementColors } = useContext(ElementContext);
    const inputBodyRef = useRef(null);
    const textareaRef = useRef(null);
    const [text, setText] = useState('');
    const [isShow, setIsShow] = useState(false);
    const [images, setImages] = useState([])
    const inputFilesRef = useRef()
    const contentEditableRef = useRef(null)
    const [marginTop, setMarginTop] = useState('50px');

    const [slipProp, setSlipProp] = useState({
        isShow: false,
        text: ''
    });

    useEffect(() => {
        if (slipProp.isShow) {
          const timer = setTimeout(() => {
            setSlipProp({
                isShow: false
            });
          }, 1000);
    
          return () => clearTimeout(timer);
        }
      }, [slipProp]);

    const replacements = [
        { pattern: /\\uE007/g, replacement: '<span class="emoji">😄</span>' },
        { pattern: /\\uE002/g, replacement: '<span class="emoji">😀</span>' },
        // Добавьте другие замены по необходимости
      ];
    
      // Функция для замены специальных символов на HTML-элементы
      const replaceSpecialCharacters = (html) => {
        let updatedHtml = html;
        replacements.forEach(({ pattern, replacement }) => {
          updatedHtml = updatedHtml.replace(pattern, replacement);
        });
        return updatedHtml;
      };

    // const handleMessageChange = (event) => {
    //     const updatedText = replaceSpecialCharacters(event.target.innerText);
    //     setText(updatedText)

    //     contentEditableRef.current.style.lineHeight = '30px';
    //     event.target.style.height = '25px'; // Сброс высоты
    //     event.target.style.height = `${event.target.scrollHeight}px`;
    //     if (inputBodyRef.current) {
    //         inputBodyRef.current.style.height = `${event.target.scrollHeight}px`;
    //         if(inputBodyRef.current.style.height >= '35px'){
    //             contentEditableRef.current.style.lineHeight = '25px';
    //             inputBodyRef.current.style.borderRadius = '20px';
    //         }
    //     }
    // };

    // const handleMessageChange = (event) => {

    //     const updatedText = replaceSpecialCharacters(event.target.innerText);
    //     setText(updatedText);
    
    //     const newHeight = `${event.target.scrollHeight}px`;
    //     event.target.style.height = newHeight;
        
    
    //     // Обновляем текст с заменой


    // };
    // useEffect(() => {
    //     if(text === ''){
    //         inputBodyRef.current.style.height = 'auto';
    //         contentEditableRef.current.style.height = '10px'
    //         setMarginTop('50px');
    //     }

    //     if(contentEditableRef.current.style.height > '40px' && isPanelTop){

    //         const currentMarginTop = parseInt(marginTop.replace('px', ''), 10);
    //         const contentHeight = parseInt(contentEditableRef.current.style.height.replace('px', ''), 10);

    //         if(contentEditableRef.current.style.height > '90px' ) {
    //             setMarginTop(`${200}px`);
    //         }

    //         setMarginTop(`${contentHeight + 20}px`);
    //         // alert(contentHeight);
    //     }
    // }, [text])
    useEffect(() => {
        if (text === '') {
          inputBodyRef.current.style.height = 'auto';
          contentEditableRef.current.style.height = '10px';
          setMarginTop('50px');
          return; // выходим из useEffect если текст пустой
        }
    
        const contentHeight = parseInt(contentEditableRef.current.style.height.replace('px', ''), 10);
    
        if (contentHeight > 40 && isPanelTop) {
          if (contentHeight > 90) {
            setMarginTop('120px');
          } else {
            setMarginTop(`${contentHeight + 20}px`);
          }
        }
      }, [text]);

    const sendText = () =>{
        if (text === '' && images.length === 0) return
        onSend(text, images);
        setText('');
        setImages([])
        setIsShow(false);
        contentEditableRef.current.style.lineHeight = '30px';
        contentEditableRef.current.style.height = '10px'
        inputBodyRef.current.style.height = 'auto';
        // contentEditableRef.current.innerText = ''; // Очистка содержимого
    }

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendText(text);
            // setText('');
        }
    };

    const addEmoji = (emoji, isImg,  font) =>{
        let imgEmoji;

        if(isImg){
            imgEmoji = `<img class="${styles['emoji-img']}" src="${emoji}" style="width: 22px; height: 22px"/>`
            setText(text + imgEmoji +'\u200B' );
            return
        }

        // setText(text + emoji);
        const newText = `<span class="${styles['emoji']}" style="font-family: ${font}">${emoji}</span>`
        setText(text + newText + '\u200B');

        // const selection = window.getSelection();
        // if (selection.rangeCount > 0) {
        //     const range = selection.getRangeAt(0);
        //     const textNode = document.createTextNode(`<span class="${styles['emoji']}" style="font-family: ${font}">${emoji}</span>\u200B`);
        //     range.insertNode(textNode);
        // }
        // setText(contentEditableRef.current.innerHTML)
    }

    const handleAddTextClick = () => {
        // const newText = `<span class="${styles['emoji']}">😄</span>`;

        const newText = `<span class="${styles['emoji']}">😄</span>`
        // contentEditableRef.current.insertAdjacentHTML('beforeend', newText);

        // setText(contentEditableRef.current.innerText); // Обновляем состояние text
        setText(text + newText + '\u200B')
    
    };


    
    const handleInput = (e) => {
        let newValue = e.target.innerHTML;

        // Заменяем текст \uE007 на эмодзи
        // newValue = newValue.replace(/\\uE007/g, `<span class="${styles['emoji']}">😄</span>`);

        // setText(newValue);
        // const updatedText = replaceSpecialCharacters(newValue);
        setText(newValue);
    };

    const handleAddImage = (e) => {

        const images = e.target.files;
        const maxFiles = 5;
      
        // Проверяем количество выбранных файлов
        if (images.length > maxFiles) {
        //   alert(`Выбрано больше ${maxFiles} файлов. Выберите не более ${maxFiles} файлов.`);
        setSlipProp({
            isShow: true,
            text: 'Максимально возможное число фотографий - 5'
        })
          return;
        }
        for (let i = 0; i < images.length; i++) {
            const file = images[i];
            if (!file.type.startsWith('image/')) {
              setSlipProp({
                isShow: true,
                text: `Файл ${file.name} не является изображением. Выберите только изображения.`
                })
              return;
            }
          }
        if(images.length > 5) return
        const files = Array.from(e.target.files);
        // console.log('Selected files:', files);
    
        // Выводим имена файлов в консоль
        files.forEach((file) => {
          console.log(file);
          setImages(prevImages => [...prevImages, file])

        });
        inputFilesRef.current.value = ''
        // setImages(prevImages => [...prevImages, ...files]);
    };

    const handleRemoveImage = (indexToRemove) => {

        setImages(prevImages => prevImages.filter((_, index) => index !== indexToRemove));
      };


    useEffect(() =>{
        const range = document.createRange();
        range.selectNodeContents(contentEditableRef.current);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }, [text])
    
    useEffect(() => {
        const handleWheel = (e) => {
          if (contentEditableRef.current) {
            contentEditableRef.current.scrollTop += e.deltaY;
          }
        };
    
        const textarea = contentEditableRef.current;
        if (textarea) {
          textarea.addEventListener('wheel', handleWheel);
        }
    
        return () => {
          if (textarea) {
            textarea.removeEventListener('wheel', handleWheel);
          }
        };
      }, []);
    return(
        <>
            <section className={styles['input-container']}>
            <SlipNotification
                isShow={slipProp.isShow}
                text={slipProp.text}/>
                <EmojiPanel
                    isShow={isShow}
                    isTop ={isPanelTop}
                    marginTop = {marginTop}
                    isImages={images.length > 0 && true}
                    onEmojiSelect={addEmoji}/>
                    <button className={styles['button-circle']}
                        style={{
                            background: theme.element_first_color
                        }}
                        onClick={() => document.getElementById('file-input').click()}>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 9H9M17 9L9 9M9 9V1M9 9L9 17" stroke={theme.text_first_color} stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        <input
                            type="file"
                            id="file-input"
                            multiple
                            ref={inputFilesRef}
                            style={{ display: 'none' }}
                            onChange={handleAddImage}
                        />
                    </button>
                    <div className={styles['input-message-body']}
                        style={{
                            background: theme.element_first_color
                        }}>
                            {images.length> 0 &&  (   
                                <div className={styles['image-previewer']}>
                                    {images.map((image, index) => (
                                        <div className={styles['image-wrapper']}
                                            key={index}>
                                            <button className={styles['remove-image']}
                                                onClick={() => handleRemoveImage(index)}>
                                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M1 9H9M17 9L9 9M9 9V1M9 9L9 17" stroke={theme.text_first_color} stroke-width="2" stroke-linecap="round"/>
                                                </svg>
                                            </button>
                                            <div className={styles['image-no-select']}></div>
                                            {image && <img src={URL.createObjectURL(image)} alt="Preview"/>}
                                        </div>
                                    ))}
                                </div>
                                )}
                        <div className={styles['input-message-wrapper']}
                            ref={inputBodyRef}
                            style={{
                                alignItems: isPanelTop ? 'flex-end' :'flex-start',
                            }}>
                            <button className={styles['emoji-button']}
                                onClick={() => setIsShow(!isShow)}>
                                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M11 21C16.5228 21 21 16.5228 21 11C21 5.47715 16.5228 1 11 1C5.47715 1 1 5.47715 1 11C1 16.5228 5.47715 21 11 21Z" stroke={theme.text_first_color} stroke-width="2"/>
                                    <path d="M8.25049 15.5C9.13085 16.1525 10.2028 16.5357 11.3576 16.5357C12.5125 16.5357 13.5844 16.1525 14.4648 15.5" stroke={theme.text_first_color} stroke-width="2" stroke-linecap="round"/>
                                    <path d="M15.5006 9.80356C15.5006 10.6611 15.0366 11.3571 14.4649 11.3571C13.8932 11.3571 13.4292 10.6611 13.4292 9.80356C13.4292 8.94599 13.8932 8.24999 14.4649 8.24999C15.0366 8.24999 15.5006 8.94599 15.5006 9.80356Z" fill={theme.text_first_color}/>
                                    <path d="M8.25007 11.3571C8.82208 11.3571 9.28578 10.6616 9.28578 9.80356C9.28578 8.94555 8.82208 8.24999 8.25007 8.24999C7.67806 8.24999 7.21436 8.94555 7.21436 9.80356C7.21436 10.6616 7.67806 11.3571 8.25007 11.3571Z" fill={theme.text_first_color}/>
                                </svg>
                            </button>
                            {/* <textarea className={styles['message-input']}
                                value={text}
                                onChange={handleMessageChange}
                                onKeyPress={handleKeyPress}
                                placeholder={placeholder}
                                style={{
                                    color: theme.text_first_color,
                                    caretColor: theme.first_color,
                                }}
                                ref={textareaRef}/> */}
                                <div
                                    ref={contentEditableRef}
                                    className={styles['message-input']}
                                    contentEditable
                                    onInput={handleInput}
                                    onKeyPress={handleKeyPress}
                                    // suppressContentEditableWarning={true}
                                    data-placeholder={placeholder}
                                    dangerouslySetInnerHTML={{ __html: text}}
                                    suppressContentEditableWarning={true}
                                    style={{
                                        color: theme.text_first_color,
                                        caretColor: theme.first_color,
                                        '--placeholder-color': theme.text_third_color,
                                    }}
                                />
                                    {/* {parser(text)}</div> */}
                            <button className={styles['send-button']}
                                style={{
                                    background: theme.first_color
                                }}
                                onClick={sendText}>
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2.20711 11.2071C1.81658 11.5976 1.18342 11.5976 0.792893 11.2071C0.402369 10.8166 0.402369 10.1834 0.792893 9.79289L2.20711 11.2071ZM10.5 0.5C11.0523 0.5 11.5 0.947715 11.5 1.5L11.5 10.5C11.5 11.0523 11.0523 11.5 10.5 11.5C9.94772 11.5 9.5 11.0523 9.5 10.5L9.5 2.5L1.5 2.5C0.947715 2.5 0.5 2.05228 0.5 1.5C0.5 0.947715 0.947715 0.5 1.5 0.5L10.5 0.5ZM0.792893 9.79289L9.79289 0.792893L11.2071 2.20711L2.20711 11.2071L0.792893 9.79289Z" fill={theme.text_first_color}/>
                                </svg>
                            </button>
                        </div>
                    </div>
            </section>
        </>
    )
}
export default MessageInput