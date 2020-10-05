// Define as referências do documento HTML
PAGINAS = {};

// Página principal
PAGINAS.principal = {};
PAGINAS.principal.pagina = document.querySelector("#boas-vindas");

// Página 'credenciais'
PAGINAS.credenciais = {};
PAGINAS.credenciais.pagina = document.querySelector("#credenciais");
PAGINAS.credenciais.conteudo = document.querySelector("#credenciaisStations");

// Página 'comprar'
PAGINAS.comprar = {};
PAGINAS.comprar.pagina = document.querySelector("#comprar");

// Página não encontrada - Erro 404
PAGINAS.pagina404 = {};
PAGINAS.pagina404.pagina = document.querySelector("#pagina404");
PAGINAS.pagina404.erro = document.querySelector("#pagina404-erro");

// Código para rodar função customizada de cada página ao carregar
funcoesDaPagina = {};

// Código customizado que roda quando há página não encontrada
funcoesDaPagina.pagina404 = function () {
    PAGINAS.pagina404.erro.innerHTML = `Page ${location.hash.substr(1)} not found!`;
};

funcoesDaPagina.comprar = function () {
    verificarSeEstaCadastrado();
};

function verificarSeEstaCadastrado() {
    let credenciais = localStorage.getItem('nome');

    if (credenciais === null) {
        PAGINAS.comprar.pagina.classList.remove("active");
        PAGINAS.credenciais.pagina.classList.add("active");
    } else {
        if (localStorage.getItem('idRevendedor') != '') {
            let tokenUsuario = localStorage.getItem('token');
            let tabelaRevendedores = "Revendedores/" + localStorage.getItem('idRevendedor') + "/UsuariosQueCompraram";
            let referencia = obterDadosDoBanco(tabelaRevendedores, tokenUsuario);

            referencia.once("value", snap => {
                try {
                    if (snap.val().statusDoPagamento === 'quitado') {
                        localStorage.setItem('valorDaUltimaCompra', formatarMoeda(0.00));
                        localStorage.setItem('valorTotalComprado', formatarMoeda(0.00));
                        localStorage.setItem('volumeTotalComprado', formatarEmLitros(0));

                        rotuloValorTotalComprado.innerHTML = formatarMoeda(0.0);
                        rotuloVolumeTotalComprado.innerHTML = formatarEmLitros(0.0);
                    }
                } catch {
                    localStorage.setItem('valorDaUltimaCompra', formatarMoeda(0.00));
                    localStorage.setItem('valorTotalComprado', formatarMoeda(0.00));
                    localStorage.setItem('volumeTotalComprado', formatarEmLitros(0));
                    localStorage.setItem('idRevendedor', '');
                    localStorage.setItem('token', '');
                }
            });
        }
    }
}

var path;

// Navegação
function navigate() {
    // Acessa a URL
    path = location.hash
        .substr(1)
        .toLowerCase()
        .split("/");

    // Procura a página que deve ser mostrada
    var currentPage = path[0];
    if (!PAGINAS.hasOwnProperty(currentPage)) {
        if (path[0] === "") {
            currentPage = "principal";
        } else {
            currentPage = "pagina404";
        }
    }

    // Esconde a página que estava ativa
    for (var pagina in PAGINAS) {
        if (PAGINAS.hasOwnProperty(pagina)) {
            PAGINAS[pagina].pagina.classList.remove("active");
        }
    }

    // Mostra a página e roda os scripts customizados
    PAGINAS[currentPage].pagina.classList.add("active");

    //Roda a página caso exista
    if (funcoesDaPagina.hasOwnProperty(currentPage)) {
        funcoesDaPagina[currentPage]();
    }
}

// Carrega a primeira navegação da página
navigate();
window.onhashchange = navigate;