import React, { useContext, useEffect, useState } from 'react';
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

function QuizGame({ mode }){
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
            arrowLink: '#/quiz',
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
                setTimeout(() => nextQuestion(), 1000);
            }
        }
    };
    const quitGame = () =>{
        navigateTo('/quiz');
    }
    
    const nextQuestion = () => {
        if (currentQuestionIndex < selectedQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            // Конец викторины
            setIsQuizFinished(true);
            if(mode === 'kyrgyz'){
                if (score > 40) {
                    setAlertProp({
                        isShow: true,
                        title: 'Вы выиграли!',
                        text: `Викторина завершена! Ваш счёт: ${score}. Вы также были приняты в Улуттук гвардия на бюджетную форму обучения!`,
                        firstButtonName: 'Выйти',
                        secondButtonName: 'Играть снова',
                        firstButtonOnClick: quitGame,
                        secondButtonOnClick: resetQuiz,
                    });
                } else if (score < 20) {
                    setAlertProp({
                        isShow: true,
                        title: 'Вы проиграли!',
                        text: `Викторина завершена! Ваш счёт: ${score}. Вы также были приняты в Улуттук гвардия, поздравляем!`,
                        firstButtonName: 'Выйти',
                        secondButtonName: 'Играть снова',
                        firstButtonOnClick: quitGame,
                        secondButtonOnClick: resetQuiz,
                    });
                }
            } else if (mode === 'russian'){
                if (score > 40) {
                    setAlertProp({
                        isShow: true,
                        title: 'Вы выиграли!',
                        text: `Викторина завершена! Ваш счёт: ${score}. Вы также были приняты в ряды российской армии на бюджет, поздравляем!`,
                        firstButtonName: 'Выйти',
                        secondButtonName: 'Играть снова',
                        firstButtonOnClick: quitGame,
                        secondButtonOnClick: resetQuiz,
                    });
                } else if (score < 20) {
                    setAlertProp({
                        isShow: true,
                        title: 'Вы проиграли!',
                        text: `Викторина завершена! Ваш счёт: ${score}. Вы также были приняты в ряды российской армии, поздравляем!`,
                        firstButtonName: 'Выйти',
                        secondButtonName: 'Играть снова',
                        firstButtonOnClick: quitGame,
                        secondButtonOnClick: resetQuiz,
                    });
                }
            } else if (mode === 'math'){
                if (score > 40) {
                    setAlertProp({
                        isShow: true,
                        title: 'Вы выиграли!',
                        text: `Викторина завершена! Ваш счёт: ${score}. Вы также были приняты в ряды военных инженеров СВО на бюджет, поздравляем!`,
                        firstButtonName: 'Выйти',
                        secondButtonName: 'Играть снова',
                        firstButtonOnClick: quitGame,
                        secondButtonOnClick: resetQuiz,
                    });
                } else if (score < 20) {
                    setAlertProp({
                        isShow: true,
                        title: 'Вы проиграли!',
                        text: `Викторина завершена! Ваш счёт: ${score}. Вы также были приняты в ряды военных инженеров СВО, поздравляем!`,
                        firstButtonName: 'Выйти',
                        secondButtonName: 'Играть снова',
                        firstButtonOnClick: quitGame,
                        secondButtonOnClick: resetQuiz,
                    });
                }
            } else if (mode === 'english'){
                if (score > 40) {
                    setAlertProp({
                        isShow: true,
                        title: 'Вы выиграли!',
                        text: `Викторина завершена! Ваш счёт: ${score}. Вы также были приняты в ряды российской разведки на бюджет, поздравляем!`,
                        firstButtonName: 'Выйти',
                        secondButtonName: 'Играть снова',
                        firstButtonOnClick: quitGame,
                        secondButtonOnClick: resetQuiz,
                    });
                } else if (score < 20) {
                    setAlertProp({
                        isShow: true,
                        title: 'Вы проиграли!',
                        text: `Викторина завершена! Ваш счёт: ${score}. Вы также были приняты в ряды российской разведки, поздравляем!`,
                        firstButtonName: 'Выйти',
                        secondButtonName: 'Играть снова',
                        firstButtonOnClick: quitGame,
                        secondButtonOnClick: resetQuiz,
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