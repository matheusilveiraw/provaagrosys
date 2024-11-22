criarBanco();

document.addEventListener("DOMContentLoaded", function () {
  if (window.location.pathname.includes("cadastrar_enderecos.html")) {
    //esse código aqui serve pra chamar apenas se estiver na página descrita
    carregarClientes();
  }
});


function limparBanco() {
  alasql("DETACH DATABASE argosql");

  localStorage.clear();
}

function importarBanco() {
  const inputArquivoBanco = document.getElementById("arquivoBanco");
  const arquivo = inputArquivoBanco.files[0];

  if (!arquivo) {
    alert("Por favor, selecione um arquivo JSON.");
    return;
  }

  limparBanco(); //garante que o banco tá vazio
  criarBanco(); //cria tudo de novo sem dados aí da certo

  const leitor = new FileReader();

  leitor.onload = function (evento) {
    try {
      const dados = JSON.parse(evento.target.result);

      if (dados.cadastros_usuarios) {
        dados.cadastros_usuarios.forEach(usuario => {
          alasql("INSERT INTO cadastros_usuarios VALUES ?", [usuario]);
        });
      }

      if (dados.cadastros_clientes) {
        dados.cadastros_clientes.forEach(cliente => {
          alasql("INSERT INTO cadastros_clientes VALUES ?", [cliente]);
        });
      }

      if (dados.cadastros_enderecos) {
        dados.cadastros_enderecos.forEach(endereco => {
          alasql("INSERT INTO cadastros_enderecos VALUES ?", [endereco]);
        });
      }

      alert("Banco de dados importado com sucesso!");
    } catch (erro) {
      alert("Erro ao processar o arquivo JSON.");
    }
  };

  leitor.onerror = function () {
    alert("Erro ao ler o arquivo. Por favor, tente novamente.");
  };

  leitor.readAsText(arquivo);
}

function exportarBancoJSON() {
  const usuarios = alasql("SELECT * FROM cadastros_usuarios");
  const clientes = alasql("SELECT * FROM cadastros_clientes");
  const enderecos = alasql("SELECT * FROM cadastros_enderecos");

  const dadosBanco = {
    cadastros_usuarios: usuarios,
    cadastros_clientes: clientes,
    cadastros_enderecos: enderecos,
  };

  const dadosJSON = JSON.stringify(dadosBanco, null, 2);

  //a partir daqui faz o download
  const blob = new Blob([dadosJSON], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "banco_de_dados.json";
  link.click();
}

function validarIdentCliente() {
  let identCliente = document.getElementById("ident_cliente").value;
  let errosIdentCliente = [];

  document.getElementById("errosIdentCliente").innerHTML = "";

  if (identCliente === "") {
    errosIdentCliente.push("Você deve selecionar um dos clientes!");
    document.getElementById("errosIdentCliente").innerHTML =
      errosIdentCliente.join("<br>");
    return 1;
  }

  return 0;
}

function carregarClientes() {
  const clientes = alasql("SELECT id, nome_completo FROM cadastros_clientes");
  const selectCliente = document.getElementById("ident_cliente");

  selectCliente.innerHTML =
    '<option value="" disabled selected>Selecione um cliente</option>';

  if (clientes.length > 0) {
    clientes.forEach((cliente) => {
      const option = document.createElement("option");
      option.value = cliente.id;
      option.textContent = cliente.nome_completo;
      //importante aqui que ele mostra o nome no campo mas pega o id para o banco
      selectCliente.appendChild(option);
    });
  } else {
    const option = document.createElement("option");
    option.disabled = true;
    option.textContent = "Nenhum cliente encontrado";
    selectCliente.appendChild(option);
  }
}

function cadastrarEnderecoBanco() {
  let cep = document.getElementById("cep").value;
  let rua = document.getElementById("rua").value;
  let bairro = document.getElementById("bairro").value;
  let cidade = document.getElementById("cidade").value;
  let estado = document.getElementById("estado").value;
  let pais = document.getElementById("pais").value;
  let clienteId = document.getElementById("ident_cliente").value;

  const buscaIdsEnderecos = alasql("SELECT id FROM cadastros_enderecos");
  let novoEnderecoId =
    buscaIdsEnderecos.length > 0
      ? buscaIdsEnderecos[buscaIdsEnderecos.length - 1].id + 1
      : 1;

  alasql("INSERT INTO cadastros_enderecos VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [
    novoEnderecoId,
    cep,
    rua,
    bairro,
    cidade,
    estado,
    pais,
    clienteId,
  ]);

  window.location.href = "enderecos.html";
}

