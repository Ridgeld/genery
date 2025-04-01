

// export default function parsedText({text}) {


//         const wrapHashtags = (text) => {
//             if (typeof text === 'string') {
//                 // Заменяем хештеги и обрабатываем невидимые символы
//                 return text
//                     .replace(/(#[\wа-яА-Я_]+)/g, (match) => `<div class="${styles.hashtags}">${match}</div>`)
//                     .split(/(<div class=".*?">.*?<\/div>)/g)
//                     .map((part, index) => {
//                         // Возвращаем элемент если это див с хештегом
//                         if (part.startsWith('<div')) {
//                             return parser(part);
//                         }
//                         return part;
//                     });
//             }
//             return text;
//         };
        
//         const processNode = (node) => {
//             if (typeof node === 'string') {
//                 return wrapHashtags(node);
//             }
        
//             if (React.isValidElement(node)) {
//                 const newChildren = React.Children.map(node.props.children, processNode);
//                 return React.cloneElement(node, { children: newChildren });
//             }
        
//             return node;
//         };
//         const processContent = (html) => {
//             const parsed = parser(html);
//             return processNode(parsed);
//         };

//     return (
//         text
//     );

// }
import React from 'react';

import parser from 'html-react-parser';

export default function parsedText(text) {

    // Функция оборачивает найденные хештеги в div с классом из стилей
    const wrapHashtags = (text) => {
        if (typeof text === 'string') {
            return text
                .replace(/(#[\wа-яА-Я_]+)/g, (match) => `<div class="${styles.hashtags}">${match}</div>`)
                .split(/(<div class=".*?">.*?<\/div>)/g)
                .map((part) => {
                    // Если часть начинается с <div, парсим её как HTML и возвращаем как React-элемент
                    if (part.startsWith('<div')) {
                        return parser(part);
                    }
                    return part;
                })
                .join(''); // Возвращаем обработанную строку
        }
        return text;
    };

    // Рекурсивно обрабатываем узлы, чтобы применить wrapHashtags ко всем текстовым узлам
    const processNode = (node) => {
        if (typeof node === 'string') {
            return wrapHashtags(node);
        }

        // Если это React элемент (например, <p> или <div>), обрабатываем его детей
        if (React.isValidElement(node)) {
            const newChildren = React.Children.map(node.props.children, processNode);
            return React.cloneElement(node, { children: newChildren });
        }

        return node;
    };

    // Обрабатываем входной HTML
    const processContent = (html) => {
        const parsed = parser(html);  // Парсим HTML
        return processNode(parsed);   // Рекурсивно обрабатываем узлы
    };

    // Обрабатываем входной текст через processContent
    const processedText = processContent(text);

    return processedText;  // Возвращаем результат после обработки
}

