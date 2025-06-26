        // URL da API (ajuste conforme necessário)
        const API_URL = 'http://localhost:3000/api';
        
        // Array para armazenar os vídeos (agora carregados da API)
        let videos = [];

        // Função para carregar vídeos da API
        async function loadVideos() {
            try {
                const response = await fetch(`${API_URL}/videos`);
                if (!response.ok) {
                    throw new Error('Erro ao carregar vídeos');
                }
                videos = await response.json();
                renderVideos();
            } catch (error) {
                console.error('Erro ao carregar vídeos:', error);
                showError('Erro ao carregar vídeos. Verifique se o servidor está rodando.');
            }
        }

        // Função para adicionar vídeo via API
        async function addVideoToAPI(url, title, author, description) {
            try {
                const response = await fetch(`${API_URL}/addvideo`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ url, title, author, description })
                });

                const result = await response.json();
                
                if (!response.ok) {
                    throw new Error(result.error || 'Erro ao adicionar vídeo');
                }

                showSuccess('Vídeo adicionado com sucesso!');
                loadVideos(); // Recarregar a lista
                return result;
            } catch (error) {
                console.error('Erro ao adicionar vídeo:', error);
                showError(error.message);
                throw error;
            }
        }

        // Função para remover vídeo


        // Função para criar um card de vídeo
        function createVideoCard(video, index) {
            return `
                <div class="video-card" style="animation-delay: ${index * 0.1}s">
                    <div class="video-wrapper">
                        <iframe 
                            src="https://www.youtube.com/embed/${video.youtubeId}?rel=0&modestbranding=1" 
                            title="${video.title}"
                            allowfullscreen>
                        </iframe>
                    </div>
                    <h3 class="video-title">${video.title}</h3>
                    <p class="video-description">Por: <strong>${video.author}</strong></p>
                    ${video.description ? `<p class="video-extra-desc">${video.description}</p>` : ''}
                </div>
            `;
        }

        // Função para renderizar os vídeos
        function renderVideos() {
            const container = document.getElementById('videosContainer');
            
            if (videos.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <h3>🎥 Nenhum vídeo ainda</h3>
                        <p>Use o formulário abaixo para adicionar vídeos à sua eletiva!</p>
                    </div>
                `;
                return;
            }

            const videosHTML = videos
                .map((video, index) => createVideoCard(video, index))
                .join('');

            container.innerHTML = `<div class="videos-grid">${videosHTML}</div>`;
        }

        // Funções para mostrar mensagens
        function showSuccess(message) {
            showMessage(message, 'success');
        }

        function showError(message) {
            showMessage(message, 'error');
        }

        function showMessage(message, type) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${type}`;
            messageDiv.textContent = message;
            messageDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 10px;
                color: white;
                font-weight: bold;
                z-index: 1000;
                animation: slideIn 0.3s ease-out;
                ${type === 'success' ? 'background: #27ae60;' : 'background: #e74c3c;'}
            `;
            
            document.body.appendChild(messageDiv);
            
            setTimeout(() => {
                messageDiv.remove();
            }, 3000);
        }

        // Inicializar a aplicação
        document.addEventListener('DOMContentLoaded', () => {
            loadVideos()
            // Event listener para o formulário
            document.getElementById('videoForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const url = document.getElementById('videoUrl').value.trim();
                const title = document.getElementById('videoTitle').value.trim();
                const author = document.getElementById('videoAuthor').value.trim();
                const description = document.getElementById('videoDescription').value.trim();
                
                if (!url) {
                    showError('URL ou ID do vídeo é obrigatório!');
                    return;
                }
                
                try {
                    await addVideoToAPI(url, title, author, description);
                    // Limpar formulário
                    document.getElementById('videoForm').reset();
                } catch (error) {
                    // Erro já tratado na função addVideoToAPI
                }
            });
        });