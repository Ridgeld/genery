import { Header } from '../header/Header.jsx'
import { Buttons } from './buttons/Buttons.jsx';
import { Image_container } from './image_container/Image_container.jsx'
import { MySlider } from './slider/Slider.jsx'

export function About(){
  return (
    <>
    <Header/>
    <MySlider/>
    <Buttons/>
    <Image_container/>
    </>
  )
}