criarBanco();


function cadastrarClienteBanco() { 

}


function validarDadosCliente() { 
    erros = 0;

    erros += validarNomeCompleto();
    erros += validarCPF();
    erros += validarDataNascimento();
    erros += validarTelefone();
    erros += validarCelular(); 

    if(erros == 0) { 
        console.log('tudo certo para o cadastro');
    } else { 
        console.log('corrija os erros');
    }
} 

function criarBanco() { 
    alasql('CREATE LOCALSTORAGE DATABASE IF NOT EXISTS argosqldb');
    alasql('ATTACH LOCALSTORAGE DATABASE argosqldb AS argosql');
    alasql('USE argosql');
    alasql("CREATE TABLE IF NOT EXISTS cadastros_usuarios (nome_usuario STRING, senha STRING)");

    if (alasql.tables.cadastros_usuarios) {
        alasql("SELECT * FROM cadastros_usuarios");
    }

    alasql("CREATE TABLE IF NOT EXISTS cadastros_clientes (id INT, nome_completo STRING, senha STRING, data_nascimento DATE, telefone BIGINT, celular BIGINT, cpf BIGINT)");

    if (alasql.tables.cadastros_clientes) {
        alasql("SELECT * FROM cadastros_clientes");
    }

    alasql("CREATE TABLE IF NOT EXISTS cadastros_enderecos (id, number, cep number, rua STRING, bairro string, cidade string, estado string, estado string, pais string, cliente number)");

    if (alasql.tables.cadastros_enderecos) {
        alasql("SELECT * FROM cadastros_enderecos");
    }

    // alasql("INSERT INTO cadastros_clientes VALUES (?, ?, ?, ?, ?, ?, ?)", [1, "João Silva", "senha123", "1990-05-15", 1123456789, 11987654321, 12345678901]);
    // alasql("INSERT INTO cadastros_clientes VALUES (?, ?, ?, ?, ?, ?, ?)", [2, "Maria Oliveira", "senha456", "1985-08-22", 2129876543, 21912345678, 23456789012]);
    // alasql("INSERT INTO cadastros_clientes VALUES (?, ?, ?, ?, ?, ?, ?)", [3, "Carlos Souza", "senha789", "2000-01-10", 3139876543, 31987654321, 34567890123]);
    // alasql("INSERT INTO cadastros_clientes VALUES (?, ?, ?, ?, ?, ?, ?)", [4, "Ana Santos", "senha321", "1995-12-25", 4187654321, 41912345678, 45678901234]);
    
}

function logar() { 
    let usuario = document.getElementById('usuarioLogin').value;
    let senha = document.getElementById('senhaLogin').value;
    errosSenha = [];
    errosUsuario = [];

    if(usuario == "") { 
        errosUsuario.push("O campo usuário é obrigatório.");
    }

    if(senha == "") { 
        errosSenha.push("O campo senha é obrigatório.");
    }

    let buscaUsuarioBD = alasql("SELECT nome_usuario FROM cadastros_usuarios WHERE nome_usuario = ?", [usuario]);

    if(buscaUsuarioBD.length > 0) { 
        if(alasql("SELECT senha FROM cadastros_usuarios WHERE nome_usuario = ?", [usuario])[0].senha == senha) { 
            window.location.href = "acesso_sistema.html";
        } else {
            errosSenha.push("A senha está incorreta!");
        }
    } else { 
        errosUsuario.push("A senha está incorreta!");
    }

    if(errosSenha.length + errosUsuario.length != 0) {
        document.getElementById('erroUsuarioLogin').innerHTML = errosUsuario.join("<br>");
        document.getElementById('erroUsuarioSenha').innerHTML = errosSenha.join("<br>");
    }
}

function validarDadosParaCadastro() {
    let erros = 0;

    erros += validarUsuarioCadastro();
    erros += validarSenhaCadastro();
    erros += validarConfirmaSenhaCadastro();
    console.log('erros = ' + erros);

    if (erros === 0) { 
        cadastrarUsuario();
    }
}

function cadastrarUsuario() {
    let usuario = document.getElementById('usuario').value;
    let senha = document.getElementById('senha').value;

    if (alasql.tables.cadastros_usuarios) {
        alasql("INSERT INTO cadastros_usuarios VALUES (?, ?)", [usuario, senha]);

        console.log(alasql.tables.cadastros_usuarios.data); 

        alert('Cadastro realizado com sucesso!');
    } else {
        console.error("Tabela 'cadastros_usuarios' não encontrada");
    }
}

function validarUsuarioCadastro() {
    let usuario = document.getElementById('usuario').value;
    let errosUsuario = [];
    const caracteresEspeciais = /[^a-zA-Z0-9 ]/g; //para verificar se tem caracteres especiais
    const buscaUsuarioBD = alasql("SELECT * FROM cadastros_usuarios WHERE nome_usuario = ?", [usuario]);

    document.getElementById('errosUsuario').innerHTML = "";

    if (buscaUsuarioBD.length === 0) {
        console.log("O usuário não foi encontrado no banco de dados.");
    } else {
        console.log();
        errosUsuario.push("Esse usuário já está sendo usado!");
    }

    if (usuario === "") {
        errosUsuario.push("O campo Usuário é obrigatório.");
    }

    if (usuario.match(caracteresEspeciais)) {
        errosUsuario.push("Não é permitido caracteres especiais no usuário.");
    }

    if (errosUsuario.length > 0) {
        document.getElementById('errosUsuario').innerHTML = errosUsuario.join("<br>");
        return 1;
    }
    
    return 0;
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
        return 1;
    } 
    return 0;
} 

