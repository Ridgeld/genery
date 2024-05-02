// import styles from './Slider.module.scss';
import React, { useEffect } from "react";
import Slider from "react-slick";

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


export function MySlider() { // изменяем имя компонента

  useEffect(() => {
    const slider = document.querySelector('.slick-active');
    const slideIndex = parseInt(slider.getAttribute('data-index'));

    // Массив цветов фона для каждого слайда
    const backgroundColors = ["#C3F82B", "#FF4365", "#0040F9"];

    // Устанавливаем цвет фона body в зависимости от текущего слайда
    document.body.style.backgroundColor = backgroundColors[slideIndex];
  }, []);
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
      // Массив цветов фона для каждого слайда
      const backgroundColors = ["#C3F82B", "#FF4365", "#0040F9"];
      // Устанавливаем цвет фона body в зависимости от текущего слайда
      document.body.style.backgroundColor = backgroundColors[index];
      document.body.style.transition = "0.5s"
    }
  };
  return (
    <div className='slider_container'>
      <Slider {...settings}>
        <div>
          <div className="info_container">
            <div className="image_container">
              <img src="/genery/public/1.png"/>
            </div>
            <h2 className="title black">Играй. Общайся. Развивайся.</h2>
            <h3 className="text black">Выигрывай в гонке или проигрывай все в казино.</h3>
          </div>
        </div>
        <div>
          <div className="info_container">
            <div className="image_container">
              <img src="/genery/public/2.png"/>
            </div>
            <h2 className="title white">Учить - не значит запомнить</h2>
            <h3 className="text white">Эту и многие другие цитаты ты узнаешь</h3>
          </div>  
        </div>
        <div>
          <div className="info_container">
            <div className="image_container">
              <img src="/genery/public/3.png"/>
            </div>
            <h2 className="title white">Я забыл права дома. Честно</h2>
            <h3 className="text white">Вот ты и попался, а использовал бы наши причины, мог быть на свободе</h3>
          </div>  
        </div>
      </Slider>
    </div>
  );
}