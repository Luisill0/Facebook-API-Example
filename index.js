var redirect_uri = 'http://localhost:44967/index.html';
var client_id = null; //Your own client_id goes here
var client_secret = null; //Your own client_secret goes here
var state = '987654321';

var access_token = null;
var user_id = null;

var AUTHORIZE = 'https://www.facebook.com/v6.0/dialog/oauth';
var TOKEN = 'https://graph.facebook.com/v6.0/oauth/access_token';
var INFORMATION = 'https://graph.facebook.com/me';

function onPageLoad(){
    if(window.location.search.length > 0){
        console.log("time to handle");
        handleRedirect();
    }
}

function handleRedirect(){
    console.log('Time to handle');
    let code = getCode();
    fetchAccessToken(code);
    window.history.pushState("","",redirect_uri);     //Limpia la url
}

function requestAuthorization(){
    console.log('request');
    localStorage.setItem("client_id", client_id);
    localStorage.setItem("client_secret", client_secret);

    let url = AUTHORIZE;
    url += '?client_id=' + client_id;
    url += '&redirect_uri=' + encodeURI(redirect_uri);
    url += '&state='+ state;
    console.log('window location');
    window.location.href = url;
}

function getCode(){
    let code = null;
    const queryString = window.location.search;
    if(queryString.length > 0){
        const urlParams = new URLSearchParams(queryString);
        code = urlParams.get('code');
    }
    return code;
}

function fetchAccessToken(code){
    localStorage.setItem("code", code);
    let body = "?redirect_uri=" + encodeURI(redirect_uri);
    body += "&client_id=" + client_id;
    body += "&client_secret=" + client_secret;
    body += "&code=" + code;
    callAuthorizationApi(body);
}

function callAuthorizationApi(body){
    let xhr = new XMLHttpRequest();
    xhr.open("GET", TOKEN + body, true);
    xhr.send();
    xhr.onload = handleAuthorizationResponse;
}

function handleAuthorizationResponse(){
    if( this.status == 200){
        var data = JSON.parse(this.responseText);
        console.log(data);
        if(data.access_token != undefined){
            access_token = data.access_token;
            localStorage.setItem("access_token", access_token);
        }
        if(data.userID != undefined){
            user_id = data.userID;
            localStorage.setItem("userID", user_id);
        }
        onPageLoad();
    }else{
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function getInformation(){
    let xhr = new XMLHttpRequest();
    let url = INFORMATION + '?fields=id,name,email,gender';
    xhr.open("GET", url, true);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
    xhr.send();
    xhr.onload = handleInformationResponse;
}

function handleInformationResponse(){
    if(this.status == 200){
        var userdata = JSON.parse(this.responseText);
        console.log(userdata);
        clearListItems();
        addItems(userdata);
    }
    else{
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function addItems(userdata){
    let fields = [
        ["Name: ", userdata.name], 
        ["ID: ", userdata.id], 
        ["Email: ", userdata.email],
    ];

    fields.forEach(field => {
        let node = document.createElement('li');
        node.value = field[0];
        node.innerHTML = field[0] + field[1];
        document.getElementById("list").appendChild(node);
    });
}

function clearListItems(){
    let node = document.getElementById("list");
    while(node.firstChild){
        node.removeChild(node.firstChild);
    }
}