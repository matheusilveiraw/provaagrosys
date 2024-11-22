checarLogado();
criarBanco();

document.addEventListener("DOMContentLoaded", function () {
  if (window.location.pathname.includes("cadastrar_cliente.html")) {
    carregarEnderecos();
  }
});

function adcInputEndereco() {
  const div = document.createElement("div");
  div.classList.add("mt-1");

  const inputEndereco = document.createElement("input");
  inputEndereco.type = "number";
  inputEndereco.classList.add("form-control");
  inputEndereco.class = "endereco-secundario";
  inputEndereco.placeholder = "Outros endereços";
  inputEndereco.required = true;

  const pErro = document.createElement("p");
  pErro.classList.add("text-danger", "erro-fonte", "ml-1");
  pErro.class = "errosEnderecoPrincipal";

  div.appendChild(inputEndereco);
  div.appendChild(pErro);

  const container = document.getElementById("containerEnderecos");
  container.appendChild(div);
}

function deslogarSistema() {
  localStorage.setItem("usuarioLogado", false);
  window.location.href = "index.html";
}

function checarLogado() {
  if (
    !(
      window.location.pathname.includes("index.html") ||
      window.location.pathname.includes("cadastro.html")
    )
  ) {
    if (localStorage.getItem("usuarioLogado") == "false") {
      alert("Você precisa logar no sistema!");
      window.location.href = "index.html";
    }
  }
}

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
        dados.cadastros_usuarios.forEach((usuario) => {
          alasql("INSERT INTO cadastros_usuarios VALUES ?", [usuario]);
        });
      }

      if (dados.cadastros_clientes) {
        dados.cadastros_clientes.forEach((cliente) => {
          alasql("INSERT INTO cadastros_clientes VALUES ?", [cliente]);
        });
      }

      if (dados.cadastros_enderecos) {
        dados.cadastros_enderecos.forEach((endereco) => {
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

function carregarEnderecos() {
  const enderecos = alasql(
    "SELECT id, rua, bairro, cidade FROM cadastros_enderecos"
  );

  const enderecoPrincipal = document.getElementById("enderecoPrincipal");

  enderecoPrincipal.innerHTML =
    '<option value="" disabled selected>Selecione seu endereço principal</option>';

  if (enderecos.length > 0) {
    enderecos.forEach((endereco) => {
      const option = document.createElement("option");
      option.value = endereco.id;
      option.textContent =
        endereco.rua + ", " + endereco.bairro + ", " + endereco.cidade;
      enderecoPrincipal.appendChild(option);
    });
  } else {
    const option = document.createElement("option");
    option.disabled = true;
    option.textContent = "Nenhum Endereco encontrado";
    enderecoPrincipal.appendChild(option);
  }
}

function cadastrarEnderecoBanco() {
  let cep = document.getElementById("cep").value;
  let rua = document.getElementById("rua").value;
  let bairro = document.getElementById("bairro").value;
  let cidade = document.getElementById("cidade").value;
  let estado = document.getElementById("estado").value;
  let pais = document.getElementById("pais").value;

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

  if (erros == 0) {
    cadastrarEnderecoBanco();
  }
}

function carregarListaEnderecos() {
  const enderecos = alasql("SELECT * FROM cadastros_enderecos");
  const clientes = alasql("SELECT * FROM cadastros_clientes");
  const corpoListaEnderecos = document.getElementById("corpoListaEnderecos");

  corpoListaEnderecos.innerHTML = "";

  for (let index = 0; index < enderecos.length; index++) {
    const element = enderecos[index];

    const tr = document.createElement("tr");

    const tdCep = document.createElement("td");
    cepFormatado = element.cep.toString().replace(/\D/g, "");
    cepFormatado = cepFormatado.replace(/(\d{5})(\d{3})/, "$1-$2");
    tdCep.textContent = cepFormatado;

    const tdRua = document.createElement("td");
    tdRua.textContent = element.rua;
    tdRua.classList.add("esconde-pequeno");

    const tdBairro = document.createElement("td");
    tdBairro.textContent = element.bairro;

    const tdCidade = document.createElement("td");
    tdCidade.textContent = element.cidade;

    const tdEstado = document.createElement("td");
    tdEstado.textContent = element.estado;

    const tdPais = document.createElement("td");
    tdPais.textContent = element.pais;
    tdPais.classList.add("esconde-pequeno");

    const tdCliente = document.createElement("td");

    for (let j = 0; j < clientes.length; j++) {
      const e = clientes[j];

      if (e.endereco_princiapl == element.id) {
        tdCliente.textContent = element.id;
      }
    }

    for (let index = 0; index < clientes.length; index++) {
      const j = clientes[index];

      if(j.enderecos_secundarios) { 
        const numeros = j.enderecos_secundarios.match(/\d+/g);

        if (numeros) {
          const numerosConvertidos = numeros.map(Number);
  
          for (let index2 = 0; index2 < numerosConvertidos.length; index2++) {
            const e = numerosConvertidos[index2];
            
            if (e == element.id) {
              tdCliente.textContent = element.id;
            }
          }
        }
      }
    }

    // tr.appendChild(tdId);
    tr.appendChild(tdCep);
    tr.appendChild(tdRua);
    tr.appendChild(tdBairro);
    tr.appendChild(tdCidade);
    tr.appendChild(tdEstado);
    tr.appendChild(tdPais);
    tr.appendChild(tdCliente);

    corpoListaEnderecos.appendChild(tr);
  }
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
  let endereco_princiapl = document.getElementById('enderecoPrincipal').value;
  let enderecos_secundarios = document.getElementsByClassName('endereco-secundario').value;

  const buscaIds = alasql("SELECT id FROM cadastros_clientes");
  let novoId = buscaIds.length > 0 ? buscaIds[buscaIds.length - 1].id + 1 : 1;

  alasql(
    "CREATE TABLE IF NOT EXISTS cadastros_clientes (id INT, nome_completo STRING, data_nascimento DATE, telefone BIGINT, celular BIGINT, cpf BIGINT, endereco_princiapl INT, enderecos_secundarios TEXT)"
  );

  alasql("INSERT INTO cadastros_clientes VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [
    novoId,
    nomeCompleto,
    dataNascimento,
    telefone,
    celular,
    cpf,
    endereco_princiapl,
    enderecos_secundarios
  ]);

  window.location.href = "clientes.html";
}

function validarDadosEnderecoPrincipal() {
  let enderecoPrincipal = parseInt(
    document.getElementById("enderecoPrincipal").value
  );
  let errosEnderecoPrincipal = [];
  const enderecosPrincipaisEmUso = alasql(
    "select endereco_princiapl FROM cadastros_clientes"
  );
  const enderecosSecundariosEmUso = alasql(
    "select enderecos_secundarios FROM cadastros_clientes"
  );

  document.getElementById("errosEnderecoPrincipal").innerHTML = "";

  if (enderecoPrincipal === "") {
    errosEnderecoPrincipal.push("Você deve selecionar um dos clientes!");
    document.getElementById("errosEnderecoPrincipal").innerHTML =
      errosEnderecoPrincipal.join("<br>");
    return 1;
  }

  for (let index = 0; index < enderecosPrincipaisEmUso.length; index++) {
    const element = enderecosPrincipaisEmUso[index];

    if (element.endereco_princiapl == enderecoPrincipal) {
      errosEnderecoPrincipal.push("Esse endereço já está em uso!");
      document.getElementById("errosEnderecoPrincipal").innerHTML =
        errosEnderecoPrincipal.join("<br>");
      return 1;
    }
  }

  //código acima compara com todos códigos principais

  for (let index = 0; index < enderecosSecundariosEmUso.length; index++) {
    const element = enderecosSecundariosEmUso[index];

    const numeros = element.enderecos_secundarios.match(/\d+/g);

    if (numeros) {
      const numerosConvertidos = numeros.map(Number);

      for (let index2 = 0; index2 < numerosConvertidos.length; index2++) {
        const e = numerosConvertidos[index2];

        if (e == enderecoPrincipal) {
          errosEnderecoPrincipal.push("Esse endereço já está em uso!");
          document.getElementById("errosEnderecoPrincipal").innerHTML =
            errosEnderecoPrincipal.join("<br>");
          return 1;
        }
      }
    }

    //aqui os valores secundarios são pegos json pelo banco, aí tem que converter e como pode ter mais de um
    //tem que fazer um for para rodar os números secundarios e um for neles para rodar os valores dos secundarios dentro
    //das arrays que eles estão
  }
  return 0;
}

function validarDadosCliente() {
  erros = 0;

  erros += validarNomeCompleto();
  erros += validarCPF();
  erros += validarDataNascimento();
  erros += validarTelefone();
  erros += validarCelular();
  erros += validarDadosEnderecoPrincipal();

  if (erros == 0) {
    cadastrarClienteBanco();
  }
}

function criarBanco() {
  if (!alasql.databases["argosql"]) {
    alasql("CREATE LOCALSTORAGE DATABASE IF NOT EXISTS argosqldb");
    alasql("ATTACH LOCALSTORAGE DATABASE argosqldb AS argosql");
  }

  alasql("USE argosql");

  alasql(
    "CREATE TABLE IF NOT EXISTS cadastros_usuarios (nome_usuario STRING, senha STRING)"
  );

  alasql(
    "CREATE TABLE IF NOT EXISTS cadastros_clientes (id INT, nome_completo STRING, data_nascimento DATE, telefone BIGINT, celular BIGINT, cpf BIGINT, endereco_princiapl INT, enderecos_secundarios TEXT)"
  );

  alasql(
    "CREATE TABLE IF NOT EXISTS cadastros_enderecos (id INT, cep BIGINT, rua STRING, bairro STRING, cidade STRING, estado STRING, pais STRING)"
  );

  // alasql(`
  //   INSERT INTO cadastros_usuarios (nome_usuario, senha)
  //   VALUES
  //     ('usuario1', 'senha123'),
  //     ('usuario2', 'senha456'),
  //     ('usuario3', 'senha789'),
  //     ('usuario4', 'senha101'),
  //     ('usuario5', 'senha202');
  // `);

  // alasql(`
  //   INSERT INTO cadastros_clientes (id, nome_completo, data_nascimento, telefone, celular, cpf, endereco_princiapl, enderecos_secundarios)
  //   VALUES
  //     (1, 'João Silva', '1985-02-15', 1122334455, 11987654321, 12345678901, 1, '[2, 3]'),
  //     (2, 'Maria Oliveira', '1990-07-25', 1133445566, 11976543210, 23456789012, 4, '[5]'),
  //     (3, 'Carlos Souza', '1982-11-30', 1144556677, 11865432109, 34567890123, 6, '[7, 8]'),
  //     (4, 'Fernanda Lima', '1995-05-05', 1155667788, 11754321098, 45678901234, 9, '[10, 11]'),
  //     (5, 'Roberto Pereira', '1978-08-12', 1166778899, 11643210987, 56789012345, 12, '[13, 14, 15]');
  // `);

  // alasql(`
  //   INSERT INTO cadastros_enderecos (id, cep, rua, bairro, cidade, estado, pais)
  //   VALUES
  //     (1, 12345678, 'Rua das Flores', 'Jardim Primavera', 'São Paulo', 'SP', 'Brasil'),
  //     (2, 23456789, 'Avenida Central', 'Centro', 'Rio de Janeiro', 'RJ', 'Brasil'),
  //     (3, 34567890, 'Rua do Sol', 'Bela Vista', 'Belo Horizonte', 'MG', 'Brasil'),
  //     (4, 45678901, 'Travessa das Palmeiras', 'Boa Esperança', 'Curitiba', 'PR', 'Brasil'),
  //     (5, 78945612, '5555', '5555', '55', '5', '555'),
  //     (6, 67890123, 'Rua das Acácias', 'Jardim das Palmeiras', 'Manaus', 'AM', 'Brasil'),
  //     (7, 78901234, 'Avenida do Sol', 'Centro', 'Fortaleza', 'CE', 'Brasil'),
  //     (8, 89012345, 'Rua do Horizonte', 'Vila Nova', 'Recife', 'PE', 'Brasil'),
  //     (9, 90123456, 'Praça da Paz', 'Alto do Morro', 'Brasília', 'DF', 'Brasil'),
  //     (10, 12309876, 'Rua das Magnólias', 'Bairro do Lago', 'Curitiba', 'PR', 'Brasil'),
  //     (11, 23456789, 'Avenida das Nações', 'Vila Verde', 'Porto Alegre', 'RS', 'Brasil'),
  //     (12, 34567890, 'Rua do Comércio', 'Centro Histórico', 'Salvador', 'BA', 'Brasil'),
  //     (13, 45678901, 'Rua da Liberdade', 'Liberdade', 'São Paulo', 'SP', 'Brasil'),
  //     (14, 56789012, 'Rua do Campo', 'Vila São José', 'Natal', 'RN', 'Brasil'),
  //     (15, 67890123, 'Rua do Rio', 'Vila Mariana', 'Rio de Janeiro', 'RJ', 'Brasil');
  // `);
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
      localStorage.setItem("usuarioLogado", true);
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
