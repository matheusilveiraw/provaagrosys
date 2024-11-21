function validarDadosParaCadastro() {
    // Coletando os valores dos inputs

    let telefone = document.getElementById('telefone').value;
    let celular = document.getElementById('celular').value;
    let cep = document.getElementById('cep').value;
    let rua = document.getElementById('rua').value;
    let bairro = document.getElementById('bairro').value;
    let cidade = document.getElementById('cidade').value;
    let estado = document.getElementById('estado').value;
    let pais = document.getElementById('pais').value;

    validarUsuarioCadastro();
    validarSenhaCadastro();
    validarConfirmaSenhaCadastro();
    validarNomeCompleto();
    validarCPF();
    validarDataNascimento()

    console.log(dataNascimento);

    // if (senha === "") {
    //     erros.push("O campo Senha é obrigatório.");
    // } else if (senha !== confirmeSenha) {
    //     erros.push("As senhas não coincidem.");
    // }

    // if (cpf === "") {
    //     erros.push("O campo CPF é obrigatório.");
    // }

    // if (telefone === "") {
    //     erros.push("O campo Telefone é obrigatório.");
    // }

    // if (celular === "") {
    //     erros.push("O campo Celular é obrigatório.");
    // }

    // if (cep === "") {
    //     erros.push("O campo CEP é obrigatório.");
    // }

    // if (rua === "") {
    //     erros.push("O campo Rua é obrigatório.");
    // }

    // if (bairro === "") {
    //     erros.push("O campo Bairro é obrigatório.");
    // }

    // if (cidade === "") {
    //     erros.push("O campo Cidade é obrigatório.");
    // }

    // if (estado === "") {
    //     erros.push("O campo Estado é obrigatório.");
    // }

    // if (pais === "") {
    //     erros.push("O campo País é obrigatório.");
    // }

    // Exibir erros na tela

}

function validarUsuarioCadastro() {
    let usuario = document.getElementById('usuario').value;
    let errosUsuario = [];
    const caracteresEspeciais = /[^a-zA-Z0-9 ]/g; //para verificar se tem caracteres especiais

    document.getElementById('errosUsuario').innerHTML = "";

    if (usuario === "") {
        errosUsuario.push("O campo Usuário é obrigatório.");
    }

    if (usuario.match(caracteresEspeciais)) {
        errosUsuario.push("Não é permitido caracteres especiais no usuário.");
    }

    if (errosUsuario.length > 0) {
        document.getElementById('errosUsuario').innerHTML = errosUsuario.join("<br>");
    }
} 

function validarSenhaCadastro() {
    let senha = document.getElementById('senha').value;
    let errosSenha = [];

    document.getElementById('errosSenha').innerHTML = "";

    if (senha.length <= 6) {
        errosSenha.push("A senha deve ter mais de 6 caracteres");
    }

    if (errosSenha.length > 0) {
        document.getElementById('errosSenha').innerHTML = errosSenha.join("<br>");
    } 
} 

function validarConfirmaSenhaCadastro() {
    let senha = document.getElementById('senha').value;
    let confirmaSenha = document.getElementById('confirmaSenha').value;

    let errosConfirmaSenha = [];

    document.getElementById('errosConfirmaSenha').innerHTML = "";

    if (senha != confirmaSenha) {
        errosConfirmaSenha.push("As senhas são diferentes!");
    }

    if (errosConfirmaSenha.length > 0) {
        document.getElementById('errosConfirmaSenha').innerHTML = errosConfirmaSenha.join("<br>");
    } 
} 

function validarNomeCompleto() {
    let nomeCompleto = document.getElementById('nomeCompleto').value;
    let errosNomeCompleto = [];
    const apenasLetras = /[^a-zA-Z ]/g;

    document.getElementById('errosNomeCompleto').innerHTML = "";

    if (nomeCompleto === "") {
        errosNomeCompleto.push("O campo nome completo é obrigatório.");
    }

    if (nomeCompleto.match(apenasLetras)) {
        errosNomeCompleto.push("Não é permitido caracteres especiais e números no campo nome completo.");
    }

    if (errosNomeCompleto.length > 0) {
        document.getElementById('errosNomeCompleto').innerHTML = errosNomeCompleto.join("<br>");
    }
} 

function validarCPF() {
    let cpf = document.getElementById('cpf').value;
    let errosCpf = [];
    const apenasNumeros = /[^0-9 ]/g; 

    document.getElementById('errosCpf').innerHTML = "";

    if (cpf === "") {
        errosCpf.push("O campo CPF é obrigatório.");
    }

    if (cpf.match(apenasNumeros)) {
        errosCpf.push("Não é permitido caracteres especiais e letras no campo CPF.");
    }

    if (cpf.length != 11) {
        errosCpf.push("CPF deve ter 11 caracteres!");
    }

    if (errosCpf.length > 0) {
        document.getElementById('errosCpf').innerHTML = errosCpf.join("<br>");
    }
} 

function validarDataNascimento() {
    let dataNascimento = document.getElementById('dataNascimento').value;
    let errosDataNascimento = [];

    document.getElementById('errosDataNascimento').innerHTML = "";

    if (dataNascimento === "") {
        errosDataNascimento.push("É necessário preencher dia, mês e ano!");
    }

    if (errosDataNascimento.length > 0) {
        document.getElementById('errosDataNascimento').innerHTML = errosDataNascimento.join("<br>");
    }
} 

function validarTelefone() {
    let dataNascimento = document.getElementById('dataNascimento').value;
    let errosDataNascimento = [];

    document.getElementById('errosDataNascimento').innerHTML = "";

    if (dataNascimento === "") {
        errosDataNascimento.push("É necessário preencher dia, mês e ano!");
    }

    if (errosDataNascimento.length > 0) {
        document.getElementById('errosDataNascimento').innerHTML = errosDataNascimento.join("<br>");
    }
} 