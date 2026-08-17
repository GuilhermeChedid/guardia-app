# Guardia App

Aplicativo mobile para apoio e segurança, com fluxo de login, cadastro, emergência, perfil e suporte.

## Estrutura principal

- `.vscode/` — configurações recomendadas para o editor da equipe
- `src/components/` — componentes reutilizáveis (botão, input e modal)
- `src/constants/` — mensagens e identidade visual
- `src/navigation/` — navegação principal da aplicação
- `src/screens/` — telas do fluxo do app
- `src/services/` — integração com API
- `src/utils/` — validadores e máscaras

## Tecnologias

- React Native
- Expo
- React Navigation
- Axios

## Como executar

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o Metro Bundler:
   ```bash
   npm start
   ```
3. Em seguida, rode o app no emulador ou dispositivo:
   ```bash
   npm run android
   ```
   ou
   ```bash
   npm run ios
   ```

## Variáveis de ambiente

Edite o arquivo `.env` para configurar a URL da API:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

## Observações

Este projeto está organizado para evoluir com um padrão modular, facilitando a manutenção, teste e escalabilidade da aplicação.
