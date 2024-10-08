// der Link zu Ihrem Modell von Teachable Machine
gModelURL = '';

let devices, model, webcam, labelContainer, maxPredictions;
let bIsIos = false; 

const bflip_in = true; // Spieglung der Webcam
const width = 400;
const height = 400;

//---------------------------------------------------------//
// Prüfen, ob es sich um ein iOS-Gerät handelt
if (window.navigator.userAgent.indexOf('iPhone') > -1 || window.navigator.userAgent.indexOf('iPad') > -1) {
    bIsIos = true;
}

async function deviceDropdownInit() {
    // Enumerate devices
    devices = (await navigator.mediaDevices.enumerateDevices()).filter(device => device.kind === 'videoinput');

    // Populate dropdown
    var dropdownmenu = document.getElementById('dropdownmenu');
    devices.forEach(device => {
        const dropdownItem = document.createElement('a');
        dropdownItem.classList.add('dropdown-item');
        dropdownItem.href = '#';
        dropdownItem.textContent = device.label;
        dropdownItem.addEventListener('click', () => dropDownClick(device.deviceId));
        dropdownmenu.appendChild(dropdownItem);
    });
}

async function dropDownClick(device){ 
    var webcamCanvas = document.getElementById('webcam-canvas');
    webcamCanvas.remove();
    await createWebcam(width, height, bflip_in, device, bIsIos);
}


//---------------------------------------------------------//
//Init Model 
async function modelInit(url_Model) { 
    try{
        const modelURL = url_Model + 'model.json';
        const metadataURL = url_Model + 'metadata.json';
    
    
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
    }
    catch (error) {
        OnErrorMessage(error.message);
    }
    
}

function OnErrorMessage(error_message, level_error){
    switch (level_error){
        case 0: //Stufe 0: nur Console Log
            console.log(error_message);
        case 1: //Stufe 1: Alert Message
            alert(message);
        case 2: //Stufe 2: Altert Message + Console Log
            console.log(error_message);
            alert(error_message);
        //case 3: ToDo -> Für zukünftigten Save in Project Datei
    }; 
}

//---------------------------------------------------------//
//Webframe erstellen und für Ios anpassen 
async function createWebcam(breite, hoehe, bSpiegelung, deviceId, bIos) {
    
    // Erstellt das WebcamObjekt
    try{
        if (width && height && bflip_in){
            webcam = new tmImage.Webcam(breite, hoehe, bSpiegelung);
        } else {
            console.error('Parameter createWebcam missing');
        }
        if (deviceId){
            await webcam.setup({deviceId});
        } else {
            await webcam.setup({ facingMode: "environment" }); //Standart: Rückseitenkamera
        }
    
        //Platformhandling: IOS ist komisch deshalb das
        if(bIos){
            document.getElementById('webcam-container').appendChild(webcam.webcam);
            const webCamVideo = document.getElementsByTagName('video')[0]; //erstes Video Element von Dom 
            webCamVideo.setAttribute("playsinline", true);
            webCamVideo.muted = "true"; //Autoplaystopp von IOS hindern, die letzten 2 zeilen nicht entfernen 
            webCamVideo.style.width = width + 'px';
            webCamVideo.style.height = height + 'px';
        } else {
            const canvas = webcam.canvas;
            canvas.id = 'webcam-canvas'; // Setzt die ID des Canvas-Elements
            canvas.style.borderRadius = 'inherit'; // Übernimmt die runde Form vom Webcam-Container
            document.getElementById("webcam-container").appendChild(canvas);
        }
        webcam.play();
    }catch (error) {
        OnErrorMessage(error, 2);
    }
    

    
    
}

//---------------------------------------------------------//
//Allgemeine Init und festlegung einmaliger Aufrufe 
async function init() {

    await modelInit(gModelURL);

    await createWebcam(width, height, bflip_in, undefined, bIsIos);

    await deviceDropdownInit();

    document.getElementById('container_Auswahl').addEventListener('change', function() {
        // Greife auf das <select> Element mit der ID 'selectionbox' zu
        const selectElement = document.getElementById('selectionbox'); 
        const selectVal = selectElement.value; 
        
        // Verwende den ausgewählten Wert in einem switch-Block
        switch (selectVal) {
            case '1': // Zeige alles an
                document.getElementById('Ergebnis_Text').style.display = "block";
                document.getElementById('Exp_Ergebnis').style.display = "block";
                break;
            case '2': // Hier könnte noch Logik hinzugefügt werden
                break;
            case '3': // Zeige nur den Klassennamen
                document.getElementById('Ergebnis_Text').style.display = "block"; 
                document.getElementById('Exp_Ergebnis').style.display = "none"; 
                break;
            default:
                console.log("Fehler bei der Auswahl");
        }
    });
    
    // Container indem das Ergebnis gezeigt wird
    labelContainer = document.getElementById('Exp_Ergebnis');

    //Altes Div auf Schwarz nach start der Kamera um Rand zu entfernen
    document.getElementById('webcam-container').style.backgroundColor = 'black';

    window.requestAnimationFrame(loop); //jeden Frame wird loop aufgerufen 
    

}



//---------------------------------------------------------//
// predictTopK gibt den höchsten Wert der Prediction aus 
async function predict() {
    let prediction;
    if(document.getElementById('webcam-canvas')){
        if (bIsIos) {
            prediction = await model.predictTopK(webcam.webcam, bflip_in); 
        } else {
            prediction = await model.predictTopK(webcam.canvas, bflip_in);
        }
        labelContainer.innerHTML = prediction[0].className + ": " + (prediction[0].probability*100).toFixed() + '%';
    }
}

//---------------------------------------------------------//
// Funktion zum Aktualisieren und Vorhersagen mit der Webcam
async function loop() {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

function onStartButtonClick() {
    var div_startSeite = document.getElementById('startseite');
    div_startSeite.style.display = 'none';

    var loading = document.querySelector('#loading');
    loading.style.display = 'flex';

    try {
        init().then(() => {
            loading.style.display = 'none';
            var div_container = document.querySelector('#container');
            div_container.style.display = 'flex';
        });
    } catch (error) {
        if (error.name === 'NotAllowedError') {
            alert('Zugriff auf die Kamera wurde verweigert. Bitte erlauben Sie den Zugriff in Ihren Browsereinstellungen.');
        }
        else {
            OnErrorMessage(error.message);
        }
    }
    
}

function dropdowntoggle(){
    var dropdownmenu = document.getElementById('dropdownmenu');
    if (dropdownmenu.style.display == "none") {
        dropdownmenu.style.display = "block"
    }else{
        dropdownmenu.style.display = "none"
    }
    
}

// Check nach der eingefügten URL, wenn gültig wird model geladen sonst fehler in console
function setUrl() {
    var inputUrl = document.getElementById("inputText").value;
    var startButton = document.getElementById("startButton");
    const regex = /(?:https:\/\/teachablemachine\.withgoogle\.com\/models\/)?([\w-]+)/;
    
    var match = inputUrl.match(regex);

    if (match) {
        inputUrl = match[1]; 

        startButton.disabled = false;
        gModelURL = "https://teachablemachine.withgoogle.com/models/" + inputUrl + "/";
    } else {
        console.log("ungültiger Link");
    }
}

window.onerror = function(message, source, lineno, colno, error) {
    OnErrorMessage(message, 2);
};
