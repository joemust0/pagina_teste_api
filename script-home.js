/**
 * Direciona o usuário para a página de listagem dinâmica com base no tema selecionado.
 * @param {string} tema - Nome identificador da API/Universo
 */
function selecionarTema(tema) {
    window.location.href = detalhes.html?tema=$:{tema};
}