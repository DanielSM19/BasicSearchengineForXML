async function carregarXML(arquivo) {
    try {
        const leitor = new FileReader();
        return new Promise((resolve, reject) => {
            leitor.onload = () => {
                const parser = new DOMParser();
                resolve(parser.parseFromString(leitor.result, "text/xml"));
            };
            leitor.onerror = () => reject(new Error("Erro ao ler o arquivo."));
            leitor.readAsText(arquivo);
        });
    } catch (erro) {
        console.error(erro);
        alert("Não foi possível carregar o arquivo XML.");
        throw erro;
    }
}

function calcularPorcentagem(ocorrencias, totalPalavras) {
    return totalPalavras > 0 ? (ocorrencias / totalPalavras) * 100 : 0;
}

function calcularRanking(xmlDoc) {
    const pages = xmlDoc.getElementsByTagName("page");
    const resultados = [];

    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];

        const titleTag = page.getElementsByTagName("title")[0];
        const textTag = page.getElementsByTagName("text")[0];

        const titleContent = titleTag?.textContent || "";
        const textContent = textTag?.textContent || "";

        const titleWords = titleContent.split(/\s+/);
        const textWords = textContent.split(/\s+/);

        const titleOcorrencias = (titleContent.match(/\bcomputer\b/gi) || []).length;
        const textOcorrencias = (textContent.match(/\bcomputer\b/gi) || []).length;

        const titlePorcentagem = calcularPorcentagem(titleOcorrencias, titleWords.length);
        const textPorcentagem = calcularPorcentagem(textOcorrencias, textWords.length);

    
        const porcentagemTotal = (titlePorcentagem) + (textPorcentagem);

        resultados.push({
            page,
            porcentagemTotal,
            detalhes: {
                titleOcorrencias,
                titleWords: titleWords.length,
                textOcorrencias,
                textWords: textWords.length,
                titlePorcentagem,
                textPorcentagem,
            },
        });
    }

    resultados.sort((a, b) => b.porcentagemTotal - a.porcentagemTotal);
    return resultados;
}

function exibirResultados(resultados) {
    const divResultado = document.getElementById("resultado");
    divResultado.innerHTML = "";

    const titulo = document.createElement("h2");
    titulo.textContent = "Ranking de Pages por Porcentagem Total de 'computer'";
    divResultado.appendChild(titulo);

    if (resultados.length > 0) {
        const lista = document.createElement("ol");
        resultados.forEach(({ page, porcentagemTotal, detalhes }) => {
            const itemLista = document.createElement("li");
            itemLista.innerHTML = `
                <strong>Porcentagem Total:</strong> ${porcentagemTotal.toFixed(2)}% <br>
                <strong>Title - Ocorrências:</strong> ${detalhes.titleOcorrencias}, Total de Palavras: ${detalhes.titleWords}, Porcentagem: ${detalhes.titlePorcentagem.toFixed(2)}% <br>
                <strong>Text - Ocorrências:</strong> ${detalhes.textOcorrencias}, Total de Palavras: ${detalhes.textWords}, Porcentagem: ${detalhes.textPorcentagem.toFixed(2)}% <br>
                <strong>Page Content:</strong> ${page.outerHTML.slice(0, 200)}...
            `;
            lista.appendChild(itemLista);
        });
        divResultado.appendChild(lista);
    } else {
        const semResultados = document.createElement("p");
        semResultados.textContent = `Nenhuma ocorrência da palavra "computer" encontrada nas tags analisadas.`;
        divResultado.appendChild(semResultados);
    }
}

document.getElementById("botaoBuscar").addEventListener("click", async () => {
    const inputArquivo = document.getElementById("arquivoXML");
    const arquivo = inputArquivo.files[0];

    if (!arquivo) {
        alert("Por favor, selecione um arquivo XML.");
        return;
    }

    try {
        const xmlDoc = await carregarXML(arquivo);
        const resultados = calcularRanking(xmlDoc);
        exibirResultados(resultados);
    } catch (erro) {
        console.error("Erro:", erro);
    }
});