function validarDadosEndereco() {
  erros = 0;

  erros += validarCep();
  erros += validarRua();
  erros += validarBairro();
  erros += validarCidade();
  erros += validarEstado();
  erros += validarPais();
  erros += validarIdentCliente();

  if (erros == 0) {
    cadastrarEnderecoBanco();
  }
}

function carregarListaEnderecos() {
  const enderecos = alasql("SELECT * FROM cadastros_enderecos");
  const corpoListaEnderecos = document.getElementById("corpoListaEnderecos");

  corpoListaEnderecos.innerHTML = "";

  enderecos.forEach((endereco) => {
    const tr = document.createElement("tr");

    // const tdId = document.createElement("td");
    // tdId.textContent = endereco.id;

    const tdCep = document.createElement("td");
    cepFormatado = endereco.cep.toString().replace(/\D/g, "");
    cepFormatado = cepFormatado.replace(/(\d{5})(\d{3})/, "$1-$2");
    tdCep.textContent = cepFormatado;

    const tdRua = document.createElement("td");
    tdRua.textContent = endereco.rua;
    tdRua.classList.add("esconde-pequeno");

    const tdBairro = document.createElement("td");
    tdBairro.textContent = endereco.bairro;

    const tdCidade = document.createElement("td");
    tdCidade.textContent = endereco.cidade;

    const tdEstado = document.createElement("td");
    tdEstado.textContent = endereco.estado;

    const tdPais = document.createElement("td");
    tdPais.textContent = endereco.pais;
    tdPais.classList.add("esconde-pequeno");

    const tdCliente = document.createElement("td");
    tdCliente.textContent = endereco.cliente;

    // tr.appendChild(tdId);
    tr.appendChild(tdCep);
    tr.appendChild(tdRua);
    tr.appendChild(tdBairro);
    tr.appendChild(tdCidade);
    tr.appendChild(tdEstado);
    tr.appendChild(tdPais);
    tr.appendChild(tdCliente);

    corpoListaEnderecos.appendChild(tr);
  });
}

function carregarListaClientes() {
  const clientes = alasql("SELECT * FROM cadastros_clientes");
  const corpoListaClientes = document.getElementById("corpoListaClientes");

  corpoListaClientes.innerHTML = "";

  clientes.forEach((cliente) => {
    const tr = document.createElement("tr");

    // const tdId = document.createElement("td");
    // tdId.textContent = cliente.id;

    const tdNome = document.createElement("td");
    tdNome.textContent = cliente.nome_completo;

    const tdCpf = document.createElement("td");
    cpfFormatado = cliente.cpf.toString().replace(/\D/g, "");
    cpfFormatado = cpfFormatado.replace(
      /(\d{3})(\d{3})(\d{3})(\d{2})/,
      "$1 $2 $3-$4"
    );

    tdCpf.textContent = cpfFormatado;

    const tdDataNascimento = document.createElement("td");
    tdDataNascimento.textContent = cliente.data_nascimento;

    const tdTelefone = document.createElement("td");
    telefoneFormatado = cliente.telefone.toString().replace(/\D/g, "");
    telefoneFormatado = telefoneFormatado.replace(/(\d{5})(\d{4})/, "$1-$2");

    tdTelefone.textContent = telefoneFormatado;

    const tdCelular = document.createElement("td");
    celularFormatado = cliente.celular.toString().replace(/\D/g, "");
    celularFormatado = celularFormatado.replace(
      /(\d{2})(\d{5})(\d{4})/,
      "($1) $2-$3"
    );

    tdCelular.textContent = celularFormatado;

    //basicamente criei os elementos aqui em cima e dei os valores
    //abaixo eu crio eles dentro de um tr no html e depois eu boto todos dentro da tbody que to chamando de corpoListaClientes

    // tr.appendChild(tdId);
    tr.appendChild(tdNome);
    tr.appendChild(tdCpf);
    tr.appendChild(tdDataNascimento);
    tr.appendChild(tdTelefone);
    tr.appendChild(tdCelular);

    corpoListaClientes.appendChild(tr);
  });
}

