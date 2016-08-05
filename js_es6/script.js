

import { EdgeDetector } from './EdgeDetector';




const edgeDetector= new EdgeDetector({
    canvas: document.getElementById('edgeDetection'),
    video:  document.getElementById('showWebCam'),
    dimen: {
        width: 300,
        height: 200
    },
});

edgeDetector.start();
