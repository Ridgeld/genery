import { Header } from '../header/Header.jsx'
import { Button } from './buttons/Buttons.jsx';
import { Image_container } from './image_container/Image_container.jsx'
import { MySlider } from './slider/Slider.jsx'

export function About(){
  return (
    <>
    <Header/>
    <MySlider/>
    <Button/>
    <Image_container/>
    </>
  )
}