function cadastrarClienteBanco() {
  let nomeCompleto = document.getElementById("nomeCompleto").value;
  let cpf = document.getElementById("cpf").value;
  let dataNascimento = document.getElementById("dataNascimento").value;
  let telefone = document.getElementById("telefone").value;
  let celular = document.getElementById("celular").value;
  const buscaIds = alasql("SELECT id FROM cadastros_clientes");
  let novoId = buscaIds.length > 0 ? buscaIds[buscaIds.length - 1].id + 1 : 1;

  alasql("INSERT INTO cadastros_clientes VALUES (?, ?, ?, ?, ?, ?)", [
    novoId,
    nomeCompleto,
    dataNascimento,
    telefone,
    celular,
    cpf,
  ]);

  window.location.href = "clientes.html";
}

function validarDadosCliente() {
  erros = 0;

  erros += validarNomeCompleto();
  erros += validarCPF();
  erros += validarDataNascimento();
  erros += validarTelefone();
  erros += validarCelular();

  if (erros == 0) {
    cadastrarClienteBanco();
  }
}

function criarBanco() {
  if (!alasql.databases['argosql']) {
    alasql("CREATE LOCALSTORAGE DATABASE IF NOT EXISTS argosqldb");
    alasql("ATTACH LOCALSTORAGE DATABASE argosqldb AS argosql");
  }

  alasql("USE argosql");

  alasql("CREATE TABLE IF NOT EXISTS cadastros_usuarios (nome_usuario STRING, senha STRING)");

  alasql("CREATE TABLE IF NOT EXISTS cadastros_clientes (id INT, nome_completo STRING, data_nascimento DATE, telefone BIGINT, celular BIGINT, cpf BIGINT)");

  alasql("CREATE TABLE IF NOT EXISTS cadastros_enderecos (id INT, cep BIGINT, rua STRING, bairro STRING, cidade STRING, estado STRING, pais STRING, cliente INT)");
}

function logar() {
  let usuario = document.getElementById("usuarioLogin").value;
  let senha = document.getElementById("senhaLogin").value;
  errosSenha = [];
  errosUsuario = [];

  if (usuario == "") {
    errosUsuario.push("O campo usuário é obrigatório.");
  }

  if (senha == "") {
    errosSenha.push("O campo senha é obrigatório.");
  }

  let buscaUsuarioBD = alasql(
    "SELECT nome_usuario FROM cadastros_usuarios WHERE nome_usuario = ?",
    [usuario]
  );

  if (buscaUsuarioBD.length > 0) {
    if (
      alasql("SELECT senha FROM cadastros_usuarios WHERE nome_usuario = ?", [
        usuario,
      ])[0].senha == senha
    ) {
      window.location.href = "acesso_sistema.html";
    } else {
      errosSenha.push("A senha está incorreta!");
    }
  } else {
    errosUsuario.push("A senha está incorreta!");
  }

  if (errosSenha.length + errosUsuario.length != 0) {
    document.getElementById("erroUsuarioLogin").innerHTML =
      errosUsuario.join("<br>");
    document.getElementById("erroUsuarioSenha").innerHTML =
      errosSenha.join("<br>");
  }
}

function validarDadosParaCadastro() {
  let erros = 0;

  erros += validarUsuarioCadastro();
  erros += validarSenhaCadastro();
  erros += validarConfirmaSenhaCadastro();

  if (erros === 0) {
    cadastrarUsuario();
  }
}

function cadastrarUsuario() {
  let usuario = document.getElementById("usuario").value;
  let senha = document.getElementById("senha").value;

  if (alasql.tables.cadastros_usuarios) {
    alasql("INSERT INTO cadastros_usuarios VALUES (?, ?)", [usuario, senha]);

    alert("Cadastro realizado com sucesso!");
  }
}

