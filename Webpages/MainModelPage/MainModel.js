model = ''
function PageInit(){

}

//Lädt ein zuvor vom Nutzer erstelltes Model vom Server 
async function ModelInit(projectName) {
  const path = require('path');
  try {
    // Erstelle den vollständigen Pfad zum Modellverzeichnis
    const basePath = path.resolve(__dirname, '../../UserModels', projectName);

    // Definiere die Dateinamen relativ zum Basispfad
    const modelFileName = 'model.js';
    const weightsFileName = 'weights.bin';
    const metadataFileName = 'metadata.js';

    // Erstelle die vollständigen Dateipfade
    const modelFilePath = path.join(basePath, modelFileName);
    const weightsFilePath = path.join(basePath, weightsFileName);
    const metadataFilePath = path.join(basePath, metadataFileName);

    // Übergebe die vollständigen Pfade an tmImage.loadFromFiles
    model = await tmImage.loadFromFiles(modelFilePath, weightsFilePath, metadataFilePath);
  } catch (error) {
    // Bessere Fehlerbehandlung:
    if (error.code === 'ENOENT') {
      console.error(`Eine oder mehrere Dateien wurden nicht gefunden: ${error.path}`);
    } else {
      console.error('Ein unerwarteter Fehler ist aufgetreten:', error);
      // Hier könntest du einen Fehlerdialog oder eine Benachrichtigung anzeigen
    }
  }
}

//Gibt die % der Testdaten aus
async function GetModelData(folderPath){

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

ModelInit('Front-Löwe Bias')
