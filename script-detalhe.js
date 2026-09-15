// Variáveis Globais
let listaPersonagensGlobal = [];
let temaAtual = "";

const APIS = {
    rickandmorty: {
        nome: "Rick and Morty",
        url: "https://rickandmortyapi.com/api/character",
        mapeador: (dados) => dados.results.map(item => ({
            id: item.id,
            nome: item.name,
            imagem: item.image,
            status: `Status: ${item.status} - Espécie: ${item.species}`
        }))
    },

    pokemon: {
        nome: "Pokémon",
        url: "https://pokeapi.co/api/v2/pokemon?limit=20",
        mapeadorAssincrono: async (dados) => {
            const promessas = dados.results.map(async (p) => {
                const res = await fetch(p.url);
                const detalhes = await res.json();

                return {
                    id: detalhes.id,
                    nome: detalhes.name.toUpperCase(),
                    imagem:
                        detalhes.sprites.other["official-artwork"].front_default ||
                        detalhes.sprites.front_default,
                    status: `Altura: ${detalhes.height} | Peso: ${detalhes.weight}`
                };
            });

            return await Promise.all(promessas);
        }
    },

    superhero: {
        nome: "Super Hero",
        url: "https://akabab.github.io/superhero-api/api/all.json",
        mapeador: (dados) => dados.slice(0, 20).map(item => ({
            id: item.id,
            nome: item.name,
            imagem: item.images.md,
            status: `Editora: ${item.biography.publisher || "Desconhecida"}`
        }))
    },

    simpsons: {
        nome: "The Simpsons",
        url: "https://thesimpsonsquoteapi.glitch.me/quotes?count=10",
        mapeador: (dados) => dados.map((item, index) => ({
            id: index + 1,
            nome: item.character,
            imagem: item.image,
            status: `Frase: "${item.quote}"`
        }))
    },

    marvel: {
        nome: "Marvel Comics (Demonstração Pública)",
        url: "https://gateway.marvel.com:443/v1/public/characters?limit=20&apikey=sua_chave_aqui",
        mapeador: (dados) => dados.data.results.map(item => ({
            id: item.id,
            nome: item.name,
            imagem: `${item.thumbnail.path}.${item.thumbnail.extension}`,
            status: `Modificado em: ${
                item.modified
                    ? item.modified.substring(0, 10)
                    : "Recente"
            }`
        }))
    }
};

// Executado ao carregar a página de detalhes
document.addEventListener("DOMContentLoaded", () => {
    const parametros = new URLSearchParams(window.location.search);

    temaAtual = parametros.get("tema");

    if (temaAtual && APIS[temaAtual]) {
        document.getElementById("titulo-pagina").innerText =
            APIS[temaAtual].nome;

        carregarDadosApi(temaAtual);
    } else {
        document.getElementById("titulo-pagina").innerText =
            "Universo não encontrado";

        document.getElementById("subtitulo-pagina").innerText =
            "Por favor, retorne à página inicial e selecione um tema válido.";
    }
});

/**
 * Função responsável por consumir a API
 */
async function carregarDadosApi(tema) {
    const config = APIS[tema];
    const gridCards = document.getElementById("grid-cards");

    gridCards.innerHTML =
        "<p class='carregando'>Carregando dados da API em tempo real...</p>";

    try {
        const resposta = await fetch(config.url);

        if (!resposta.ok && tema === "marvel") {
            throw new Error(
                "A API da Marvel requer uma chave (API Key) válida configurada na URL."
            );
        }

        if (!resposta.ok) {
            throw new Error(
                `Erro HTTP ${resposta.status}: ${resposta.statusText}`
            );
        }

        const dadosBrutos = await resposta.json();

        // Mapeia os dados dependendo se o mapeador é síncrono ou assíncrono
        if (config.mapeadorAssincrono) {
            listaPersonagensGlobal =
                await config.mapeadorAssincrono(dadosBrutos);
        } else {
            listaPersonagensGlobal =
                config.mapeador(dadosBrutos);
        }

        renderizarCards(listaPersonagensGlobal);

    } catch (erro) {
        console.error("Erro ao consumir a API:", erro);

        // Fallback demonstrativo caso a API externa dê erro de CORS ou Token.
        if (tema === "marvel") {

            alert(
                "Aviso: A API oficial da Marvel exige credenciais próprias. " +
                "Carregando dados de demonstração alternativos para o trabalho."
            );

            listaPersonagensGlobal = [
                {
                    id: 1,
                    nome: "Spider-Man",
                    imagem:
                        "https://i.annihil.us/u/prod/marvel/i/mg/3/50/52651a62b29ef.jpg",
                    status: "Editora: Marvel"
                },
                {
                    id: 2,
                    nome: "Iron Man",
                    imagem:
                        "https://i.annihil.us/u/prod/marvel/i/mg/9/c0/527bb7b37ff55.jpg",
                    status: "Editora: Marvel"
                }
            ];

            renderizarCards(listaPersonagensGlobal);

        } else {
            gridCards.innerHTML =
                `<p class="erro">Erro ao carregar os dados da API: ${erro.message}</p>`;
        }
    }
}