function validarUsuarioCadastro() {
  let usuario = document.getElementById("usuario").value;
  let errosUsuario = [];
  const caracteresEspeciais = /[^a-zA-Z0-9 ]/g; //para verificar se tem caracteres especiais
  const buscaUsuarioBD = alasql(
    "SELECT * FROM cadastros_usuarios WHERE nome_usuario = ?",
    [usuario]
  );

  document.getElementById("errosUsuario").innerHTML = "";

  if (buscaUsuarioBD.length !== 0) {
    errosUsuario.push("Esse usuário já está sendo usado!");
  }

  if (usuario === "") {
    errosUsuario.push("O campo Usuário é obrigatório.");
  }

  if (usuario.match(caracteresEspeciais)) {
    errosUsuario.push("Não é permitido caracteres especiais no usuário.");
  }

  if (errosUsuario.length > 0) {
    document.getElementById("errosUsuario").innerHTML =
      errosUsuario.join("<br>");
    return 1;
  }

  return 0;
}

function validarSenhaCadastro() {
  let senha = document.getElementById("senha").value;
  let errosSenha = [];

  document.getElementById("errosSenha").innerHTML = "";

  if (senha.length <= 6) {
    errosSenha.push("A senha deve ter mais de 6 caracteres");
  }

  if (errosSenha.length > 0) {
    document.getElementById("errosSenha").innerHTML = errosSenha.join("<br>");
    return 1;
  }
  return 0;
}

function validarConfirmaSenhaCadastro() {
  let senha = document.getElementById("senha").value;
  let confirmaSenha = document.getElementById("confirmaSenha").value;

  let errosConfirmaSenha = [];

  document.getElementById("errosConfirmaSenha").innerHTML = "";

  if (confirmaSenha == "") {
    errosConfirmaSenha.push("Esse campo deve ser preenchido!");
  }

  if (senha != confirmaSenha) {
    errosConfirmaSenha.push("As senhas são diferentes!");
  }

  if (errosConfirmaSenha.length > 0) {
    document.getElementById("errosConfirmaSenha").innerHTML =
      errosConfirmaSenha.join("<br>");
    return 1;
  }
  return 0;
}

function validarNomeCompleto() {
  let nomeCompleto = document.getElementById("nomeCompleto").value;
  let errosNomeCompleto = [];
  const apenasLetras = /[^a-zA-Z ]/g;

  document.getElementById("errosNomeCompleto").innerHTML = "";

  if (nomeCompleto === "") {
    errosNomeCompleto.push("O campo nome completo é obrigatório.");
  }

  if (nomeCompleto.match(apenasLetras)) {
    errosNomeCompleto.push(
      "Não é permitido caracteres especiais e números no campo nome completo."
    );
  }

  if (errosNomeCompleto.length > 0) {
    document.getElementById("errosNomeCompleto").innerHTML =
      errosNomeCompleto.join("<br>");
    return 1;
  }

  return 0;
}

function validarCPF() {
  let cpf = document.getElementById("cpf").value;
  let errosCpf = [];
  const apenasNumeros = /[^0-9 ]/g;
  const buscaCpfs = alasql("SELECT cpf FROM cadastros_clientes");

  document.getElementById("errosCpf").innerHTML = "";

  for (let index = 0; index < buscaCpfs.length; index++) {
    const element = buscaCpfs[index].cpf;

    if (element == cpf) {
      errosCpf.push("Esse CPF já está cadastrado no sistema!");
    }
  }

  if (cpf === "") {
    errosCpf.push("O campo CPF é obrigatório.");
  }

  if (cpf.match(apenasNumeros)) {
    errosCpf.push(
      "Não é permitido caracteres especiais e letras no campo CPF."
    );
  }

  if (cpf.length != 11) {
    errosCpf.push("CPF deve ter 11 caracteres!");
  }

  if (errosCpf.length > 0) {
    document.getElementById("errosCpf").innerHTML = errosCpf.join("<br>");
    return 1;
  }

  return 0;
}

function validarDataNascimento() {
  let dataNascimento = document.getElementById("dataNascimento").value;
  let errosDataNascimento = [];

  document.getElementById("errosDataNascimento").innerHTML = "";

  if (dataNascimento === "") {
    errosDataNascimento.push("É necessário preencher dia, mês e ano!");
  }

  if (errosDataNascimento.length > 0) {
    document.getElementById("errosDataNascimento").innerHTML =
      errosDataNascimento.join("<br>");
    return 1;
  }

  return 0;
}

