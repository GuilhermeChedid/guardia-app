# Guardiã App

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
    ```bash
   npm run web
   ```

## Variáveis de ambiente

Edite o arquivo `.env` para configurar a URL da API:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
TELEGRAM_BOT_TOKEN=token-emitido-pelo-BotFather
TELEGRAM_BOT_USERNAME=nome_do_bot_sem_@
EXPO_PUBLIC_SOS_TEST_PHONE=+5561998171598
```

### Telegram no SOS

1. Crie um bot no Telegram usando o `@BotFather` e configure `TELEGRAM_BOT_TOKEN` e
   `TELEGRAM_BOT_USERNAME` somente no `.env` do backend.
2. Publique o backend em uma URL HTTPS e configure o webhook:
   `https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=https://SEU_HOST/api/auth/telegram/webhook`.
3. Na tela de contatos, escolha **Vincular ao Telegram**. O contato deve tocar em
   **Iniciar** uma única vez no bot.
4. Durante os testes, o SOS abre a ligação para `+55 61 99817-1598`. A ligação
   depende da confirmação do sistema telefônico; o Telegram é enviado automaticamente.
5. Se o app retornar HTTP 409 ao acionar o SOS, isso significa que nenhum contato
   concluiu o vínculo. No iOS pelo Expo Go, abra o link compartilhado no Telegram
   do contato e confirme **Iniciar** no bot antes de tentar novamente.

## Observações

Este projeto está organizado para evoluir com um padrão modular, facilitando a manutenção, teste e escalabilidade da aplicação.
