async function calculateInterferenceSpeed() {
    const timeStart = performance.now();
    // let results = await Model(); Hier muss das Modell hin
    const timeEnd = performance.now();
    const timeTaken = timeEnd - timeStart
    console.log('Time taken ${timeTaken} ms.');
    console.log('Frames per second: ${1000/timeTaken}');
}


