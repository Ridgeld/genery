// import React, { useContext, useEffect, useState } from 'react';
// import styles from './Quiz.module.scss'
// import { ElementContext, useTheme } from '../../providers/ElementProvider.jsx';
// import ProgressBar from '../../components/progress-bars/Test-progress-bar/ProgressBar.jsx';
// import ScoreContainer from '../../components/score-container/ScoreContainer.jsx';
// import VariantBody from './VariantBody.jsx';
// import { useParams } from 'react-router-dom';

// function Quiz(){
//     const { mode } = useParams();
//     // const {theme, setThemeById, elementColors, setElementColors } = useContext(ElementContext);

//     useEffect(() => {
//         setElementColors({
//             iconColor: theme.icon_color,
//             titleColor: theme.text_first_color,
//             showArrow: true,
//             arrowLink: '#/game-menu',
//             arrowColor: theme.text_first_color,
//             isHeaderBackground: true,
//             headerBackground: theme.background_color,
//             isHeader: true,
//             isFooter: false,
//             footerBackground: theme.background_color,
//             activeElementIndex: 0,
//             background: theme.background_color
//         });
//         document.body.style.background = theme.background_color
//         },[ElementContext]);

//     const questions = [
//         {
//             question: 'Сколько будет 2 + 2',
//             answers: [
//                 {name: '2'},
//                 {name: '8'},
//                 {name: 'Германия'},
//                 {name: '4'},
//             ],
//             correctAnswerIndex: 3
//         },
//         {
//             question: 'Сколько будет 2^2',
//             answers: [
//                 {name: '2'},
//                 {name: '1488'},
//                 {name: 'Наполеон'},
//                 {name: '4'},
//             ],
//             correctAnswerIndex: 3
//         }
//     ]
//     const getRandomQuestions = (questions, num) => {
//         const shuffled = [...questions].sort(() => 0.5 - Math.random());
//         return shuffled.slice(0, num);
//     };

//     const [selectedQuestions, setSelectedQuestions] = useState(getRandomQuestions(questions, 10));
//     const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//     const [answerStates, setAnswerStates] = useState(new Array(4).fill('base'));
//     const [score, setScore] = useState(0);
//     const [timer, setTimer] = useState(10); // Время на вопрос
//     const [questionAnswered, setQuestionAnswered] = useState(false);

//     const formatTime = (time) => {
//         const minutes = Math.floor(time / 60);
//         const seconds = time % 60;
//         return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
//     };

//     useEffect(() => {
//         let interval;
//         if (timer > 0 && !questionAnswered) {
//           interval = setInterval(() => {
//             setTimer(timer - 1);
//           }, 1000);
//         } else if (timer === 0) {
//           handleTimeout();
//         }
//         return () => clearInterval(interval);
//       }, [timer, questionAnswered]);

//     useEffect(() => {
//         setAnswerStates(new Array(selectedQuestions[currentQuestionIndex].answers.length).fill('base'));
//         setTimer(10);
//         setQuestionAnswered(false);
//     }, [currentQuestionIndex]);
//     // Выбираем случайный вопрос при загрузке компонента
//     const handleItemClick = (index) => {
//         if (!questionAnswered) {
//           const isCorrect = index === selectedQuestions[currentQuestionIndex].correctAnswerIndex;
//           const newAnswerStates = answerStates.map((state, i) => (i === index ? (isCorrect ? 'correct' : 'incorrect') : state));
//           setAnswerStates(newAnswerStates);
//           if (isCorrect) setScore(score + 5);
//           setQuestionAnswered(true);
//           setTimeout(() => nextQuestion(), 1000);
//         }
//       };
    
//       const handleTimeout = () => {
//         if (!questionAnswered) {
//           const correctIndex = selectedQuestions[currentQuestionIndex].correctAnswerIndex;
//           const newAnswerStates = answerStates.map((state, i) => (i === correctIndex ? 'correct' : 'base'));
//           setAnswerStates(newAnswerStates);
//           setQuestionAnswered(true);
//           setTimeout(() => nextQuestion(), 1000);
//         }
//       };
    
//       const nextQuestion = () => {
//         if (currentQuestionIndex < selectedQuestions.length - 1) {
//           setCurrentQuestionIndex(currentQuestionIndex + 1);
//         } else {
//           // Конец викторины
//           alert(`Викторина завершена! Ваш счёт: ${score}`);
//           resetQuiz();
//         }
//       };
//       const resetQuiz = () => {
//         setSelectedQuestions(getRandomQuestions(questions, 10));
//         setCurrentQuestionIndex(0);
//         setAnswerStates(new Array(4).fill('base'));
//         setScore(0);
//         setTimer(10);
//         setQuestionAnswered(false);
//       };
    
//       const progress = ((currentQuestionIndex + 1) / selectedQuestions.length) * 100;
    
//       if (!selectedQuestions[currentQuestionIndex]) return null;


//     return(
//         <div className={styles['container']}>
//             <ScoreContainer 
//                 name={'Время'}
//                 isBalance={false}
//                 count={formatTime(timer)}/>
//             <h3 className={styles['question-index']}
//                 style={{
//                     color: theme.text_first_color
//                 }}>Вопрос: {currentQuestionIndex + 1} / {selectedQuestions.length}</h3>
//             <ProgressBar 
//                 color={theme.first_color}
//                 progress={`${progress}%`}/>
//             <div className={styles['question-body']}
//                 style={{
//                     color: theme.text_first_color
//                 }}>
//                 {selectedQuestions[currentQuestionIndex].question}
//             </div>
//             <div className={styles['variants-container']}>
//                 {selectedQuestions[currentQuestionIndex].answers.map((answer, index) => (
//                     <VariantBody 
//                         key={index}
//                         name={answer.name}
//                         state={answerStates[index]}
//                         onClick={() => handleItemClick(index)}
//                     />
//                 ))}
//             </div>
//         </div>
//     )
// }
// export default Quiz
import React from 'react';

// import { useAuth } from "../../providers/Authprovired.jsx";
import { useParams } from 'react-router-dom';

import QuizGame from './QuizGame.jsx';
import SelectMode from './SelectMode.jsx';

function Quiz(){
    const { mode } = useParams();

    if (!mode) {
        return <SelectMode/>;
      } else {
        return <QuizGame mode={ mode }/>;
      }
}
export default Quiz