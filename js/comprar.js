//Mapeia elementos da tela
const botaoComandarChopeira = document.getElementById('comandar-chopeira');
const rotuloUltimaCompra = document.querySelector('.ultima-compra');
const rotuloValorTotalComprado = document.querySelector('.consumo-valor-comprar');
const rotuloVolumeTotalComprado = document.querySelector('.consumo-litros-comprar-span');

//Cria os elementos para manipular a câmera e ler o qrcode
let video = document.createElement("video");
let elementoCanvas = document.getElementById("canvas");
let canvas = elementoCanvas.getContext("2d");
let qrcodeCapturado = false;

//Seta as imagens
let imagemOcupado = "url('./img/ocupado.png')";
let imagemCancelado = "url('./img/cancelado.png')";
let imagemUltimaCompra = "url('./img/ultima-compra.png')";
let imagemComprando = "url('./img/comprando.png')";

//Seta as tabelas que são utilizadas
let tabelaChopeiras = "Chopeiras";

//Formatar a compra em reais
const formatarMoeda = (valor) => {
	return valor.toLocaleString('pt-BR', {minimumFractionDigits: 2, style: 'currency', currency: 'BRL' })
}

//Formatar a compra em litros
const formatarEmLitros = (valorSemFormatacao) => {
    let valor = (valorSemFormatacao)
    valor = valor / 1000
    valor = valor.toFixed(1)
    
    return valor + " litros"
}

//Desativa a câmera
const desativarCamera = () => {
    qrcodeCapturado = true;
    elementoCanvas.classList.remove('active');
    rotuloUltimaCompra.classList.add('active');
}

//Ativa a câmera
const ativarCamera = () => {
    qrcodeCapturado = false;
    elementoCanvas.classList.add('active');
    rotuloUltimaCompra.classList.remove('active');
}

//Monitora a câmera ativada até a leitura do qrcode
const momento = () => {
    if (video.readyState === video.HAVE_ENOUGH_DATA && !qrcodeCapturado) {
        elementoCanvas.hidden = false;
        elementoCanvas.height = video.videoHeight;
        elementoCanvas.width = video.videoWidth;
        canvas.drawImage(video, 0, 0, elementoCanvas.width, elementoCanvas.height);
        var imageData = canvas.getImageData(0, 0, elementoCanvas.width, elementoCanvas.height);
        var code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
        });
        
        if (code) {
            qrcodeCapturado = true;
            iniciarCompra(code.data);
        }
    }
    requestAnimationFrame(momento);
}

//Exibe mensagem da última compra
const exibirMensagemUltimaCompra = () => {
    setTimeout(function(){ 
        rotuloUltimaCompra.innerHTML = "Última compra " + localStorage.getItem('valorDaUltimaCompra');
        rotuloUltimaCompra.style.backgroundImage = "url('./img/ultima-compra.png')";
        botaoComandarChopeira.innerText = 'Comprar';
        botaoComandarChopeira.hidden = false;
    }, 3000);
}

//Exibe mensagem de ação
const exibirMensagem = (imagem, mensagem, exibirBotao, querExibirMensagemUltimaCompra) => {
    rotuloUltimaCompra.style.backgroundImage = imagem;
    rotuloUltimaCompra.innerHTML = mensagem;

    if(exibirBotao){
        botaoComandarChopeira.classList.remove("ocultar");        
    } else {
        botaoComandarChopeira.classList.add("ocultar");
    }

    if(querExibirMensagemUltimaCompra){
        exibirMensagemUltimaCompra();
    }
}

//Reseta os dados da chopeira deixando-a apta para nova compra
const prepararChopeiraParaNovaCompra = (idChopeira) => {
    atualizarAtributoNaoUsado(tabelaChopeiras, idChopeira);
}

