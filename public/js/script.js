document.addEventListener("DOMContentLoaded", function() {
    // Elementos principais
    const atalhosContainer = document.getElementById("atalhos-container");
    const modalDocumento = document.getElementById("modal-documento");
    const modalAtalho = document.getElementById("modal-atalho");
    const salvarBtn = document.getElementById("salvar-documento");
    const salvarAtalhoBtn = document.getElementById("salvar-atalho");
    const textoDocumento = document.getElementById("texto-documento");
    const nomeDocumento = document.getElementById("nome-documento");
    const tituloAtalho = document.getElementById("atalho-titulo");
    const iconeAtalho = document.getElementById("atalho-icone");
    const userInfo = document.getElementById("user-info");
    const taskbarItems = document.getElementById("taskbar-items");
    
    // Context menu
    const contextMenu = document.createElement("div");
    contextMenu.className = "context-menu";
    document.body.appendChild(contextMenu);
    
    // Variáveis de estado
    let shortcuts = [];
    let currentUser = null;
    let draggedShortcut = null;
    
    // Inicialização
    checkAuth();
    loadShortcuts();
    setupEventListeners();
    setupClock();
    
    function checkAuth() {
        fetch('/api/auth/check')
            .then(response => response.json())
            .then(data => {
                if (!data.authenticated) {
                    window.location.href = '/login.html';
                } else {
                    currentUser = data.user;
                    userInfo.textContent = currentUser.username;
                }
            });
    }
    
    function loadShortcuts() {
        fetch('/api/shortcuts')
            .then(response => response.json())
            .then(data => {
                shortcuts = data;
                renderShortcuts();
            })
            .catch(error => console.error('Error loading shortcuts:', error));
    }
    
    function renderShortcuts() {
        atalhosContainer.innerHTML = '';
        
        shortcuts.forEach(shortcut => {
            const shortcutElement = document.createElement("div");
            shortcutElement.className = "atalho-item";
            shortcutElement.dataset.id = shortcut.id;
            shortcutElement.draggable = true;
            
            shortcutElement.innerHTML = `
                <a href="#">
                    <img src="img/${shortcut.icon}" alt="${shortcut.title}">
                    <p>${shortcut.title}</p>
                </a>
            `;
            
            atalhosContainer.appendChild(shortcutElement);
            
            // Event listeners para o atalho
            shortcutElement.addEventListener('click', (e) => {
                if (e.target.tagName !== 'A') return;
                e.preventDefault();
                
                if (shortcut.title === 'documento.txt') {
                    openDocumentModal();
                }
            });
            
            shortcutElement.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                showContextMenu(e, shortcut);
            });
            
            // Drag and drop
            shortcutElement.addEventListener('dragstart', (e) => {
                draggedShortcut = shortcutElement;
                e.dataTransfer.setData('text/plain', shortcut.id);
                setTimeout(() => shortcutElement.classList.add('dragging'), 0);
            });
            
            shortcutElement.addEventListener('dragend', () => {
                shortcutElement.classList.remove('dragging');
                draggedShortcut = null;
            });
        });
        
        // Configurar drop zone
        atalhosContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = getDragAfterElement(atalhosContainer, e.clientY);
            if (afterElement == null) {
                atalhosContainer.appendChild(draggedShortcut);
            } else {
                atalhosContainer.insertBefore(draggedShortcut, afterElement);
            }
        });
        
        atalhosContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            updateShortcutPositions();
        });
    }
    
    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.atalho-item:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
    
    function updateShortcutPositions() {
        const shortcutElements = atalhosContainer.querySelectorAll('.atalho-item');
        const updatedShortcuts = [];
        
        shortcutElements.forEach((element, index) => {
            const shortcutId = parseInt(element.dataset.id);
            const shortcut = shortcuts.find(s => s.id === shortcutId);
            
            if (shortcut && shortcut.position !== index) {
                shortcut.position = index;
                updatedShortcuts.push({
                    id: shortcut.id,
                    position: index
                });
            }
        });
        
        if (updatedShortcuts.length > 0) {
            fetch('/api/shortcuts/positions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ shortcuts: updatedShortcuts })
            })
            .catch(error => console.error('Error updating positions:', error));
        }
    }
    
    function showContextMenu(e, shortcut) {
        contextMenu.innerHTML = `
            <div class="context-menu-item" data-action="open">Abrir</div>
            <div class="context-menu-item" data-action="rename">Renomear</div>
            <div class="context-menu-item" data-action="delete">Excluir</div>
            <div class="context-menu-item" data-action="new">Novo Atalho</div>
            <div class="context-menu-divider"></div>
            <div class="context-menu-item" data-action="logout">Sair</div>
        `;
        
        contextMenu.style.display = 'block';
        
        // Posicionamento ajustado para ficar dentro da viewport
        const x = Math.min(e.pageX, window.innerWidth - contextMenu.offsetWidth - 5);
        const y = Math.min(e.pageY, window.innerHeight - contextMenu.offsetHeight - 5);
        
        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;
        
        // Fechar menu ao clicar em qualquer lugar
        const closeMenu = () => {
            contextMenu.style.display = 'none';
            document.removeEventListener('click', closeMenu);
        };
        
        document.addEventListener('click', closeMenu);
        
        // Ações do menu
        contextMenu.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            
            switch (action) {
                case 'open':
                    if (shortcut.title === 'documento.txt') {
                        openDocumentModal();
                    }
                    break;
                    
                case 'rename':
                    renameShortcut(shortcut);
                    break;
                    
                case 'delete':
                    deleteShortcut(shortcut.id);
                    break;
                    
                case 'new':
                    openShortcutModal();
                    break;
            }
            
            closeMenu();
        });
    }
    
    function renameShortcut(shortcut) {
        const newTitle = prompt('Digite o novo nome:', shortcut.title);
        
        if (newTitle && newTitle !== shortcut.title) {
            fetch(`/api/shortcuts/${shortcut.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: newTitle,
                    icon: shortcut.icon,
                    position: shortcut.position
                })
            })
            .then(response => response.json())
            .then(() => loadShortcuts())
            .catch(error => console.error('Error renaming shortcut:', error));
        }
    }
    
    function deleteShortcut(id) {
        if (confirm('Tem certeza que deseja excluir este atalho?')) {
            fetch(`/api/shortcuts/${id}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(() => loadShortcuts())
            .catch(error => console.error('Error deleting shortcut:', error));
        }
    }
    
    function openDocumentModal() {
        modalDocumento.style.display = "flex";
        textoDocumento.value = "";
        nomeDocumento.value = "";
        textoDocumento.focus();
    }
    
    function openShortcutModal() {
        modalAtalho.style.display = "flex";
        tituloAtalho.value = "";
        iconeAtalho.value = "documento.png";
        tituloAtalho.focus();
    }
    
    function setupEventListeners() {
        // Fechar modais
        document.querySelectorAll(".modal-close").forEach(btn => {
            btn.addEventListener("click", function() {
                this.closest(".modal").style.display = "none";
            });
        });

        // Logout button
        document.getElementById("logout-btn").addEventListener("click", function() {
            if (confirm('Deseja realmente sair do sistema?')) {
                fetch('/api/auth/logout', {
                    method: 'POST'
                })
                .then(() => window.location.href = '/login.html')
                .catch(error => console.error('Error logging out:', error));
            }
        });
        
        // Fechar ao clicar fora
        window.addEventListener("click", function(e) {
            if (e.target.classList.contains("modal")) {
                e.target.style.display = "none";
            }
        });
        
        // Salvar documento
        salvarBtn.addEventListener("click", saveDocument);
        
        // Salvar atalho
        salvarAtalhoBtn.addEventListener("click", saveShortcut);
        
        // Botão iniciar - abrir menu de contexto
        document.getElementById("botao-iniciar").addEventListener("click", (e) => {
            e.stopPropagation();
            showContextMenu(e, {});
        });
        
        // Logout via menu de contexto
        document.addEventListener('click', (e) => {
            if (e.target.dataset.action === 'logout') {
                fetch('/api/auth/logout', {
                    method: 'POST'
                })
                .then(() => window.location.href = '/login.html')
                .catch(error => console.error('Error logging out:', error));
            }
        });
    }
    
    function saveDocument() {
        const conteudo = textoDocumento.value;
        let nomeArquivo = nomeDocumento.value.trim() || "sem-nome.txt";
        
        if (!nomeArquivo.endsWith('.txt')) {
            nomeArquivo += '.txt';
        }

        if (conteudo.trim() === "") {
            alert("O documento está vazio!");
            return;
        }

        // Aqui você pode implementar a lógica para salvar o documento
        // Por exemplo, adicionar à lista de documentos salvos
        alert(`Documento "${nomeArquivo}" salvo com sucesso!`);
        modalDocumento.style.display = "none";
    }
    
    function saveShortcut() {
        const title = tituloAtalho.value.trim();
        const icon = iconeAtalho.value;
        
        if (!title) {
            alert("Por favor, digite um título para o atalho");
            return;
        }
        
        const position = shortcuts.length;
        
        fetch('/api/shortcuts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, icon, position })
        })
        .then(response => response.json())
        .then(() => {
            loadShortcuts();
            modalAtalho.style.display = "none";
        })
        .catch(error => console.error('Error creating shortcut:', error));
    }
    
    function setupClock() {
        function atualizarRelogio() {
            const agora = new Date();
            const horas = agora.getHours().toString().padStart(2, '0');
            const minutos = agora.getMinutes().toString().padStart(2, '0');
            document.querySelector('.clock').textContent = `${horas}:${minutos}`;
        }
        
        setInterval(atualizarRelogio, 1000);
        atualizarRelogio();
    }
});