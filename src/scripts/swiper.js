import Swiper from "swiper";
import { Navigation, Pagination } from "swiper/modules";
import 'swiper/swiper-bundle.css'

let testSwiper = new Swiper('.testSwiper', {
    modules: [Navigation, Pagination],
    speed: 1000,
    navigation: {
        nextEl: '.testSwiper-next',
        prevEl: '.testSwiper-prev'
    },
    pagination: {
        el: '.testSwiper-pagination'
    }
})