//Define ação do botão para comprar ou cancelar
const comandar = () => {
    if (botaoComandarChopeira.innerText === "Cancelar") {
        rotuloUltimaCompra.innerHTML = "Última compra " + localStorage.getItem('valorDaUltimaCompra');
        rotuloUltimaCompra.style.backgroundImage = "url('./img/ultima-compra.png')";
        botaoComandarChopeira.innerText = "Comprar";
        desativarCamera();
        return
    }

    if (botaoComandarChopeira.innerText === "Comprar") {
        botaoComandarChopeira.innerText = "Cancelar";
        ativarCamera();
        return
    }
}

//Parametros de quantas vezes a chopeira será monitorada durante a compra e em qual intervalo de tempo
let verificacoes = 12;
let intervaloEntreVerificacoes = 5000;

//Mostra a venda em andamento
const mostrarVendaEmAndamento = (idChopeira) => {   
    exibirMensagem(imagemComprando,"Pode encher o copo",false,false);

    let monitorarChopeiraEmUso = setInterval(verificarAndamentoDaCompra, intervaloEntreVerificacoes); 
  
    function verificarAndamentoDaCompra() {     

        if (verificacoes === 0 ){
            prepararChopeiraParaNovaCompra(idChopeira);                      
            exibirMensagem(imagemCancelado, "Conexão foi perdida.", true, true); 
            finalizarMonitoramento();
            verificacoes = 12;
            return;
        }
    
        //Verifica se a chopeira retornou com volume comprado
        let referenciaChopeiras = obterDadosDoBanco(tabelaChopeiras, idChopeira);

        referenciaChopeiras.once("value", snap => { 
            let idRevendedor = snap.val().idRevendedor;
            let modelo = snap.val().modelo;
            let volumeComprado = parseFloat(snap.val().volumeComprado);
            let torneiraLigada = snap.val().torneiraLigada;
            let emUso = snap.val().emUso;
            let precoPorLitro = parseFloat(snap.val().precoPorLitro);
            let tokenUsuario = localStorage.getItem('token');

            //Cancela por inatividade se não ligar a torneira em até 10 segundos  
            if(emUso === true && torneiraLigada === false && verificacoes >= 10) {    
                prepararChopeiraParaNovaCompra(idChopeira);                      
                exibirMensagem(imagemCancelado, "Cancelado por inatividade", true, true);   
                finalizarMonitoramento();        
                verificacoes = 12;
                return
            } 

            // Incrementa a compra ao total já comprado pelo usuário
            if(emUso === false && torneiraLigada === false && volumeComprado > 0) {   
                let tabelaRevendedores = "Revendedores/" + idRevendedor + "/UsuariosQueCompraram";
                let referenciaComprasDoUsuario = obterDadosDoBanco(tabelaRevendedores, tokenUsuario);
                
                referenciaComprasDoUsuario.once("value", snap2 => { 
                    let momentoDaCompra = new Date();
                    let quantidadeTotal = parseFloat(snap2.val().quantidadeTotal);
                    let quantidadeTotalAtualizada = quantidadeTotal + volumeComprado;
                    let valorTotalAtualizado =  parseFloat(((quantidadeTotalAtualizada/1000) * precoPorLitro).toFixed(2));
                    let valorDaUltimaCompra =  parseFloat(((volumeComprado/1000) * precoPorLitro).toFixed(2));

                    let resumoDasCompras = {
                        nome: localStorage.getItem('nome'),
                        email: localStorage.getItem('email'),
                        cpf: localStorage.getItem('cpf'),
                        data: momentoDaCompra,
                        quantidadeTotal: quantidadeTotalAtualizada,                        
                        valorTotal: valorTotalAtualizado,
                        statusDoPagamento: 'pendente',
                        valorDaUltimaCompra: valorDaUltimaCompra
                    }

                    localStorage.setItem('valorDaUltimaCompra', formatarMoeda(valorDaUltimaCompra));
                    localStorage.setItem('valorTotalComprado', formatarMoeda(valorTotalAtualizado));
                    localStorage.setItem('volumeTotalComprado', formatarEmLitros(quantidadeTotalAtualizada));

                    rotuloValorTotalComprado.innerHTML =  formatarMoeda(valorTotalAtualizado);
                    rotuloVolumeTotalComprado.innerHTML = formatarEmLitros(quantidadeTotalAtualizada);

                    gravarNoBanco(tabelaRevendedores, tokenUsuario, resumoDasCompras);

                    //Registra histórico de compras
                    let tabelaCompras = "Compras";

                    let registroDeCompra = {
                        nome: localStorage.getItem('nome'),
                        email: localStorage.getItem('email'),
                        cpf: localStorage.getItem('cpf'),
                        data: momentoDaCompra,
                        quantidade: volumeComprado,                        
                        valor: valorDaUltimaCompra,
                        idChopeira: idChopeira,
                        idRevendedor: idRevendedor,
                        tokenDoUsuarioNoDiaDaCompra: tokenUsuario
                    }
                    gravarNoBanco(tabelaCompras, '', registroDeCompra);
                    prepararChopeiraParaNovaCompra(idChopeira, idRevendedor, modelo, precoPorLitro);
                    exibirMensagem(imagemUltimaCompra, "Compra realizada com sucesso", true, true);
                    finalizarMonitoramento();
                    verificacoes = 12;
                    return;
                });
            }       
        })

        verificacoes--;
        console.log(verificacoes + " verificações restantes");
    } 
    
    function finalizarMonitoramento() {
        clearInterval(monitorarChopeiraEmUso);
    }
};

