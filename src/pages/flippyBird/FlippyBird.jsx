import React, { useContext, useEffect, useRef, useState } from 'react';
import styles from './FlippyBird.module.scss';
import { ElementContext } from '../../providers/ElementProvider';
import AlertNotification from '../../components/notifictions/AlertNotification/AlertNotification';
import ScoreContainer from '../../components/score-container/ScoreContainer';
import { useNavigate } from 'react-router-dom';

export default function FlippyBird(){
    const {theme, setThemeById, elementColors, setElementColors } = useContext(ElementContext);

    useEffect(() => {
        setElementColors({
            iconColor: theme.icon_color,
            titleColor: theme.text_first_color,
            showArrow: true,
            arrowLink: '#/game-menu',
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
    
    const [alertProp, setAlertProp] = useState({
        isShow: false,
        title: 'Заголовок',
        text: 'текст',
        firstButtonName: 'выйти',
        secondButtonName: 'играть',

    });
    

    const canvasRef = useRef();
    const [score, setScore] = useState(0);
    const navigateTo = useNavigate();
    const [dimensions, setDimensions] = useState({
        width: 360,
        height: 500
    });


    let board;
    let boardWidth = dimensions.width;
    let boardHeight = dimensions.height;
    let context;

    //bird
    const birdWidth = 70;
    const birdHeight = 70;
    const birdX = dimensions.width / 8;
    const birdY = dimensions.height / 2;
    let birdImg;

    let bird = {
        x : birdX,
        y : birdY,
        width : birdWidth,
        height : birdHeight
    }

    //pipes
    let pipeArray = [];
    const pipeWidth = 60;
    const pipeHeight = 400;
    const pipeX = dimensions.width;
    const pipeY = 0;

    let topPipeImg;
    let bottomPipeImg;

//physics
    let velocityX = -2; //pipes moving left speed
    let velocityY = 0; //bird jump speed
    let gravity = 0.4;

    let gameOver = false;
    // let score = 0;

    const handleResize = () => {
        const isMobile = window.innerWidth < 768; // Проверка на мобильное устройство
        const newWidth = Math.min(window.innerWidth, 360); // Ограничение ширины
    
        // Если это мобильное устройство, устанавливаем высоту в 700px
        const newHeight = isMobile ? 700 : Math.min(window.innerHeight, 100); // Ограничение высоты
    
        setDimensions({
            width: newWidth,
            height: newHeight
        });
    };

    useEffect(() => {
        // Добавляем обработчик события при монтировании
        window.addEventListener("resize", handleResize);
        
        // Вызов handleResize для установки начальных значений
        handleResize();

        // Удаляем обработчик события при размонтировании компонента
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);
    useEffect(() => {
        

        const canvas = canvasRef.current;
        if (!canvas) return;

        board = canvas;
        board.height = boardHeight;
        board.width = boardWidth;
        context = board.getContext("2d");

        birdImg = new Image();
        birdImg.src = "flippybird/flappybird.png";
        birdImg.onload = () => {
            context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
        };

        topPipeImg = new Image();
        topPipeImg.src = "flippybird/toppipe.png";

        bottomPipeImg = new Image();
        bottomPipeImg.src = "flippybird/bottompipe.png";

        requestAnimationFrame(update);
        const pipeInterval = setInterval(placePipes, 1500);

        document.addEventListener("click", moveBird);

        return () => {
            clearInterval(pipeInterval);
            document.removeEventListener("click", moveBird);
        };
    }, [birdImg]);

    const update = () => {
        requestAnimationFrame(update);
        if (gameOver) {
            return;
        }
        context.clearRect(0, 0, board.width, board.height);

        //bird
        velocityY += gravity;
        // bird.y += velocityY;
        bird.y = Math.max(bird.y + velocityY, 0); //apply gravity to current bird.y, limit the bird.y to top of the canvas
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

        if (bird.y > board.height) {
            gameOver = true;
        }

        //pipes
        for (let i = 0; i < pipeArray.length; i++) {
            let pipe = pipeArray[i];
            pipe.x += velocityX;
            context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

            if (!pipe.passed && bird.x > pipe.x + pipe.width) {
                setScore((prevScore) => (prevScore += 0.5)); //0.5 because there are 2 pipes! so 0.5*2 = 1, 1 for each set of pipes
                pipe.passed = true;
            }

            if (detectCollision(bird, pipe)) {
                gameOver = true;
            }
        }

        //clear pipes
        while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
            pipeArray.shift(); //removes first element from the array
        }

        //score
        context.fillStyle = "white";
        context.font="15px sans-serif";
        // context.fillText(score, 5, 45);

        if (gameOver) {
            setAlertProp({
                isShow: true,
                title: 'Вы проиграли!',
                text: `Ваш счет: ${score}`,
                firstButtonName: 'Выйти',
                secondButtonName: 'Играть',
                firstButtonOnClick: () => navigateTo('/game-menu'),
                secondButtonOnClick: () => resetGame()
        
            })
            // context.fillText("GAME OVER", 5, 90);
        }
    }
    const resetGame = () => {
        // alert(9)
        gameOver = false  // Сбрасываем состояние gameOver
        bird = {
            x : birdX,
            y : birdY,
            width : birdWidth,
            height : birdHeight
        }
        pipeArray = [];      // Очищаем массив труб
        setScore(0);         // Сбрасываем счет
        setAlertProp({
            isShow: false    // Скрываем уведомление
        });
    };


    const placePipes = () => {
        if (gameOver) {
            return;
        }

        //(0-1) * pipeHeight/2.
        // 0 -> -128 (pipeHeight/4)
        // 1 -> -128 - 256 (pipeHeight/4 - pipeHeight/2) = -3/4 pipeHeight
        let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
        let openingSpace = board.height/4;

        let topPipe = {
            img : topPipeImg,
            x : pipeX,
            y : randomPipeY,
            width : pipeWidth,
            height : pipeHeight,
            passed : false
        }
        pipeArray.push(topPipe);

        let bottomPipe = {
            img : bottomPipeImg,
            x : pipeX,
            y : randomPipeY + pipeHeight + openingSpace,
            width : pipeWidth,
            height : pipeHeight,
            passed : false
        }
        pipeArray.push(bottomPipe);
    }

    const moveBird = (e) => {
        // alert(9)
        velocityY = -6;
        // if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        //     //jump
        //     velocityY = -6;

        //     //reset game
        //     // if (gameOver) {
        //     //     bird.y = birdY;
        //     //     pipeArray = [];
        //     //     setScore(0);
        //     //     gameOver = false;
        //     // }
        // }
    }

    const detectCollision = (a, b) => {
        return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
            a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
            a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
            a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
    }

    return(
        <div className={styles['container']}>
            {/* <ScoreContainer
                name={'Счет'}
                isBalance={false}
                count={score}/>
            <AlertNotification
                title={alertProp.title}
                text={alertProp.text}
                isShow={alertProp.isShow}
                firstButtonName={alertProp.firstButtonName}
                secondButtonName={alertProp.secondButtonName}
                firstButtonOnClick={alertProp.firstButtonOnClick}
                secondButtonOnClick={alertProp.secondButtonOnClick}/> */}
            {/* <canvas  ref={canvasRef} className={styles['board']}></canvas> */}
            <iframe className={styles['game']} src="https://ridgeld.github.io/game/" allowfullscreen></iframe>
        </div>
    )
}