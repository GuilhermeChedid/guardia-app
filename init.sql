-- Habilita extensão para geração automática de UUID (recomendado para o PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. USUARIOS
-- ============================================================================
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(11) NOT NULL UNIQUE,
    estado_civil VARCHAR(50) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    url_foto_perfil VARCHAR(500),
    tema_claro BOOLEAN NOT NULL DEFAULT TRUE,
    em_emergencia BOOLEAN NOT NULL DEFAULT FALSE,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    termos_aceitos BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. SEGURANCA (Relacionamento 1:1)
-- ============================================================================
CREATE TABLE seguranca(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    senha VARCHAR(255) NOT NULL,
    pin_provas VARCHAR(255),
    tentativas_falhas_pin INT DEFAULT 0,
    bloqueio_pin_ate TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- 3. ENDERECO_USUARIO (Relacionamento 1:1)
-- ============================================================================
CREATE TABLE endereco (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    cep VARCHAR(8) NOT NULL,
    logradouro VARCHAR(255) NOT NULL,
    numero VARCHAR(50) NOT NULL,
    complemento VARCHAR(100),
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado_uf CHAR(2) NOT NULL
);

-- ============================================================================
-- 4. CONTATO_CONFIANCA (Relacionamento 1:N)
-- ============================================================================
CREATE TABLE contatos_confianca (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    relacao VARCHAR(50) NOT NULL,
    telefone VARCHAR(20) NOT NULL
);

-- ============================================================================
-- 5. EVIDENCIAS (Relacionamento 1:N)
-- ============================================================================
CREATE TABLE evidencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nome_arquivo VARCHAR(255) NOT NULL,
    tipo_arquivo VARCHAR(50) NOT NULL,
    tamanho_arquivo VARCHAR(50),
    duracao VARCHAR(50),
    url_arquivo VARCHAR(500) NOT NULL,
    descricao TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. TOKENS_RECUPERACAO (Relacionamento 1:N)
-- ============================================================================
CREATE TABLE tokens_recuperacao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    codigo VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    utilizado BOOLEAN NOT NULL DEFAULT FALSE,
    data_expiracao TIMESTAMP WITH TIME ZONE NOT NULL
);

-- ============================================================================
-- 7. POSTS (Publicações do Feed)
-- ============================================================================
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    autor_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    conteudo TEXT NOT NULL,
    imagem_url VARCHAR(500),
    data_publicacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 8. CURTIDAS_POSTS (Tabela Associativa N:M)
-- ============================================================================
CREATE TABLE curtidas (
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    data_curtida TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, usuario_id)
);

-- ============================================================================
-- 9. COMENTARIOS (Relacionamento 1:N com Posts e Usuários)
-- ============================================================================
CREATE TABLE comentarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    texto TEXT NOT NULL,
    data_comentario TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);