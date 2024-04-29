// der Link zu Ihrem Modell von Teachable Machine
const URL = 'https://teachablemachine.withgoogle.com/models/x7VbUE8f3/';

let model, webcam, labelContainer, maxPredictions;
let isIos = false; 
// Prüfen, ob es sich um ein iOS-Gerät handelt
if (window.navigator.userAgent.indexOf('iPhone') > -1 || window.navigator.userAgent.indexOf('iPad') > -1) {
  isIos = true;
}

let bCanvasCreating = false
// Funktion zum Initialisieren des Modells und der Webcam
async function init() {
    const modelURL = URL + 'model.json';
    const metadataURL = URL + 'metadata.json';

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const flip = true; // ob die Webcam gespiegelt werden soll
    const width = 200;
    const height = 200;
    if(!bCanvasCreating)
    {
        webcam = new tmImage.Webcam(width, height, flip);
        await webcam.setup();
        bCanvasCreating = true
    }
    
    // Wenn es sich um ein iOS-Gerät handelt, füge die Webcam direkt ein
    if (isIos) {
        document.getElementById('webcam-container').appendChild(webcam.webcam);
        const webCamVideo = document.getElementsByTagName('video')[0];
        webCamVideo.setAttribute("playsinline", true);
        webCamVideo.muted = "true";
        webCamVideo.style.width = width + 'px';
        webCamVideo.style.height = height + 'px';
    } else {
        const canvas = webcam.canvas;
        canvas.id = 'webcam-canvas'; // Setzt die ID des Canvas-Elements
        canvas.style.borderRadius = 'inherit'; // Übernimmt die runde Form vom Webcam-Container
        document.getElementById("webcam-container").appendChild(canvas);
    }

    // Container für die Klassifizierungen
    labelContainer = document.getElementById('Exp_Ergebnis');
    for (let i = 0; i < maxPredictions; i++) {
        labelContainer.appendChild(document.createElement('div'));
    }
    webcam.play();
    window.requestAnimationFrame(loop);
    //Altes Div auf Schwarz nach start der Kamera um Rand zu entfernen
    document.getElementById('webcam-container').style.backgroundColor = 'black';
}

// Funktion zum Aktualisieren und Vorhersagen mit der Webcam
async function loop() {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

// Funktion zum Durchführen von Vorhersagen
async function predict() {
    let prediction;
    if (isIos) {
        prediction = await model.predict(webcam.webcam);
    } else {
        prediction = await model.predict(webcam.canvas);
    }
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ': ' + prediction[i].probability.toFixed(2);
        labelContainer.innerHTML = classPrediction;
    }
}

async function switchCamera()
{
    await webcam.stop();
    webcam.flip();
    await webcam.play();
}