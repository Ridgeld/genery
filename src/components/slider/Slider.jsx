// import styles from './Slider.module.scss';
import React, { useContext, useEffect, useState } from "react";
import Slider from "react-slick";
import { ElementContext }  from "../../providers/ElementProvider.jsx";
import '../../themes/default.scss'
import './Slider.scss'

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function SampleNextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: "none"}}
      onClick={onClick}
    />
  );
}


function SamplePrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: "none" }}
      onClick={onClick}
    />
  );
}


function MySlider() { // изменяем имя компонента
    const { theme, elementColors, setElementColors } = useContext(ElementContext);
    const [slideIndex, setSlideIndex] = useState(0);

    // useEffect(() => {
    //   setElementColors({
    //       iconColor: theme.icon_color,
    //       titleColor: theme.text_first_color,
    //       showArrow: true,
    //       arrowColor: theme.text_first_color,
    //       arrowLink: '#/menu',
    //       isHeaderBackground: true,
    //       headerBackground: theme.background_color,
    //       isHeader: true,
    //       isFooter: true,
    //       footerBackground: theme.background_color,
    //       activeElementIndex: 2,
    //       background: '#676767'
    //   });
    //   },[ElementContext]);
    useEffect(() => {
        const slider = document.querySelector('.slick-active');
        const slideIndex = parseInt(slider.getAttribute('data-index'));

        // Массив цветов фона для каждого слайда
        const backgroundColors = ["#C3F82B", "#FF4365", "#0040F9"];
        const colorsArray = {
            0: { // Цвета для первого слайда
                iconColor: '#0A0B10',
                titleColor: '#0A0B10',
                showArrow: false,
                arrowColor: '#0000FF',
                isBackground: false,
                backgroundColor: '#FFFF00',
                isHeader: true,
            },
            1: { // Цвета для второго слайда
                iconColor: '#ffffff',
                titleColor: '#ffffff',
                showArrow: false,
                arrowColor: '#0000FF',
                isBackground: false,
                backgroundColor: '#FFFF00',
                isHeader: true,
            },
            2: { // Цвета для третьего слайда
                iconColor: '#ffffff',
                titleColor: '#ffffff',
                showArrow: false,
                arrowColor: '#0000FF',
                isBackground: false,
                backgroundColor: '#FFFF00',
                isHeader: true,
            },
            // Добавьте цвета для других слайдов по мере необходимости
        };
        // Устанавливаем цвет фона body в зависимости от текущего слайда
        document.body.style.background= backgroundColors[slideIndex];
        document.body.style.transition = "0.5s";

        setElementColors(colorsArray[slideIndex]);
        // console.log(elementColors.iconColor);
    }, [slideIndex]);
  const settings = {
    customPaging: function(i) {
      return (
        <a>
          <div className='dots'/>
        </a>
      );
    },
    dots: true,
    dotsClass: "slick-dots slick-thumb",
    infinite: true,
    autoplay: true,
    autoplaySpeed: 3000,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    afterChange: (index) => {
        setSlideIndex(index); // Обновляем текущий индекс слайда
      }
  };
  return (
    <div className='slider_container'>
      <Slider {...settings}>
        <div>
          <div className="info_container">
            <div className="image_container">
              <img src="1.png"/>
            </div>
            <h2 className="title black">Играй. Общайся. Развивайся.</h2>
            <h3 className="text black">Выигрывай в гонке или проигрывай все в казино.</h3>
          </div>
        </div>
        <div>
          <div className="info_container">
            <div className="image_container">
              <img src="2.png"/>
            </div>
            <h2 className="title white">Учить - не значит запомнить</h2>
            <h3 className="text white">Эту и многие другие цитаты ты узнаешь</h3>
          </div>  
        </div>
        <div>
          <div className="info_container">
            <div className="image_container">
              <img src="3.png"/>
            </div>
            <h2 className="title white">Я забыл права дома. Честно</h2>
            <h3 className="text white">Вот ты и попался, а использовал бы наши причины, мог быть на свободе</h3>
          </div>  
        </div>
      </Slider>
    </div>
  );
}
export default MySlider
