// import styles from './Slider.module.scss';
import React from "react";
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
    prevArrow: <SamplePrevArrow />
  };
  return (
    <div className='slider_container'>
      <Slider {...settings}>
        <div>
          <h2>Уникальный проект</h2>
          <h3>Выигрывай в гонке или проигрывай все в казино.</h3>
        </div>
        <div>
          <h2>Фильтруй базар</h2>
          <h3>Используй в своей речи только высокоинтеллектуальные цитаты, да</h3>
        </div>
        <div>
          <h2>Потому что проспал...</h2>
          <h3>Вот ты и попался, а использовал бы наши причины смог быть на свободе</h3>
        </div>
        <div>
          <h2>Учить не значит запомнить!</h2>
          <h3>Именно такие цитаты используют наши пользователи в повседневной жизни</h3>
        </div>
      </Slider>
    </div>
  );
}
