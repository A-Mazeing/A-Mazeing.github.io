function startCam()
{
    const video = document.getElementById('videoCanv');
    const canvas = document.getElementById('kameraCanv');

    navigator.mediaDevices.getUserMedia({ video: true })
    .then(function(stream) {
      video.srcObject = stream;
    })
    .catch(function(err) {
      console.error('Fehler beim Zugriff auf die Kamera: ', err);
    });

    video.addEventListener('play', function() {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    
        function draw() {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          requestAnimationFrame(draw);
        }
    
        requestAnimationFrame(draw);
      });
}
window.addEventListener('load', startCam);

