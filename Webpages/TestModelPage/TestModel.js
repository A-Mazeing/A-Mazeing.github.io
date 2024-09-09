model = ''
function PageInit(){

}

//Lädt ein zuvor vom Nutzer erstelltes Model vom Server 
async function ModelInit(projectName) {
    try {
    const path = '../../UserModels/${projectName}';
    const modelFilePaths = [
        '${path}/model.js',
        '${path}/weights.bin',
        '${path}/metadata.js'
        
    ]
    //Model Laden aus Datei 
    model = await tmImage.loadFromFiles(modelFilePaths[0], modelFilePaths[1], modelFilePaths[2]); 
    }catch(error) // TD: Error Handling noch überarbeiten -> FehlerFenster Erstellen
    {
        if (error === 'ENOENT') console.error('Datei nicht gefunden');
        else console.error('unbekannter Fehler');
    }
}

//Gibt die % der Testdaten aus
async function GetModelData(){

    const fs = require('fs'); // Modul zum Arbeiten mit dem Dateisystem
  const path = require('path'); // Modul für Pfadmanipulationen

  try {
    // Alle Dateien und Unterordner im angegebenen Ordner rekursiv auflisten
    const files = await fs.promises.readdir(folderPath, { withFileTypes: true });

    for (const file of files) {
      const filePath = path.join(folderPath, file.name);

      // Überprüfen, ob es sich um einen Ordner handelt
      if (file.isDirectory()) {
        await processFilesInFolder(filePath); // Rekursiv für Unterordner aufrufen
      } else {
        // Nur Bilddateien verarbeiten (passe die Erweiterung nach Bedarf an)
        if (path.extname(filePath) === '.jpg' || path.extname(filePath) === '.png') {
          // Bilddatei als img festlegen und Vorhersage ausführen
          const img = filePath;
          const prediction = await model.predict(img, false);
          console.log(`Prediction for ${img}:`, prediction);
        }
      }
    }
  } catch (error) {
    console.error('Error processing files:', error);
  }
}