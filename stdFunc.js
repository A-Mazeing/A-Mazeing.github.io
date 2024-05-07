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

function dropdowntoggle(){
    var dropdownmenu = document.getElementById('dropdownmenu');
    if (dropdownmenu.style.display == "none") {
        dropdownmenu.style.display = "block"
    }else{
        dropdownmenu.style.display = "none"
    }
    
}