function validarTelefone() {
  let telefone = document.getElementById("telefone").value;
  let errosTelefone = [];
  const apenasNumeros = /[^0-9 ]/g;

  document.getElementById("errosTelefone").innerHTML = "";

  if (telefone === "") {
    errosTelefone.push("O campo telefone é obrigátorio");
  }

  if (telefone.match(apenasNumeros)) {
    errosCpf.push(
      "Não é permitido caracteres especiais e letras no campo telefone."
    );
  }

  if (telefone.length != 8) {
    errosTelefone.push("Telefone deve ter 8 caracteres!");
  }

  if (errosTelefone.length > 0) {
    document.getElementById("errosTelefone").innerHTML =
      errosTelefone.join("<br>");
    return 1;
  }

  return 0;
}

function validarCelular() {
  let celular = document.getElementById("celular").value;
  let errosCelular = [];
  const apenasNumeros = /[^0-9 ]/g;

  document.getElementById("errosCelular").innerHTML = "";

  if (celular === "") {
    errosCelular.push("O campo celular é obrigátorio");
  }

  if (celular.match(apenasNumeros)) {
    errosCpf.push(
      "Não é permitido caracteres especiais e letras no campo celular."
    );
  }

  if (celular.length != 9) {
    errosCelular.push("Celular deve ter 9 caracteres!");
  }

  if (errosCelular.length > 0) {
    document.getElementById("errosCelular").innerHTML =
      errosCelular.join("<br>");
    return 1;
  }

  return 0;
}

function validarCep() {
  let cep = document.getElementById("cep").value;
  let errosCep = [];
  const apenasNumeros = /[^0-9 ]/g;

  document.getElementById("errosCep").innerHTML = "";

  if (cep === "") {
    errosCep.push("O campo CEP é obrigátorio");
  }

  if (cep.match(apenasNumeros)) {
    errosCpf.push(
      "Não é permitido caracteres especiais e letras no campo CEP."
    );
  }

  if (cep.length != 8) {
    errosCep.push("cep deve ter 8 caracteres!");
  }

  if (errosCep.length > 0) {
    document.getElementById("errosCep").innerHTML = errosCep.join("<br>");
    return 1;
  }

  return 0;
}

function validarRua() {
  let rua = document.getElementById("rua").value;
  let errosRua = [];

  document.getElementById("errosRua").innerHTML = "";

  if (rua === "") {
    errosRua.push("O campo rua é obrigatório.");
  }

  if (errosRua.length > 0) {
    document.getElementById("errosRua").innerHTML = errosRua.join("<br>");
    return 1;
  }

  return 0;
}

function validarBairro() {
  let bairro = document.getElementById("bairro").value;
  let errosBairro = [];

  document.getElementById("errosBairro").innerHTML = "";

  if (bairro === "") {
    errosBairro.push("O campo bairro é obrigatório.");
  }

  if (errosBairro.length > 0) {
    document.getElementById("errosBairro").innerHTML = errosBairro.join("<br>");
    return 1;
  }

  return 0;
}

function validarCidade() {
  let cidade = document.getElementById("cidade").value;
  let errosCidade = [];

  document.getElementById("errosCidade").innerHTML = "";

  if (cidade === "") {
    errosCidade.push("O campo cidade é obrigatório.");
  }

  if (errosCidade.length > 0) {
    document.getElementById("errosCidade").innerHTML = errosCidade.join("<br>");
    return 1;
  }

  return 0;
}

function validarEstado() {
  let estado = document.getElementById("estado").value;
  let errosEstado = [];

  document.getElementById("errosEstado").innerHTML = "";

  if (estado === "") {
    errosEstado.push("O campo estado é obrigatório.");
  }

  if (errosEstado.length > 0) {
    document.getElementById("errosEstado").innerHTML = errosEstado.join("<br>");
    return 1;
  }

  return 0;
}

function validarPais() {
  let pais = document.getElementById("pais").value;
  let errosPais = [];

  document.getElementById("errosPais").innerHTML = "";

  if (pais === "") {
    errosPais.push("O campo pais é obrigatório.");
  }

  if (errosPais.length > 0) {
    document.getElementById("errosPais").innerHTML = errosPais.join("<br>");
    return 1;
  }

  return 0;
}
