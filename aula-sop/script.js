document.addEventListener("DOMContentLoaded", function() {
    // Elementos principais
    const abrirDocumento = document.getElementById("abrir-documento");
    const modal = document.getElementById("modal-documento");
    const salvarBtn = document.getElementById("salvar-documento");
    const textoDocumento = document.getElementById("texto-documento");
    const nomeDocumento = document.getElementById("nome-documento");
    const meusDocumentos = document.getElementById("meus-documentos");
    const documentosSalvos = document.createElement("div");
    documentosSalvos.className = "documentos-salvos";
    meusDocumentos.querySelector("a").appendChild(documentosSalvos);
    
    // Relógio
    function atualizarRelogio() {
        const agora = new Date();
        const horas = agora.getHours().toString().padStart(2, '0');
        const minutos = agora.getMinutes().toString().padStart(2, '0');
        document.querySelector('.clock').textContent = `${horas}:${minutos}`;
    }
    setInterval(atualizarRelogio, 1000);
    atualizarRelogio();

    // Abrir modal
    abrirDocumento.addEventListener("click", function(e) {
        e.preventDefault();
        modal.style.display = "flex";
        textoDocumento.value = "";
        nomeDocumento.value = "";
        textoDocumento.focus();
    });

    // Fechar modal
    document.querySelector(".modal-close").addEventListener("click", function() {
        modal.style.display = "none";
    });

    // Salvar documento
    salvarBtn.addEventListener("click", function() {
        const conteudo = textoDocumento.value;
        let nomeArquivo = nomeDocumento.value.trim() || "sem-nome.txt";
        
        // Garante a extensão .txt
        if (!nomeArquivo.endsWith('.txt')) {
            nomeArquivo += '.txt';
        }

        if (conteudo.trim() === "") {
            alert("O documento está vazio!");
            return;
        }

        // Verifica se já existe um documento com esse nome
        const documentosExistentes = documentosSalvos.querySelectorAll('.documento-salvo');
        let documentoExistente = null;
        
        documentosExistentes.forEach(doc => {
            if (doc.querySelector('span').textContent === nomeArquivo) {
                documentoExistente = doc;
            }
        });

        if (documentoExistente) {
            if (!confirm(`"${nomeArquivo}" já existe. Substituir?`)) {
                return;
            }
            documentoExistente.querySelector('.conteudo').textContent = conteudo;
        } else {
            // Cria novo elemento de documento
            const documentoElement = document.createElement("div");
            documentoElement.className = "documento-salvo";
            documentoElement.innerHTML = `
                <img src="documento.png" alt="${nomeArquivo}" width="16">
                <span>${nomeArquivo}</span>
                <div class="conteudo" hidden>${conteudo}</div>
            `;

            // Adiciona funcionalidade de clique
            documentoElement.addEventListener("click", function(e) {
                e.stopPropagation();
                textoDocumento.value = this.querySelector(".conteudo").textContent;
                nomeDocumento.value = nomeArquivo.replace('.txt', '');
                modal.style.display = "flex";
            });

            documentosSalvos.appendChild(documentoElement);
        }

        modal.style.display = "none";
    });

    // Fechar ao clicar fora
    window.addEventListener("click", function(e) {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });

    // Mostrar documentos salvos ao passar o mouse
    meusDocumentos.addEventListener("mouseenter", function() {
        documentosSalvos.style.display = "block";
    });

    meusDocumentos.addEventListener("mouseleave", function() {
        documentosSalvos.style.display = "none";
    });
});