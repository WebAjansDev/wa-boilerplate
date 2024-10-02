import { gsap } from "gsap";

import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

gsap.to('.testSwiper', {
    x: -100,
})

gsap.to('.testSwiper', {
    scrollTrigger: {
        trigger: '.testSwiper',
        start: 'top center',
        end: 'bottom center',
        scrub: true,
        markers: true,
    },
    x: 100,
})