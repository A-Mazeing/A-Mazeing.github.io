function startSeiteChange(){
    var div_startSeite = document.getElementById('startseite');
    var div_container = document.querySelector('.container');

    if (div_container && div_startSeite) {
        div_startSeite.style.display = 'none';
        div_container.style.display = 'flex';
        init();
    }
    else {
        console.error('Element nicht gefunden')
    }
}