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

    let useExternalCamera = false; // Flag, um zu bestimmen, ob die Außenkamera verwendet werden soll

    // Überprüfen, ob es sich um ein Mobilgerät handelt
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        useExternalCamera = true; // Wenn ja, verwende die Außenkamera
    }

    if (!bCanvasCreating) {
        // Wenn eine externe Kamera verwendet werden soll, verwende die Außenkamera
        if (useExternalCamera) {
            //try {
                const externalStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                const externalVideo = document.createElement('video');
                externalVideo.srcObject = externalStream;
                externalVideo.setAttribute('playsinline', true);
                externalVideo.muted = true;
                externalVideo.style.width = width + 'px';
                externalVideo.style.height = height + 'px';
                externalVideo.play();

                document.getElementById('webcam-container').appendChild(externalVideo);
            //} catch (error) {
                console.error('Unable to access external camera:', error);
                // Fallback to default camera
                webcam = new tmImage.Webcam(width, height, flip);
                await webcam.setup();
                bCanvasCreating = true;
            //}
        } else {
            // Verwende die Standard-Webcam
            webcam = new tmImage.Webcam(width, height, flip);
            await webcam.setup();
            bCanvasCreating = true;
        }
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
const devices = await navigator.mediaDevices.enumerateDevices();
const videoDevices = devices.filter(device => device.kind === 'videoinput');

if (videoDevices.length < 2) {
    console.log("Nicht genügend Kameras gefunden.");
    return;
}

// Bestimmen, welches Gerät aktuell nicht ausgewählt ist
const currentDeviceId = webcam.stream.getVideoTracks()[0].getSettings().deviceId;
const newDevice = videoDevices.find(device => device.deviceId !== currentDeviceId);

if (newDevice) {
    const newStream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: newDevice.deviceId } } });
    webcam.stream.getVideoTracks()[0].stop(); // Stoppen des aktuellen Streams
    webcam.stream = newStream;
    webcam.video.srcObject = newStream;
    webcam.video.play();
    console.log("Kamera wurde gewechselt zu: " + newDevice.label);
} else {
    console.log("Kamera-Wechsel fehlgeschlagen.");
}

