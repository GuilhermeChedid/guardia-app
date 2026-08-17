export const isValidEmail = (value = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const isStrongPassword = (value = '') => value.length >= 8;

export const isValidCPF = (value = '') => {
    const cleaned = value.replace(/\D/g, '');

    if (cleaned.length !== 11 || /^\d{11}$/.test(cleaned) === false) return false;

    const digits = cleaned.split('').map(Number);
    const calcDigit = (sliceLength) => {
        let sum = 0;
        for (let i = 0; i < sliceLength; i += 1) {
            sum += digits[i] * (sliceLength + 1 - i);
        }
        const remainder = (sum * 10) % 11;
        return remainder === 10 ? 0 : remainder;
    };

    if (digits[9] !== calcDigit(9) || digits[10] !== calcDigit(10)) {
        return false;
    }

    return true;
};

export const isValidCEP = (value = '') => value.replace(/\D/g, '').length === 8;
