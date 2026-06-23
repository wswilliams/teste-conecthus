# Conecthus Mobile (React Native)

Aplicativo mobile com React Native (Expo) integrado com a API NestJS do projeto.

## Funcionalidades

- Login com persistencia de sessao usando AsyncStorage
- Registro de usuario
- Listagem de tarefas
- Criacao de tarefa
- Edicao de tarefa
- Detalhes de tarefa
- Recebimento de notificacoes em tempo real via MQTT

## Requisitos

- Node.js 20+
- Expo CLI (via npx)
- App Expo Go no celular (ou emulador)

## Variaveis de ambiente

Use variaveis `EXPO_PUBLIC_*` para customizar endpoints:

- `EXPO_PUBLIC_API_URL` (default: `http://localhost:3000/api`)
- `EXPO_PUBLIC_MQTT_URL` (default: `ws://localhost:9001/mqtt`)

Observacao: para MQTT em app mobile com este cliente JS, o broker precisa expor WebSocket.

## Execucao

```bash
cd mobile
npm install
npm run start
```

Depois, abra no dispositivo via Expo Go.

## Fluxo MQTT

- O app assina o topico:
  - `notifications/users/{userId}/tasks`
- Ao receber evento, mostra alerta no app e recarrega a lista de tarefas.
