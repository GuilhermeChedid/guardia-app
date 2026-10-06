const BLOCKED_NAME_TERMS = [
    'apelido',
    'anonimo',
    'anonymous',
    'fake',
    'nick',
    'teste',
    'test',
    'usuario',
    'user',
    'caralho',
    'cu',
    'fodase',
    'foder',
    'merda',
    'porra',
    'puta',
    'puto',
    'viado',
    'vadia',
    'vagabundo',
    'idiota',
    'imbecil',
    'retardado',
];

const normalizeName = (value = '') =>
    value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

export const validateFullName = (value = '') => {
    const name = value.trim().replace(/\s+/g, ' ');
    const parts = name.split(' ');
    const normalizedParts = parts.map(normalizeName);

    if (parts.length < 2 || parts.some((part) => part.length < 2)) {
        return 'Informe seu nome completo, com nome e sobrenome.';
    }

    if (!/^[A-Za-zÀ-ÿ]+(?:['-][A-Za-zÀ-ÿ]+)?(?:\s+[A-Za-zÀ-ÿ]+(?:['-][A-Za-zÀ-ÿ]+)?)+$/.test(name)) {
        return 'O nome deve conter apenas letras, espaços, hífen ou apóstrofo.';
    }

    if (normalizedParts.some((part) => BLOCKED_NAME_TERMS.includes(part))) {
        return 'Informe um nome real, sem apelidos ou termos ofensivos.';
    }

    return null;
};