function validarConfirmaSenhaCadastro() {
    let senha = document.getElementById('senha').value;
    let confirmaSenha = document.getElementById('confirmaSenha').value;

    let errosConfirmaSenha = [];

    document.getElementById('errosConfirmaSenha').innerHTML = "";

    if(confirmaSenha == "") { 
        errosConfirmaSenha.push("Esse campo deve ser preenchido!");
    }

    if (senha != confirmaSenha) {
        errosConfirmaSenha.push("As senhas são diferentes!");
    }

    if (errosConfirmaSenha.length > 0) {
        document.getElementById('errosConfirmaSenha').innerHTML = errosConfirmaSenha.join("<br>");
        return 1;
    } 
    return 0;
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
        return 1;
    }

    return 0;
} 

function validarCPF() {
    let cpf = document.getElementById('cpf').value;
    let errosCpf = [];
    const apenasNumeros = /[^0-9 ]/g; 
    const buscaCpfs = alasql("SELECT cpf FROM cadastros_clientes");

    document.getElementById('errosCpf').innerHTML = "";

    for (let index = 0; index < buscaCpfs.length; index++) {
        const element = buscaCpfs[index].cpf;

        if(element == cpf) { 
            errosCpf.push('Esse CPF já está cadastrado no sistema!');
        }
    }

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
        return 1;
    }

    return 0;
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
        return 1;
    }

    return 0;
} 

function validarTelefone() {
    let telefone = document.getElementById('telefone').value;
    let errosTelefone = [];
    const apenasNumeros = /[^0-9 ]/g; 

    document.getElementById('errosTelefone').innerHTML = "";

    if (telefone === "") {
        errosTelefone.push("O campo telefone é obrigátorio");
    }

    if (telefone.match(apenasNumeros)) {
        errosCpf.push("Não é permitido caracteres especiais e letras no campo telefone.");
    }

    if (telefone.length != 8) {
        errosTelefone.push("Telefone deve ter 8 caracteres!");
    }


    if (errosTelefone.length > 0) {
        document.getElementById('errosTelefone').innerHTML = errosTelefone.join("<br>"); 
        return 1;
    }

    return 0;
} 

function validarCelular() {
    let celular = document.getElementById('celular').value;
    let errosCelular = [];
    const apenasNumeros = /[^0-9 ]/g; 

    document.getElementById('errosCelular').innerHTML = "";

    if (celular === "") {
        errosCelular.push("O campo celular é obrigátorio");
    }

    if (celular.match(apenasNumeros)) {
        errosCpf.push("Não é permitido caracteres especiais e letras no campo celular.");
    }

    if (celular.length != 9) {
        errosCelular.push("Celular deve ter 9 caracteres!");
    }


    if (errosCelular.length > 0) {
        document.getElementById('errosCelular').innerHTML = errosCelular.join("<br>");
        return 1;
    }

    return 0;
} 

function validarCep() {
    let cep = document.getElementById('cep').value;
    let errosCep = [];
    const apenasNumeros = /[^0-9 ]/g; 

    document.getElementById('errosCep').innerHTML = "";

    if (cep === "") {
        errosCep.push("O campo CEP é obrigátorio");
    }

    if (cep.match(apenasNumeros)) {
        errosCpf.push("Não é permitido caracteres especiais e letras no campo CEP.");
    }

    if (cep.length != 8) {
        errosCep.push("cep deve ter 8 caracteres!");
    }


    if (errosCep.length > 0) {
        document.getElementById('errosCep').innerHTML = errosCep.join("<br>");
    }
} 

function validarRua() {
    let rua = document.getElementById('rua').value;
    let errosRua = [];

    document.getElementById('errosRua').innerHTML = "";

    if (rua === "") {
        errosRua.push("O campo rua é obrigatório.");
    }

    if (errosRua.length > 0) {
        document.getElementById('errosRua').innerHTML = errosRua.join("<br>");
    }
} 

function validarBairro() {
    let bairro = document.getElementById('bairro').value;
    let errosBairro = [];

    document.getElementById('errosBairro').innerHTML = "";

    if (bairro === "") {
        errosBairro.push("O campo bairro é obrigatório.");
    }

    if (errosBairro.length > 0) {
        document.getElementById('errosBairro').innerHTML = errosBairro.join("<br>");
    }
} 

function validarCidade() {
    let cidade = document.getElementById('cidade').value;
    let errosCidade = [];

    document.getElementById('errosCidade').innerHTML = "";

    if (cidade === "") {
        errosCidade.push("O campo cidade é obrigatório.");
    }

    if (errosCidade.length > 0) {
        document.getElementById('errosCidade').innerHTML = errosCidade.join("<br>");
    }
} 

function validarEstado() {
    let estado = document.getElementById('estado').value;
    let errosEstado = [];

    document.getElementById('errosEstado').innerHTML = "";

    if (estado === "") {
        errosEstado.push("O campo estado é obrigatório.");
    }

    if (errosEstado.length > 0) {
        document.getElementById('errosEstado').innerHTML = errosEstado.join("<br>");
    }
} 

function validarPais() {
    let pais = document.getElementById('pais').value;
    let errosPais = [];

    document.getElementById('errosPais').innerHTML = "";

    if (pais === "") {
        errosPais.push("O campo pais é obrigatório.");
    }

    if (errosPais.length > 0) {
        document.getElementById('errosPais').innerHTML = errosPais.join("<br>");
    }
} 