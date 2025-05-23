document.addEventListener('DOMContentLoaded', function() {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const messageDiv = document.getElementById('login-message');

    // Verificar se já está autenticado
    checkAuth();

    loginBtn.addEventListener('click', login);
    registerBtn.addEventListener('click', register);

    // Permitir login com Enter
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            login();
        }
    });

    function checkAuth() {
        fetch('/api/auth/check')
            .then(response => response.json())
            .then(data => {
                if (data.authenticated) {
                    window.location.href = '/';
                }
            });
    }

    function login() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            showMessage('Por favor, preencha todos os campos', 'error');
            return;
        }

        fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = '/';
            } else {
                showMessage(data.error || 'Erro ao fazer login', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('Erro ao conectar com o servidor', 'error');
        });
    }

    function register() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            showMessage('Por favor, preencha todos os campos', 'error');
            return;
        }

        if (password.length < 6) {
            showMessage('A senha deve ter pelo menos 6 caracteres', 'error');
            return;
        }

        fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showMessage('Registro realizado com sucesso! Faça login.', 'success');
            } else {
                showMessage(data.error || 'Erro ao registrar', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('Erro ao conectar com o servidor', 'error');
        });
    }

    function showMessage(message, type) {
        messageDiv.textContent = message;
        messageDiv.className = 'message ' + (type || '');
    }
});