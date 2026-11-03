export const validarCPF = (cpf) => {
    const numeros = String(cpf || '').replace(/\D/g, '');

    if (numeros.length !== 11) return false;

    if (/^(\d)\1{10}$/.test(numeros)) return false;

    let soma = 0;

    for (let i = 0; i < 9; i++) {
        soma += Number(numeros[i]) * (10 - i);
    }

    let primeiroDigito = (soma * 10) % 11;

    if (primeiroDigito === 10) primeiroDigito = 0;

    if (primeiroDigito !== Number(numeros[9])) {
        return false;
    }

    soma = 0;

    for (let i = 0; i < 10; i++) {
        soma += Number(numeros[i]) * (11 - i);
    }

    let segundoDigito = (soma * 10) % 11;

    if (segundoDigito === 10) segundoDigito = 0;

    return segundoDigito === Number(numeros[10]);
};