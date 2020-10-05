// Inicializando o Firebase
var config = {
    apiKey: "AIzaSyBxDUuRXd3jsvK1i_ljF0yKWY9TFm3MwcU",
    authDomain: "teste-mqtt.firebaseapp.com",
    databaseURL: "https://teste-mqtt.firebaseio.com",
    projectId: "teste-mqtt",
    storageBucket: "teste-mqtt.appspot.com",
    messagingSenderId: "252214925741",
    appId: "1:252214925741:web:670f553accf7a23332a924"
}

firebase.initializeApp(config); 
const database = firebase.database();
const dbRef = firebase.database().ref();

const criarChave = (tabela) =>{
    return database.ref().child(tabela).push().key;
}

function gravarNoBanco(tabela, chave, registro){
    let chaveRecebida = chave == '' ? criarChave(tabela) : chave;
    let registros = {};
    let url = '/' + tabela + '/' + chaveRecebida;
    registros[url] = registro;
    database.ref().update(registros);
    //console.log("Registro " + chaveRecebida + " inserido na tabela " + tabela);

    return chaveRecebida;
}

function atualizarAtributoEmUso(tabela, chave){
    let updates = {};
    updates[tabela + '/' + chave + '/emUso'] = true;
    updates[tabela + '/' + chave + '/volumeComprado'] = 500;
    updates[tabela + '/' + chave + '/saida'] = 1;
    updates[tabela + '/' + chave + '/usuarioQueEstaInteragindo'] = localStorage.getItem('token');
    database.ref().update(updates);     
}

function atualizarAtributoNaoUsado(tabela, chave){
    let updates = {};
    updates[tabela + '/' + chave + '/emUso'] = false;
    updates[tabela + '/' + chave + '/torneiraLigada'] = false;
    updates[tabela + '/' + chave + '/usuarioQueEstaInteragindo'] = '';
    database.ref().update(updates);     
}

function observarBanco(tabela){
    return dbRef.child(tabela);
}

function obterDadosDoBanco(tabela, chave){
    return dbRef.child(tabela +'/' + chave);
}  


