import React, { useContext, useEffect, useRef, useState } from 'react';
import styles from './Quiz.module.scss'
import { ElementContext, useTheme } from '../../providers/ElementProvider.jsx';
import ProgressBar from '../../components/progress-bars/Test-progress-bar/ProgressBar.jsx';
import ScoreContainer from '../../components/score-container/ScoreContainer.jsx';
import VariantBody from './VariantBody.jsx';

import englishTest from './quizes/english.js';
import mathTest from './quizes/math.js';
import russianTest from './quizes/russian.js';
import kyrgyzTest from './quizes/kyrgyz.js';

import AlertNotification from '../../components/notifictions/AlertNotification/AlertNotification.jsx';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../providers/Authprovired.jsx';
import ImageViewer from '../../components/modal-windows/image-viewer/ImageViewer.jsx';

function QuizGame({ mode }){
    const [ip, setIp] = useState('');
    const [number, setNumber] = useState()
    const { authUser } = useAuth();
    const canvasRef = useRef(null);
    const {theme, setThemeById, elementColors, setElementColors } = useContext(ElementContext);
    const navigateTo = useNavigate()
    const quizMapping = {
        english: { questions: englishTest, timePerQuestion: 5 },
        math: { questions: mathTest, timePerQuestion: 20 },
        russian: { questions: russianTest, timePerQuestion: 15 },
        kyrgyz: { questions: kyrgyzTest, timePerQuestion: 20 },
    };
    const selectedTest = quizMapping[mode];


    useEffect(() => {
        setElementColors({
            iconColor: theme.icon_color,
            titleColor: theme.text_first_color,
            showArrow: true,
            arrowLink: () => navigateTo('/quiz'),
            arrowColor: theme.text_first_color,
            isHeaderBackground: true,
            headerBackground: theme.background_color,
            isHeader: true,
            isFooter: false,
            footerBackground: theme.background_color,
            activeElementIndex: 0,
            background: theme.background_color
        });
        document.body.style.background = theme.background_color
        },[ElementContext]);

    const getRandomQuestions = (questions, num) => {
        const shuffled = [...questions].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, num);
    };

    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answerStates, setAnswerStates] = useState(new Array(4).fill('base'));
    const [score, setScore] = useState(0);
    const [timer, setTimer] = useState(0); // Время на вопрос
    const [questionAnswered, setQuestionAnswered] = useState(false);
    const [isQuizFinished, setIsQuizFinished] = useState(false);
    const [alertProp, setAlertProp] = useState({
        isShow: false,
        title: 'Заголовок',
        text: 'текст',
        firstButtonName: 'выйти',
        secondButtonName: 'играть',

    });
    const [viewData, setViewData] = useState({
        isShow: false,
        images: [],
        index: null

    }) 
    useEffect(() => {
        fetch('https://api.ipify.org?format=json')
            .then(response => response.json())
            .then(data => {
                setIp(data.ip);
            })
            .catch(error => {
                console.error('Error fetching IP address:', error);
            });
    }, []);
    useEffect(() => {
        fetch('https://ipinfo.io/json?token=daabefc348f9fc')
            .then(response => response.json())
            .then(data => {
                console.log('IP Address:', data.ip);
                console.log('City:', data.city);
                console.log('Region:', data.region);
                console.log('Country:', data.country);
                console.log('Location:', data.loc); // широта и долгота
                console.log('Street:', data.org); // организация, предоставляющая IP (может быть полезно для определения улицы)
                // Установка значений в state
                setIp({
                    ip: data.ip,
                    city: data.city,
                    region: data.region,
                    location: data.loc
                });
                // setCity(data.city);
                // setRegion(data.region);
                // setLocation(data.loc);
            })
            .catch(error => {
                console.error('Error fetching IP address and location:', error);
            });
    }, []);
    const getMonthNameInGenitive = (monthIndex) => {
        const monthsInGenitive = [
            'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
            'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
        ];
        return monthsInGenitive[monthIndex];
    };
    // const showImageWithDateAndName = (callback) => {
    //     const canvas = canvasRef.current;
    //     const ctx = canvas.getContext('2d');
    //     const baseImage = new Image();
    //     const overlayImage = new Image();
    
    //     // Устанавливаем источник изображений
    //     baseImage.src = 'SMO.jpg'; // Путь к вашему основному изображению
    //     overlayImage.src = 'print.png'; // Путь к изображению, которое будет накладываться
    
    //     baseImage.onload = () => {
    //         ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
    
    //         // Отрисовка имени пользователя
    //         ctx.font = '20px Times New Roman';
    //         ctx.fillStyle = '#000';
    //         ctx.fillText(authUser.name, 145, 48);
    
    //         // Отрисовка IP-адреса и случайного числа
    //         ctx.fillText(`Ваш ip адрес: ${ip}`, 170, 68);
    //         ctx.fillText(Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000, 680, 95);
    
    //         // Получение завтрашней даты
    //         const tomorrow = new Date();
    //         tomorrow.setDate(tomorrow.getDate() + 1);
            
    //         // Извлечение дня и названия месяца
    //         const day = tomorrow.getDate();
    //         const monthIndex = tomorrow.getMonth();
    //         const month = getMonthNameInGenitive(monthIndex); // Функция для получения названия месяца в родительном падеже
    
    //         // Отрисовка дня и месяца
    //         ctx.fillText(day, 420, 138);
    //         ctx.fillText(month, 470, 138);
    
    //         // Загрузка и отрисовка накладываемого изображения
    //         // overlayImage.onload = () => {
    //         //     // Настройте координаты и размер второго изображения по необходимости
    //         //     ctx.drawImage(overlayImage, 450, 140, 200, 200);
    
    //         //     // Создание data URL и открытие его в новой вкладке
    //         //     canvas.toBlob((blob) => {
    //         //         const url = URL.createObjectURL(blob);
    //         //         window.open(url, '_blank');
    //         //         // Освобождаем URL-объект после использования
    //         //         URL.revokeObjectURL(url);
    //         //     }, 'image/png');
    //         // };
    //         overlayImage.onload = () => {
    //             ctx.drawImage(overlayImage, 50, 50, 200, 200);
    
    //             canvas.toBlob((blob) => {
    //                 const url = URL.createObjectURL(blob);
    //                 callback(url);  // Передаём URL в коллбек
    //                 URL.revokeObjectURL(url);
    //             }, 'image/png');
    //         };
    //     };
    // };
    const loadImage = (src) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = src;
            img.onload = () => resolve(img);
            img.onerror = (err) => reject(err);
        });
    };
    
    const showImageWithDateAndName = async (callback) => {
        try {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
    
            // Загрузка изображений
            const baseImage = await loadImage('SMO.jpg');
            const overlayImage = await loadImage('print.png');
    
            // Отрисовка основного изображения
            ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
    
            // Отрисовка имени пользователя
            ctx.font = '20px Times New Roman';
            ctx.fillStyle = '#000';
            ctx.fillText(authUser.name, 145, 48);
            // ctx.fillText('Владимиру Владимировичу', 145, 48);
    
            // setNumber(Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000)
            const randomNumber = Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000;
            // Отрисовка IP-адреса и случайного числа
            // ctx.fillText(`Ваш ip адрес: ${ip.ip}`, 170, 68);
            ctx.font = '16px Times New Roman';
            ctx.fillText(`по адресу:  город ${ip.city}, ${ip.location}, IP адрес: ${ip.ip} `, 170, 68);
            // ctx.fillText(`по адресу:  город Геленджик, село Прасковеевка`, 170, 68);
            ctx.font = '20px Times New Roman';
            ctx.fillText(randomNumber, 680, 95);
    
            // Получение завтрашней даты
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
    
            // Извлечение дня и названия месяца
            const day = tomorrow.getDate();
            const monthIndex = tomorrow.getMonth();
            const month = getMonthNameInGenitive(monthIndex);
    
            // Отрисовка дня и месяца
            ctx.fillText(day, 420, 138);
            ctx.fillText(month, 470, 138);
    
            // Отрисовка накладываемого изображения
            ctx.drawImage(overlayImage, 450, 140, 200, 200);
    
            // Создание data URL и передача его в коллбек
            const dataURL = canvas.toDataURL('image/png');
            callback(dataURL, randomNumber);  // Передаём data URL в коллбек
        } catch (error) {
            console.error('Ошибка загрузки изображения:', error);
        }
    };
    const downloadImage = (dataURL) => {
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'image.png';  // Имя файла
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    
    

    useEffect(() => {
        if (!selectedTest) {
            return;
        }
        const questions = getRandomQuestions(selectedTest.questions, 10);
        setSelectedQuestions(questions);
        setTimer(selectedTest.timePerQuestion);
    }, [mode]);

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    useEffect(() => {
        let interval;
        if (timer > 0 && !questionAnswered && !isQuizFinished) {
            interval = setInterval(() => {
                setTimer(prevTimer => prevTimer - 1);
            }, 1000);
        } else if (timer === 0 && !isQuizFinished) {
            handleTimeout();
        }
        return () => clearInterval(interval);
    }, [timer, questionAnswered, isQuizFinished]);

    useEffect(() => {
        if (selectedQuestions[currentQuestionIndex]) {
            setAnswerStates(new Array(selectedQuestions[currentQuestionIndex].answers.length).fill('base'));
            setTimer(selectedTest.timePerQuestion);
            setQuestionAnswered(false);
        }
    }, [currentQuestionIndex, selectedQuestions]);

    // Выбираем случайный вопрос при загрузке компонента
    // const handleItemClick = (index) => {
    //     if (!questionAnswered && !isQuizFinished) {
    //         const isCorrect = index === selectedQuestions[currentQuestionIndex]?.correctAnswerIndex;
    //         const newAnswerStates = answerStates.map((state, i) => (i === index ? (isCorrect ? 'correct' : 'incorrect') : state));
    //         setAnswerStates(newAnswerStates);
    //         if (isCorrect) setScore(score + 5);
    //         setQuestionAnswered(true);
    //         setTimeout(() => nextQuestion(), 1000);
    //     }
    // };
    const handleItemClick = (index) => {
        if (!questionAnswered && !isQuizFinished) {
            const correctIndex = selectedQuestions[currentQuestionIndex]?.correctAnswerIndex;
            const isCorrect = index === correctIndex;
            const newAnswerStates = answerStates.map((state, i) => (
                i === index ? (isCorrect ? 'correct' : 'incorrect') : state
            ));
            if (!isCorrect) {
                newAnswerStates[correctIndex] = 'correct'; // Показываем правильный ответ
            }
            setAnswerStates(newAnswerStates);
            if (isCorrect) setScore(score + 5);
            setQuestionAnswered(true);
            setTimeout(() => nextQuestion(), 2000);
        }
    };
    
    const handleTimeout = () => {
        if (!questionAnswered && !isQuizFinished) {
            const correctIndex = selectedQuestions[currentQuestionIndex]?.correctAnswerIndex;
            if (correctIndex !== undefined) {
                const newAnswerStates = answerStates.map((state, i) => (i === correctIndex ? 'correct' : 'base'));
                setAnswerStates(newAnswerStates);
                setQuestionAnswered(true);
                setTimeout(() => nextQuestion(), 2000);
            }
        }
    };
    const quitGame = () =>{
        navigateTo('/quiz');
    }
    const [ imageViewerClosed ,setImageViewerClosed] = useState(false)
    useEffect(() => {
        if (!viewData.isShow && imageViewerClosed) {
            setAlertProp({
                ...alertProp,
                isShow: true
            });
            setImageViewerClosed(false); // Сбрасываем состояние после показа уведомления
        }
    }, [viewData.isShow]);
    const nextQuestion = async () => {
        if (currentQuestionIndex < selectedQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            // Конец викторины
            setIsQuizFinished(true);
            if(mode === 'kyrgyz'){
                if (score > 40) {
                    // showImageWithDateAndName();
                    // setAlertProp({
                    //     isShow: true,
                    //     title: 'Вы выиграли!',
                    //     text: `Викторина завершена! Ваш счёт: ${score}. Вы также были приняты в Улуттук гвардия на бюджетную форму обучения!`,
                    //     firstButtonName: 'Выйти',
                    //     secondButtonName: 'Играть снова',
                    //     firstButtonOnClick: quitGame,
                    //     secondButtonOnClick: resetQuiz,
                    // });
                    showImageWithDateAndName((imageDataURL) => {
                        setViewData({
                            isShow: true,
                            images: [imageDataURL],  // Передаём data URL изображения в ImageViewer
                            index: 0,
                        });
                        setImageViewerClosed(true)

                        setAlertProp({
                            // isShow: true,
                            title: 'Вы выиграли!',
                            text: `Викторина завершена! Ваш счёт: ${score}. Вы также были приняты в Улуттук гвардия на бюджетную форму обучения!`,
                            firstButtonName: 'Выйти',
                            secondButtonName: 'Играть снова',
                            firstButtonOnClick: quitGame,
                            secondButtonOnClick: resetQuiz,
                        });
                    });
                    
                } else if (score < 20) {
                    // showImageWithDateAndName();
                    // setAlertProp({
                    //     isShow: true,
                    //     title: 'Вы проиграли!',
                    //     text: `Викторина завершена! Ваш счёт: ${score}. Вы также были приняты в Улуттук гвардия, поздравляем!`,
                    //     firstButtonName: 'Выйти',
                    //     secondButtonName: 'Играть снова',
                    //     firstButtonOnClick: quitGame,
                    //     secondButtonOnClick: resetQuiz,
                    // });
                    showImageWithDateAndName((imageDataURL) => {
                        setViewData({
                            isShow: true,
                            images: [imageDataURL],  // Передаём data URL изображения в ImageViewer
                            index: 0,
                        });
                        setImageViewerClosed(true)
                    
                        setAlertProp({
                            // isShow: true,
                            title: 'Вы выиграли!',
                            text: `Викторина завершена! Ваш счёт: ${score}. Вы также были приняты в Улуттук гвардия на бюджетную форму обучения!`,
                            firstButtonName: 'Выйти',
                            secondButtonName: 'Играть снова',
                            firstButtonOnClick: quitGame,
                            secondButtonOnClick: resetQuiz,
                        });
                    });
                    
                }
            } else if (mode === 'russian'){
                if (score > 40) {
                    showImageWithDateAndName((imageDataURL) => {
                        setViewData({
                            isShow: true,
                            images: [imageDataURL],  // Передаём data URL изображения в ImageViewer
                            index: 0,
                        });
                        setImageViewerClosed(true)

                        setAlertProp({
                            // isShow: true,
                            title: 'Вы выиграли!',
                            text: `Викторина завершена! Ваш счёт: ${score}. Вы также были приняты в ряды российской армии на бюджет, поздравляем!`,
                            firstButtonName: 'Выйти',
                            secondButtonName: 'Играть снова',
                            firstButtonOnClick: quitGame,
                            secondButtonOnClick: resetQuiz,
                        });
                    });
                } else if (score < 20) {
                    showImageWithDateAndName((imageDataURL) => {
                        setViewData({
                            isShow: true,
                            images: [imageDataURL],  // Передаём data URL изображения в ImageViewer
                            index: 0,
                        });
                        setImageViewerClosed(true)

                        setAlertProp({
                            // isShow: true,
                            title: 'Вы проиграли!',
                            text: `Викторина завершена! Ваш счёт: ${score}. Вы также были приняты в ряды российской армии, поздравляем!`,
                            firstButtonName: 'Выйти',
                            secondButtonName: 'Играть снова',
                            firstButtonOnClick: quitGame,
                            secondButtonOnClick: resetQuiz,
                        });
                    });
                }
            } else if (mode === 'math'){
                if (score > 40) {
                    showImageWithDateAndName((imageDataURL) => {
                        setViewData({
                            isShow: true,
                            images: [imageDataURL],  // Передаём data URL изображения в ImageViewer
                            index: 0,
                        });
                        setImageViewerClosed(true)

                        setAlertProp({
                            // isShow: true,
                            title: 'Вы выиграли!',
                            text: `Викторина завершена! Ваш счёт: ${score}. Вы также были приняты в ряды военных инженеров СВО на бюджет, поздравляем!`,
                            firstButtonName: 'Выйти',
                            secondButtonName: 'Играть снова',
                            firstButtonOnClick: quitGame,
                            secondButtonOnClick: resetQuiz,
                        });
                    });
                } else if (score < 20) {
                    showImageWithDateAndName((imageDataURL) => {
                        setViewData({
                            isShow: true,
                            images: [imageDataURL],  // Передаём data URL изображения в ImageViewer
                            index: 0,
                        });
                        setImageViewerClosed(true)

                        setAlertProp({
                            // isShow: true,
                            title: 'Вы проиграли!',
                            text: `Викторина завершена! Ваш счёт: ${score}. Вы также были приняты в ряды военных инженеров СВО, поздравляем!`,
                            firstButtonName: 'Выйти',
                            secondButtonName: 'Играть снова',
                            firstButtonOnClick: quitGame,
                            secondButtonOnClick: resetQuiz,
                        });
                    });
                }
            } else if (mode === 'english'){
                if (score > 40) {
                    showImageWithDateAndName((imageDataURL) => {
                        setViewData({
                            isShow: true,
                            images: [imageDataURL],  // Передаём data URL изображения в ImageViewer
                            index: 0,
                        });
                        setImageViewerClosed(true)

                        setAlertProp({
                            // isShow: true,
                            title: 'Вы выиграли!',
                            text: `Викторина завершена! Ваш счёт: ${score}. Вы также были приняты в ряды российской разведки на бюджет, поздравляем!`,
                            firstButtonName: 'Выйти',
                            secondButtonName: 'Играть снова',
                            firstButtonOnClick: quitGame,
                            secondButtonOnClick: resetQuiz,
                        });
                    });
                } else if (score < 20) {
                    showImageWithDateAndName((imageDataURL) => {
                        setViewData({
                            isShow: true,
                            images: [imageDataURL],  // Передаём data URL изображения в ImageViewer
                            index: 0,
                        });
                        setImageViewerClosed(true)

                        setAlertProp({
                            // isShow: true,
                            title: 'Вы проиграли!',
                            text: `Викторина завершена! Ваш счёт: ${score}. Вы также были приняты в ряды российской разведки, поздравляем!`,
                            firstButtonName: 'Выйти',
                            secondButtonName: 'Играть снова',
                            firstButtonOnClick: quitGame,
                            secondButtonOnClick: resetQuiz,
                        });
                    });
                }
            }
            // resetQuiz();
        }
    };
    const resetQuiz = () => {
        setIsQuizFinished(false);
        setSelectedQuestions(getRandomQuestions(selectedTest.questions, 10));
        setCurrentQuestionIndex(0);
        setAnswerStates(new Array(4).fill('base'));
        setScore(0);
        setTimer(selectedTest.timePerQuestion);
        setQuestionAnswered(false);
        setAlertProp({
            isShow: false,
        });
    };
    
      const progress = ((currentQuestionIndex + 1) / selectedQuestions.length) * 100;
    
      if (!selectedQuestions[currentQuestionIndex]) return null;


    return(
        <div className={styles['container']}>
            <canvas ref={canvasRef} width="816" height="367" style={{ display: 'none' }}/>
            <ImageViewer
                isShow={viewData.isShow}
                images={viewData.images}
                index={viewData.index}
                onClose={()=> setViewData({isShow: false})}/>
            <AlertNotification
                title={alertProp.title}
                text={alertProp.text}
                isShow={alertProp.isShow}
                firstButtonName={alertProp.firstButtonName}
                secondButtonName={alertProp.secondButtonName}
                firstButtonOnClick={alertProp.firstButtonOnClick}
                secondButtonOnClick={alertProp.secondButtonOnClick}/>
            <ScoreContainer 
                name={'Время'}
                isBalance={false}
                count={formatTime(timer)}/>
            <h3 className={styles['question-index']}
                style={{
                    color: theme.text_first_color
                }}>Вопрос: {currentQuestionIndex + 1} / {selectedQuestions.length}</h3>
            <ProgressBar 
                color={theme.first_color}
                progress={`${progress}%`}/>
            <div className={styles['question-body']}
                style={{
                    color: theme.text_first_color
                }}>
                {selectedQuestions[currentQuestionIndex].question}
            </div>
            <div className={styles['variants-container']}>
                {selectedQuestions[currentQuestionIndex].answers.map((answer, index) => (
                    <VariantBody 
                        key={index}
                        name={answer.name}
                        state={answerStates[index]}
                        onClick={() => handleItemClick(index)}
                    />
                ))}
            </div>
        </div>
    )
}
export default QuizGame