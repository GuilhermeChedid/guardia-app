const path = require('path');
const dotenv = require('dotenv');

// Tenta carregar o .env, mas não quebra se estiver usando variáveis injetadas pelo Docker
dotenv.config({
    path: path.resolve(__dirname, '.env'),
});
// Se o seu .env estiver na raiz do projeto fora da pasta src, ajuste conforme necessário, 
// mas garanta que o Docker está copiando ele corretamente.

const app = require('./app');

const PORT = process.env.PORT || 3000;

// O '0.0.0.0' é OBRIGATÓRIO para aceitar requisições de fora do container Docker
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});