/**
 * Manipulação do DOM
 */
function renderizarCards(personagens) {
    const gridCards = document.getElementById("grid-cards");

    gridCards.innerHTML = "";

    if (personagens.length === 0) {
        gridCards.innerHTML =
            "<p>Nenhum personagem encontrado.</p>";
        return;
    }

    personagens.forEach(personagem => {

        const cardDiv = document.createElement("div");
        cardDiv.className = "card";

        const imgEl = document.createElement("img");
        imgEl.src = personagem.imagem;
        imgEl.alt = personagem.nome;

        imgEl.onerror = () => {
            imgEl.src =
                "https://via.placeholder.com/150?text=Sem+Imagem";
        };

        const infoDiv = document.createElement("div");
        infoDiv.className = "card-info";

        const nomeEl = document.createElement("h3");
        nomeEl.innerText = personagem.nome;

        const statusEl = document.createElement("p");
        statusEl.innerText = personagem.status;

        // Container de botões para as ações de CRUD local
        const acoesDiv = document.createElement("div");
        acoesDiv.className = "card-acoes";

        // Botão Editar
        const btnEditar = document.createElement("button");
        btnEditar.innerText = "Editar";
        btnEditar.className = "btn-editar";

        btnEditar.onclick = () =>
            abrirModalEdicao(personagem.id);

        // Botão Excluir
        const btnExcluir = document.createElement("button");
        btnExcluir.innerText = "Excluir";
        btnExcluir.className = "btn-excluir";

        btnExcluir.onclick = () =>
            excluirPersonagem(personagem.id);

        acoesDiv.appendChild(btnEditar);
        acoesDiv.appendChild(btnExcluir);

        infoDiv.appendChild(nomeEl);
        infoDiv.appendChild(statusEl);
        infoDiv.appendChild(acoesDiv);

        cardDiv.appendChild(imgEl);
        cardDiv.appendChild(infoDiv);

        gridCards.appendChild(cardDiv);
    });
}

function filtrarPersonagens() {
    const termo =
        document.getElementById("input-busca").value.toLowerCase();

    const filtrados = listaPersonagensGlobal.filter(
        p => p.nome.toLowerCase().includes(termo)
    );

    renderizarCards(filtrados);
}

function abrirModalCadastro() {
    document.getElementById("modal-titulo").innerText =
        "Adicionar Novo Personagem";

    document.getElementById("form-personagem").reset();

    document.getElementById("item-id").value = "";

    document.getElementById("modal-crud")
        .classList.remove("oculto");
}

function fecharModalCadastro() {
    document.getElementById("modal-crud")
        .classList.add("oculto");
}

function abrirModalEdicao(id) {
    const personagem =
        listaPersonagensGlobal.find(p => p.id === id);

    if (!personagem) return;

    document.getElementById("modal-titulo").innerText =
        "Editar Personagem";

    document.getElementById("item-id").value =
        personagem.id;

    document.getElementById("input-nome").value =
        personagem.nome;

    document.getElementById("input-imagem").value =
        personagem.imagem;

    document.getElementById("input-status").value =
        personagem.status;

    document.getElementById("modal-crud")
        .classList.remove("oculto");
}

function salvarPersonagem(evento) {
    evento.preventDefault();

    const id =
        document.getElementById("item-id").value;

    const nome =
        document.getElementById("input-nome").value;

    const imagem =
        document.getElementById("input-imagem").value;

    const status =
        document.getElementById("input-status").value;

    if (id) {

        // UPDATE (U do CRUD)
        const index =
            listaPersonagensGlobal.findIndex(
                p => p.id == id
            );

        if (index !== -1) {
            listaPersonagensGlobal[index].nome = nome;
            listaPersonagensGlobal[index].imagem = imagem;
            listaPersonagensGlobal[index].status = status;
        }

    } else {

        // CREATE (C do CRUD)
        const novoItem = {
            id: Date.now(),
            nome: nome,
            imagem: imagem,
            status: status
        };

        listaPersonagensGlobal.unshift(novoItem);
    }

    fecharModalCadastro();

    renderizarCards(listaPersonagensGlobal);
}

function excluirPersonagem(id) {

    if (
        confirm(
            "Tem certeza que deseja excluir este personagem da exibição?"
        )
    ) {

        // DELETE (D do CRUD)
        listaPersonagensGlobal =
            listaPersonagensGlobal.filter(
                p => p.id !== id
            );

        renderizarCards(listaPersonagensGlobal);
    }
}

