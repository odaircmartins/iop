const campoNome = document.getElementById('nome');
const campoEmail = document.getElementById('email');
const campoCPF = document.getElementById('cpf');
const botaoSalvar = document.getElementById('salvar');
const mensagem = document.getElementById('mensagem');

botaoSalvar.addEventListener('click', salvarCredenciais);

function salvarCredenciais() {
    let mensagemErro = '';
    let nomeEhValido = false;
    let emailEhValido = false;
    let cpfEhValido = false;

    nomeEhValido = validarNome(campoNome.value);
    emailEhValido = validarEmail(campoEmail);
    cpfEhValido = validarCPF(campoCPF.value);

    if (nomeEhValido && emailEhValido && cpfEhValido) {
        localStorage.setItem('nome', campoNome.value);
        localStorage.setItem('email', campoEmail.value);
        localStorage.setItem('cpf', campoCPF.value);
        localStorage.setItem('token', '');
        localStorage.setItem('idRevendedor', '');
        localStorage.setItem('valorDaUltimaCompra','R$ 0,00');

        mensagemErro = "";
        PAGINAS.credenciais.pagina.classList.remove("active");
        PAGINAS.comprar.pagina.classList.add("active");
    } else {
        mensagemErro = 'Revise '

        if (!nomeEhValido && emailEhValido && cpfEhValido) {
            mensagemErro += "nome";
        }

        if (!nomeEhValido && !emailEhValido && cpfEhValido) {
            mensagemErro += "nome e e-mail.";
        }

        if (!nomeEhValido && emailEhValido && !cpfEhValido) {
            mensagemErro += "nome e CPF.";
        }

        if (nomeEhValido && !emailEhValido && cpfEhValido) {
            mensagemErro += "e-mail.";
        }

        if (nomeEhValido && !emailEhValido && !cpfEhValido) {
            mensagemErro += "e-mail e CPF.";
        }

        if (nomeEhValido && emailEhValido && !cpfEhValido) {
            mensagemErro += "CPF.";
        }

        if (!nomeEhValido && !emailEhValido && !cpfEhValido) {
            mensagemErro += "nome, e-mail e CPF.";
        }        
    }

    mensagem.innerText = mensagemErro 
}

function validarNome(nome) {
    if (nome.length <= 1) {
        return false;
    } else {
        return true;
    }
}

function validarEmail(email) {
    usuario = email.value.substring(0, email.value.indexOf("@"));
    dominio = email.value.substring(email.value.indexOf("@") + 1, email.value.length);

    if ((usuario.length >= 1) &&
        (dominio.length >= 3) &&
        (usuario.search("@") == -1) &&
        (dominio.search("@") == -1) &&
        (usuario.search(" ") == -1) &&
        (dominio.search(" ") == -1) &&
        (dominio.search(".") != -1) &&
        (dominio.indexOf(".") >= 1) &&
        (dominio.lastIndexOf(".") < dominio.length - 1)) {
        return true;
    }
    else {
        return false;
    }
}

function validarCPF(cpf) {	
	cpf = cpf.replace(/[^\d]+/g,'');	
	if(cpf == '') return false;	
	// Elimina CPFs invalidos conhecidos	
	if (cpf.length != 11 || 
		cpf == "00000000000" || 
		cpf == "11111111111" || 
		cpf == "22222222222" || 
		cpf == "33333333333" || 
		cpf == "44444444444" || 
		cpf == "55555555555" || 
		cpf == "66666666666" || 
		cpf == "77777777777" || 
		cpf == "88888888888" || 
		cpf == "99999999999")
			return false;		
	// Valida 1o digito	
	add = 0;	
	for (i=0; i < 9; i ++)		
		add += parseInt(cpf.charAt(i)) * (10 - i);	
		rev = 11 - (add % 11);	
		if (rev == 10 || rev == 11)		
			rev = 0;	
		if (rev != parseInt(cpf.charAt(9)))		
			return false;		
	// Valida 2o digito	
	add = 0;	
	for (i = 0; i < 10; i ++)		
		add += parseInt(cpf.charAt(i)) * (11 - i);	
	rev = 11 - (add % 11);	
	if (rev == 10 || rev == 11)	
		rev = 0;	
	if (rev != parseInt(cpf.charAt(10)))
		return false;		
	return true;   
}

function mascaraCPF(cpf) {
    if (mascaraInteiro(cpf) == false) {
        event.returnValue = false;
    }
    return formataCampo(cpf, '000.000.000-00', event);
}

function mascaraInteiro() {
    if (event.keyCode < 48 || event.keyCode > 57) {
        event.returnValue = false;
        return false;
    }
    return true;
}

// Formata de maneira genérica os campos
function formataCampo(campo, Mascara, evento) {
    var boleanoMascara;

    var Digitato = evento.keyCode;
    exp = /\-|\.|\/|\(|\)| /g
    campoSoNumeros = campo.value.toString().replace(exp, "");

    var posicaoCampo = 0;
    var NovoValorCampo = "";
    var TamanhoMascara = campoSoNumeros.length;;

    if (Digitato != 8) { // backspace 
        for (i = 0; i <= TamanhoMascara; i++) {
            boleanoMascara = ((Mascara.charAt(i) == "-") || (Mascara.charAt(i) == ".")
                || (Mascara.charAt(i) == "/"))
            boleanoMascara = boleanoMascara || ((Mascara.charAt(i) == "(")
                || (Mascara.charAt(i) == ")") || (Mascara.charAt(i) == " "))
            if (boleanoMascara) {
                NovoValorCampo += Mascara.charAt(i);
                TamanhoMascara++;
            } else {
                NovoValorCampo += campoSoNumeros.charAt(posicaoCampo);
                posicaoCampo++;
            }
        }
        campo.value = NovoValorCampo;
        return true;
    } else {
        return true;
    }
}