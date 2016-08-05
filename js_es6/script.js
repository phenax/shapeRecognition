

import { EdgeDetector } from './EdgeDetector';



const template= new EdgeDetector({
    canvas: document.getElementById('frame'),
    image: './img/hands.png',
    dimen: {
        width: 100,
        height: 100
    },
});

template.start();


const edgeDetector= new EdgeDetector({
    canvas: document.getElementById('edgeDetection'),
    video:  document.getElementById('showWebCam'),
    dimen: {
        width: 300,
        height: 200
    },
});

edgeDetector.matchTemplate({
    src: './img/hands.png',
    aspectRatio: 1,
    dimen: {
        from: 50,
        to:   200
    }
});

edgeDetector.start();