//Inicia o processo de compra
const iniciarCompra = (idChopeira) =>{
    let referencia = obterDadosDoBanco(tabelaChopeiras, idChopeira);

    referencia.once("value", snap => {
        //Verifica se a chopeira está disponível para uso
        if(snap.val().emUso === true) {
            desativarCamera();
            exibirMensagem(imagemOcupado, "Chopeira ocupada", true, true);
            return;
        } 

        //Se o idRevendedor está vazio significa que é a primeira compra neste evento        
        if(localStorage.getItem('idRevendedor') != snap.val().idRevendedor) {
            let dadosDaPrimeiraCompra = {
                nome: localStorage.getItem('nome'),
                email: localStorage.getItem('email'),
                cpf: localStorage.getItem('cpf'),
                data: new Date(),
                quantidadeTotal: 0,
                statusDoPagamento: 'pendente',
                valorTotal: 0,
                valorDaUltimaCompra: 0
            }     

            let tabelaRevendedores = "Revendedores/" + snap.val().idRevendedor + "/UsuariosQueCompraram";
            let tokenDoUsuarioNoEvento = gravarNoBanco(tabelaRevendedores, '', dadosDaPrimeiraCompra);
            localStorage.setItem('token', tokenDoUsuarioNoEvento);
            localStorage.setItem('idRevendedor', snap.val().idRevendedor);
        }

        atualizarAtributoEmUso(tabelaChopeiras, idChopeira);
        desativarCamera();
        mostrarVendaEmAndamento(idChopeira);           
        return
    })
}

//Adiciona funcionalidade ao botão 'Comprar/Cancelar'
botaoComandarChopeira.addEventListener('click', comandar);

//Ativa a câmera do celular ao abrir o aplicativo
navigator.mediaDevices.getUserMedia(
    {video: {
        facingMode: "environment",
        width: { min: 150, ideal: 250, max: 350 },
        height: { min: 150, ideal: 250, max: 350 }}
    }).then(function (stream) {
        video.srcObject = stream;
        video.setAttribute("playsinline", true);
        video.play();
        requestAnimationFrame(momento);
    });
    
//Carrega as informações de compra ao carregar o aplicativo
if(localStorage.getItem('valorTotalComprado')){
    rotuloValorTotalComprado.innerHTML = localStorage.getItem('valorTotalComprado');
    rotuloVolumeTotalComprado.innerHTML = localStorage.getItem('volumeTotalComprado');
}