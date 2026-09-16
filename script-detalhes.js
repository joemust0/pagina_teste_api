// Variáveis Globais de Controle
let listaPersonagensGlobal = [];
let temaAtual = '';

// Mapeamento das URLs das APIs suportadas
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
                    imagem: detalhes.sprites.other['official-artwork'].front_default || detalhes.sprites.front_default,
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
            status: `Editora: ${item.biography.publisher || 'Desconhecida'}`
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
        nome: "Marvel Comics",
        url: "https://akabab.github.io/superhero-api/api/id/346.json",
        mapeador: (dados) => [
            { id: 1, nome: "Spider-Man", imagem: "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/md/620-spider-man.jpg", status: "Editora: Marvel" },
            { id: 2, nome: "Iron Man", imagem: "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/md/346-iron-man.jpg", status: "Editora: Marvel" },
            { id: 3, nome: "Captain America", imagem: "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/md/149-captain-america.jpg", status: "Editora: Marvel" },
            { id: 4, nome: "Thor", imagem: "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/md/659-thor.jpg", status: "Editora: Marvel" }
        ]
    }
};

// Executado ao carregar a página de detalhes
document.addEventListener("DOMContentLoaded", () => {
    const parametros = new URLSearchParams(window.location.search);
    temaAtual = parametros.get("tema");

    if (temaAtual && APIS[temaAtual]) {
        document.getElementById("titulo-pagina").innerText = APIS[temaAtual].nome;
        carregarDadosApi(temaAtual);
    } else {
        document.getElementById("titulo-pagina").innerText = "Universo não encontrado";
        document.getElementById("subtitulo-pagina").innerText = "Por favor, retorne à página inicial e selecione um tema válido.";
    }
});

// Função responsável por consumir a API usando o Fetch API
async function carregarDadosApi(tema) {
    const config = APIS[tema];
    const gridCards = document.getElementById("grid-cards");
    
    gridCards.innerHTML = "<p class='carregando'>Carregando dados da API em tempo real...</p>";

    try {
        const resposta = await fetch(config.url);
        
        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }

        const dadosBrutos = await resposta.json();

        if (config.mapeadorAssincrono) {
            listaPersonagensGlobal = await config.mapeadorAssincrono(dadosBrutos);
        } else {
            listaPersonagensGlobal = config.mapeador(dadosBrutos);
        }

        renderizarCards(listaPersonagensGlobal);

    } catch (erro) {
        console.error("Erro ao consumir a API:", erro);
        
        if (tema === 'marvel') {
            listaPersonagensGlobal = [
                { id: 1, nome: "Spider-Man", imagem: "https://i.annihil.us/u/prod/marvel/i/mg/3/50/52651a62b29ef.jpg", status: "Editora: Marvel" },
                { id: 2, nome: "Iron Man", imagem: "https://i.annihil.us/u/prod/marvel/i/mg/9/c0/527bb7b37ff55.jpg", status: "Editora: Marvel" }
            ];
            renderizarCards(listaPersonagensGlobal);
        } else if (tema === 'simpsons') {
            listaPersonagensGlobal = [
                { id: 1, nome: "Homer Simpson", imagem: "https://upload.wikimedia.org/wikipedia/en/0/02/Homer_Simpson_2006.png", status: "Frase: 'D'oh!'" },
                { id: 2, nome: "Bart Simpson", imagem: "https://upload.wikimedia.org/wikipedia/en/a/aa/Bart_Simpson_200.png", status: "Frase: 'Eat my shorts!'" }
            ];
            renderizarCards(listaPersonagensGlobal);
        } else {
            gridCards.innerHTML = `<p class='erro'>Erro ao carregar os dados da API: ${erro.message}</p>`;
        }
    }
}

// Manipulação do DOM: Criação de cards dinâmicos via JavaScript
function renderizarCards(personagens) {
    const gridCards = document.getElementById("grid-cards");
    gridCards.innerHTML = ""; 

    if (personagens.length === 0) {
        gridCards.innerHTML = "<p>Nenhum personagem encontrado.</p>";
        return;
    }

    personagens.forEach(personagem => {
        const cardDiv = document.createElement("div");
        cardDiv.className = "card";

        const imgEl = document.createElement("img");
        imgEl.src = personagem.imagem;
        imgEl.alt = personagem.nome;
        imgEl.onerror = () => { imgEl.src = "https://via.placeholder.com/150?text=Sem+Imagem"; };

        const infoDiv = document.createElement("div");
        infoDiv.className = "card-info";

        const nomeEl = document.createElement("h3");
        nomeEl.innerText = personagem.nome;

        const statusEl = document.createElement("p");
        statusEl.innerText = personagem.status;

        const acoesDiv = document.createElement("div");
        acoesDiv.className = "card-acoes";

        const btnEditar = document.createElement("button");
        btnEditar.innerText = "Editar";
        btnEditar.className = "btn-editar";
        btnEditar.onclick = () => abrirModalEdicao(personagem.id);

        const btnExcluir = document.createElement("button");
        btnExcluir.innerText = "Excluir";
        btnExcluir.className = "btn-excluir";
        btnExcluir.onclick = () => excluirPersonagem(personagem.id);

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

// Funções de CRUD Local
function filtrarPersonagens() {
    const termo = document.getElementById("input-busca").value.toLowerCase();
    const filtrados = listaPersonagensGlobal.filter(p => p.nome.toLowerCase().includes(termo));
    renderizarCards(filtrados);
}

function abrirModalCadastro() {
    document.getElementById("modal-titulo").innerText = "Adicionar Novo Personagem";
    document.getElementById("form-personagem").reset();
    document.getElementById("item-id").value = "";
    document.getElementById("modal-crud").classList.remove("oculto");
}

function fecharModalCadastro() {
    document.getElementById("modal-crud").classList.add("oculto");
}

function abrirModalEdicao(id) {
    const personagem = listaPersonagensGlobal.find(p => p.id === id);
    if (!personagem) return;

    document.getElementById("modal-titulo").innerText = "Editar Personagem";
    document.getElementById("item-id").value = personagem.id;
    document.getElementById("input-nome").value = personagem.nome;
    document.getElementById("input-imagem").value = personagem.imagem;
    document.getElementById("input-status").value = personagem.status;

    document.getElementById("modal-crud").classList.remove("oculto");
}

function salvarPersonagem(evento) {
    evento.preventDefault();
    
    const id = document.getElementById("item-id").value;
    const nome = document.getElementById("input-nome").value;
    const imagem = document.getElementById("input-imagem").value;
    const status = document.getElementById("input-status").value;

    if (id) {
        const index = listaPersonagensGlobal.findIndex(p => p.id == id);
        if (index !== -1) {
            listaPersonagensGlobal[index].nome = nome;
            listaPersonagensGlobal[index].imagem = imagem; // Corrigido aqui
            listaPersonagensGlobal[index].status = status;
        }
    } else {
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
    if (confirm("Tem certeza que deseja excluir este personagem?")) {
        listaPersonagensGlobal = listaPersonagensGlobal.filter(p => p.id !== id);
        renderizarCards(listaPersonagensGlobal);
    }
}