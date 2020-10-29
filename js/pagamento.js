/****************************************************************************************/
/****************************************************************************************/
/***                                                                                  ***/
/***             Integração de Pagamentos via cartão de crédito com a JUNO            ***/
/***                                   27/10/20                                       ***/
/****************************************************************************************/
/****************************************************************************************/

/************************************************/
/* Para criar conta na base oficial de produção */
/************************************************/

// 1º – Baixar Google Authenticator no smartphone
// 2º - Acessar juno.com.br
// 3º – Criar conta da empresa em "Abra sua conta"
// 4º – Ir no menu “integração” e selecionar “criação de credencial” 
// 5º - Criar client_ID e Client_Secret
// 6º – Ir em  “Token Privado” e selecionar "Gerar token"
// 7º – Ir em  “Token Público” e selecionar "Gerar token"


/************************************************/
/* Para criar conta na base de testes sandbox   */
/************************************************/

// 1º – Repetir todos os passos da base de produção, porém acessando sandbox.juno.com.br/


/************************************************/
/* Integração com a Versão 2.0 da JUNO          */
/************************************************/

// Documentação disponível em https://dev.juno.com.br/api/v2#section

let operarEmAmbienteDeProducao = false;
let clienteId = '3KsOCTWWBb6iss7g';
let clientSecret = 't8Z~#MH6N,.wK}RK5gD$SK@%!1C]E!L#';
let tokenPrivado = '976F3BD2BAF184E2B745358964C111FA9B15A21C364850E9054CDC26CB41B627';
let tokenPublico = 'CA049C2103DC72B52B4405C516FA4C2007D811765F2FA1607D241EF4B58CF959';

// Chamar o serviço de autorização passando as credenciais criadas para obter um token
// de autorização para a API de Integração. O token de autorização (access_token) gerado 
// no processo indicado acima pode ser utilizado por uma quantidade de tempo limitada de
// acordo ao ambiente que estiver sendo utilizado, o que é indicado pelo endpoint de 
// cada um. Depois de sua expiração, um novo token deve ser requisitado. O tempo de 
// expiração é diferente para cada ambiente:
// Sandbox	86400 segundos (24 horas)
// Produção	3600 segundos (1 hora)

let obterCredenciaisBasicasEmBase64 = function () {
  return btoa(clienteId + ':' + clientSecret);
}

let obterAutorizacao = function () {
  let endereco = 'https://sandbox.boletobancario.com/authorization-server/oauth/token'

  if (operarEmAmbienteDeProducao) {
    endereco = 'https://api.juno.com.br/authorization-server/oauth/token'
  }

  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Basic M0tzT0NUV1dCYjZpc3M3Zzp0OFp+I01INk4sLndLfVJLNWdEJFNLQCUhMUNdRSFMIw==");
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

  var urlencoded = new URLSearchParams();
  urlencoded.append("grant_type", "client_credentials");

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: urlencoded,
    redirect: 'follow'
  };

  fetch("https://sandbox.boletobancario.com/authorization-server/oauth/token", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
}



// let headers = new Headers();

// headers.append('Authorization', 'Basic ' + credenciaisBasicasEmBase64);

// fetch(url, {method:'GET',
//     headers: headers,
//     //credentials: 'user:passwd'
//    })
// .then(response => response.json())
// .then(json => console.log(json));
// //.done();

// function parseJSON(response) {
// return response.json()
// }

//https://imasters.com.br/desenvolvimento/como-funciona-o-protocolo-oauth-2-0
// curl -X POST https://sandbox.boletobancario.com/authorization-server/oauth/token
//   -H 'Content-Type: application/x-www-form-urlencoded' 
//   -H 'Authorization: Basic M0tzT0NUV1dCYjZpc3M3Zzp0OFp+I01INk4sLndLfVJLNWdEJFNLQCUhMUNdRSFMIw=='
//   -d 'grant_type: client_credentials'
