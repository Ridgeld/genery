import React, { useContext, useEffect, useRef, useState } from 'react';
import styles from './Test.module.scss';
import { ElementContext } from '../../providers/ElementProvider.jsx';
import MessageInput from '../../components/inputs/messageInput/MessageInput.jsx';
import ImageViewer from '../../components/modal-windows/image-viewer/ImageViewer.jsx';
import { motion } from 'framer-motion';
import ReactDOMServer from 'react-dom/server';
import parser from 'html-react-parser';

// const emojiList = ["\uE001", "\uE002", "\uE003", "\uE004", "\uE007", "1", "🗑️"];

// const replaceTextWithEmojis = (text) => {
//     const emojiRegex = /(\uE001|\uE002|\uE003|\uE004|\uE007|1|🗑️)/g;
//     const parts = text.split(emojiRegex);

//     return parts.map((part, index) =>
//         emojiList.includes(part) ? (
//             <span key={index} className={styles.emoji}>{part}</span>
//         ) : (
//             part
//         )
//     );
// };

function Test() {
    const [text, setText] = useState(null)
    const [imagesUrl, setImagesUrl] = useState([])
    const { theme, setElementColors } = useContext(ElementContext);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const inputBodyRef = useRef(null);
    const [viewData, setViewData] = useState({
        isShow: false,
        images: [],
        index: null

    })  
    const contentEditableRef = useRef(null);
    const savedSelection = useRef(null);

    useEffect(() => {
        setElementColors({
        iconColor: theme.icon_color,
        titleColor: theme.text_first_color,
        showArrow: true,
        arrowColor: theme.text_first_color,
        arrowLink: '#/list-menu',
        isHeaderBackground: true,
        headerBackground: theme.background_color,
        isHeader: true,
        isFooter: true,
        footerBackground: theme.background_color,
        activeElementIndex: 3,
        });
        document.body.style.background = theme.background_color;
    }, [theme, setElementColors]);

    const handleSend = (text, images) => {
        setMessages(prevMessages => [...prevMessages, {text: parser(text)}]);
        setMessage('');
    };

    const handleMessageAlert = (text, images) => {
    // Создание временного массива URL-адресов изображений
        const newImagesUrl = images.map((image) => URL.createObjectURL(image));
        
        // Обновляем состояние с новыми URL-адресами изображений
        setImagesUrl(newImagesUrl);
        
        // Добавляем новое сообщение в состояние
        setMessages(prevMessages => [...prevMessages, {text: parser(text), imagesUrl: '' }]);
    };

    const handlePhotoClick = (photos, index) => {
        setViewData({
            isShow: true,
            images: photos,
            index: index
        })
        // setSelectedPhotoIndex(index);
        // setSelectedMessagePhotos(photos);
      };    


    
    const handleInputChange = (e) => {
        let text = e.target.innerText;
    
        // Заменяем символы \uE001 на соответствующие эмодзи с шрифтом EmojiFont1
        const replacedText = text.replace(/:smile:/g, '\u{1F600}') // Unicode для смайла
                             .replace(/:heart:/g, '\u{2764}'); // Unicode для сердца // Замените на ваш эмодзи и шрифт
    
        // Заменяем символы \uE007 на соответствующие эмодзи с шрифтом EmojiFont2
        // text = text.replace(/\\uE007/g, '<span class="emoji2">&#x1F602;</span>'); // Замените на ваш эмодзи и шрифт
    
        setText(replacedText);
      };

        // const emojiList = ["\uE001", "\uE002", "\uE003", "\uE004", "\uE007", "1", "🗑️"];

        // const replaceTextWithEmojis = (text) => {
        //     const emojiRegex = /(\uE001|\uE002|\uE003|\uE004|\uE007|1|🗑️)/g;
        //     const parts = text.split(emojiRegex);

        //     return parts.map((part, index) =>
        //         emojiList.includes(part) ? (
        //             `<span key={${index}} class="${styles['emoji']}">😄</span>`
        //         ) : (
        //             text
        //         )
        //     );
        // };
    // const handleInput = (e) => {
    
    //     // newValue = newValue.replace(/\\uE007/g, `<span class="${styles['emoji']}">😄</span>`);
    
    //     // const updatedText = replaceSpecialCharacters(e.target.innerText);
    //     // alert(e.target.innerHTML[e.target.innerHTML.length - 1])
    //     if (e.target.innerHTML.trim().slice(-1) === '>') {
    //         // Создаем Range для установки курсора
    //         const range = document.createRange();
    //         const sel = window.getSelection();
            
    //         // Устанавливаем Range в конец div
    //         range.selectNodeContents(contentEditableRef.current);
    //         range.collapse(false); // Устанавливаем курсор в конец
    //         sel.removeAllRanges();
    //         sel.addRange(range);
    //     }
        
    //     setText(e.target.innerHTML);
    // };
    const handleInput = (e) => {
        // Обновляем текст в state или переменной
        setText(e.target.innerHTML);
    
        // Создаем Range для установки курсора в конец di
    };

    const replacements = [
        { pattern: /\\uE007/g, replacement: `<span class="${styles['emoji']}">😄</span>` },
        { pattern: /\\uE002/g, replacement: '<span class="emoji">😀</span>' },
            // Добавьте другие замены по необходимости
        ];
        
          // Функция для замены специальных символов на HTML-элементы
    const replaceSpecialCharacters = (html) => {
        alert(html.indexOf('5'))
        // let updatedHtml = html;
        // replacements.forEach(({ pattern, replacement }) => {
        //     updatedHtml = updatedHtml.replace(pattern, replacement);
        // });
        // return updatedHtml;
        return html
    };
    
    // const handleInput = (e) => {
    //     // const updatedText = replaceSpecialCharacters(contentEditableRef.current.innerHTML);
    //     // contentEditableRef.current.insertAdjacentHTML('afterend', text)
    // };
    

    useEffect(() =>{
        const range = document.createRange();
        range.selectNodeContents(contentEditableRef.current);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        range.detach() 
    }, [text])
    
        // useEffect(() => {
    //     if (contentEditableRef.current) {
    //       // Установка innerHTML для обновления содержимого
    //       contentEditableRef.current.innerHTML = text;
    //     }
    //   }, [text]);

      // Восстановление позиции каретки
    //   const handleAddTextClick = () => {
    //     // setText(text + `<span class="${styles['emoji']}">😄</span>`);

    //   };
    
    const handleAddTextClick = () => {
        // const newText = `<span class="${styles['emoji']}">😄</span>`;

        // const newText = `<span class="${styles['emoji']}">😄</span>`
        const newText = `<img class="${styles['emoji-img']}" src='icon.png'/>`


        // contentEditableRef.current.insertAdjacentHTML('beforeend', newText);

        // setText(contentEditableRef.current.innerText); // Обновляем состояние text
        setText(text + newText + '\u200B')
    
    };
    const handleInsertText = () => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const textNode = document.createTextNode('курсор');
            range.insertNode(textNode);
        }
        setText(contentEditableRef.current.innerHTML)
    };

  return (
    <div className={styles.container}>
    <ImageViewer
        isShow={viewData.isShow}
        images={viewData.images}
        index={viewData.index}
        onClose={()=> setViewData({isShow: false})}/>
      
      <div 
        ref={contentEditableRef}
        className={styles['test-content-editable']}
        contentEditable 
        onInput={handleInput} 
        dangerouslySetInnerHTML={{ __html: text }}
        suppressContentEditableWarning={true}
        style={{
          color: 'black',
          caretColor: 'blue',
        }}
        />
        {/* {text}</div> */}

        <button onClick={() => setMessages(prevMessages => [...prevMessages, {text: parser(text), images: ''}])}>Отправить</button>
        <button onClick={handleAddTextClick}>Добавить текст</button>
        <button onClick={handleInsertText}>Вставить "курсор"</button>
        <MessageInput 
                placeholder={78}
                isPanelTop={true}
                onSend={handleSend}/>
      <div className={styles['message-container']}>
      {/* <div className={styles['message-body']}>
                <div className={styles['images-body']}>
                    <div className={styles['images-wrapper']}>
                        <div className={styles[`image_0`]}/>
                        <div className={styles[`image_1`]}/>
                        <div className={styles[`image_2`]}/>
                        <div className={styles[`image_3`]}/>
                    </div>
                </div>
            </div> */}
        {messages.map((message, index) => (
            // console.log(message.imagesUrl.length),
            <div className={styles['message-body']}>
                {message.imagesUrl && 
                    <div className={styles['images-body']}>
                        <div className={styles[`images-wrapper_${message.imagesUrl.length}`]}>
                            {message.imagesUrl.map((image, index)=> (
                                <motion.div className={styles[`image_${index}`]}
                                whileTap={{scale: 1.5}}>
                                    <img src={image}
                                    onClick={() => handlePhotoClick(message.imagesUrl, index)}/> 
                                </motion.div>
                            ))}
                        </div>
                    </div> }
                {/* <img src={URL.createObjectURL(image)} alt="Preview"/> */}
                {/* {message.images && message.images.map((image, index)=> (
                        <div className={styles[`image_${index}`]}/>
                        // <div className={styles[`image_${index}`]}/>
                        //<img src={URL.createObjectURL(image)} className={styles[`image_${index}`]}/> 
                ))} */}
                {/* <div key={index}>{replaceTextWithEmojis(message.text)}</div> */}
                <div key={index}>{message.text}</div>
            </div>
        ))}
      </div>
    </div>
  );
}

export default Test;
