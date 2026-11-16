import { setAppIcon as setNativeAppIcon } from 'expo-dynamic-app-icon';

const ICON_ALIASES = ['guardia', 'calculator', 'guide', 'files'];

export async function setAppIcon(name) {
    if (!ICON_ALIASES.includes(name)) {
        throw new Error(`Ícone do aplicativo inválido: ${name}`);
    }

    return setNativeAppIcon(name);
}
