

// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const serverless = require('serverless-http');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Para servir arquivos estáticos

mongoose.connect('mongodb+srv://gamespagos01:ZTZTMNHELIO%4023a@cluster0.9z1vj6v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('🟢 Conectado ao MongoDB'))
  .catch(err => console.error('🔴 Erro ao conectar ao MongoDB:', err));


// Schema do vídeo
const videoSchema = new mongoose.Schema({
    youtubeId: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
});

const Video = mongoose.model('Video', videoSchema);

// Função para extrair ID do YouTube
function extractYouTubeId(url) {
    const regexes = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
        /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (let regex of regexes) {
        const match = url.match(regex);
        if (match) {
            return match[1];
        }
    }
    return null;
}

// Função para buscar info do vídeo no YouTube (simulada - você pode integrar com YouTube Data API)
function getVideoTitle(videoId) {
    // Aqui você pode integrar com a YouTube Data API para pegar o título real
    // Por enquanto, retorna um título genérico
    return `Vídeo ${videoId.substring(0, 8)}`;
}

// Rotas da API

// GET /api/videos - Buscar todos os vídeos
app.get('/api/videos', async (req, res) => {
    try {
        const videos = await Video.find().sort({ addedAt: -1 });
        res.json(videos);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar vídeos', details: error.message });
    }
});

// POST /api/addvideo - Adicionar novo vídeo
app.post('/api/addvideo', async (req, res) => {
    try {
        const { url, title, author, description } = req.body;

        // Validação básica
        if (!url) {
            return res.status(400).json({ error: 'URL ou ID do vídeo é obrigatório' });
        }

        // Extrair ID do YouTube
        const youtubeId = extractYouTubeId(url);
        if (!youtubeId) {
            return res.status(400).json({ error: 'URL ou ID do YouTube inválido' });
        }

        // Verificar se o vídeo já existe
        const existingVideo = await Video.findOne({ youtubeId });
        if (existingVideo) {
            return res.status(409).json({ error: 'Vídeo já existe na base de dados' });
        }

        // Criar novo vídeo
        const newVideo = new Video({
            youtubeId,
            title: title || getVideoTitle(youtubeId),
            author: author || 'Participante da Eletiva',
            description: description || ''
        });

        await newVideo.save();
        res.status(201).json({ 
            message: 'Vídeo adicionado com sucesso!', 
            video: newVideo 
        });

    } catch (error) {
        if (error.code === 11000) {
            res.status(409).json({ error: 'Vídeo já existe na base de dados' });
        } else {
            res.status(500).json({ error: 'Erro ao adicionar vídeo', details: error.message });
        }
    }
});

// DELETE /api/videos/:id - Remover vídeo
app.delete('/api/videos/:id', async (req, res) => {
    try {
        const video = await Video.findByIdAndDelete(req.params.id);
        if (!video) {
            return res.status(404).json({ error: 'Vídeo não encontrado' });
        }
        res.json({ message: 'Vídeo removido com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao remover vídeo', details: error.message });
    }
});

// PUT /api/videos/:id - Atualizar vídeo
app.put('/api/videos/:id', async (req, res) => {
    try {
        const { title, author, description } = req.body;
        const video = await Video.findByIdAndUpdate(
            req.params.id,
            { title, author, description },
            { new: true }
        );
        
        if (!video) {
            return res.status(404).json({ error: 'Vídeo não encontrado' });
        }
        
        res.json({ message: 'Vídeo atualizado com sucesso!', video });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar vídeo', details: error.message });
    }
});

// Rota para servir o frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get("/addvideos", (req,res)=>{
    res.sendFile(path.join(__dirname, "public", "addvideos.html"))
})

// Iniciar servidor
module.exports = app;
module.exports.handler = serverless(app);

// Tratamento de erros do MongoDB
mongoose.connection.on('connected', () => {
    console.log('✅ Conectado ao MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ Erro no MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('📤 Desconectado do MongoDB');
});