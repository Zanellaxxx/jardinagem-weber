# Jardinagem Weber — App Mobile
## Documento de Progresso

**Data da sessão:** 31/03/2026
**Progresso total:** ~30%

---

## O que foi feito nessa sessão

### Estrutura de pastas criada
```
JardinagemWeber/
├── App.js                          ← ponto de entrada atualizado
├── src/
│   ├── constants/
│   │   ├── colors.js               ← paleta de cores (tema verde)
│   │   └── services.js             ← lista dos 6 serviços oferecidos
│   ├── context/
│   │   └── AuthContext.js          ← gerenciamento de autenticação (mock local)
│   ├── components/
│   │   ├── Button.js               ← botão reutilizável (primary / outline)
│   │   └── Input.js                ← campo de texto reutilizável com label e erro
│   ├── navigation/
│   │   ├── AuthNavigator.js        ← navegação das telas de autenticação
│   │   └── AppNavigator.js         ← navegação do app autenticado
│   └── screens/
│       ├── auth/
│       │   ├── LoginScreen.js      ← tela de login
│       │   └── RegisterScreen.js   ← tela de cadastro
│       ├── home/
│       │   └── HomeScreen.js       ← home com grid de serviços
│       └── services/
│           └── ServiceDetailScreen.js  ← detalhes do serviço selecionado
```

### Dependências instaladas
| Pacote | Versão | Para que serve |
|---|---|---|
| `@react-navigation/native` | ^7.2.2 | Sistema de navegação |
| `@react-navigation/native-stack` | ^7.14.10 | Navegação em pilha (stack) |
| `react-native-screens` | ~4.16.0 | Otimização das telas nativas |
| `react-native-safe-area-context` | ~5.6.0 | Safe area (notch, barra de status) |
| `@react-native-async-storage/async-storage` | ^2.2.0 | Persistência local dos dados do usuário |

### Funcionalidades implementadas
- **Autenticação local:** cadastro salvo no AsyncStorage do dispositivo (sem backend real)
- **Fluxo de navegação:** se não logado → telas de Auth; se logado → telas do App
- **Login:** validação de campos, mensagens de erro, botão de loading
- **Cadastro:** nome, e-mail, telefone, senha e confirmação com validações
- **Home:** boas-vindas com nome do usuário, banner, grid 2 colunas com os 6 serviços
- **Detalhe do serviço:** ícone, descrição, passo-a-passo de como funciona, botão de orçamento (desabilitado — a implementar)

### Serviços cadastrados
1. Corte de Grama
2. Poda de Árvores
3. Plantio
4. Limpeza de Jardim
5. Paisagismo
6. Irrigação

---

## Onde parou — o que fazer na próxima sessão (70% restante)

### Prioridade 1 — Fluxo de solicitação de orçamento
**Arquivo:** `src/screens/schedule/ScheduleScreen.js` (criar)
**Ativar o botão:** `ServiceDetailScreen.js` linha 41 — substituir o `onPress={() => {}}` por `navigation.navigate('ScheduleScreen', { service })`
**Adicionar a rota em:** `AppNavigator.js` no bloco de comentário TODO

O formulário de agendamento deve conter:
- Seleção de data e horário (usar `@react-native-community/datetimepicker`)
- Campo de observações
- Botão de avançar para a localização

### Prioridade 2 — Localização via Google Maps
**Instalar:** `expo-location` e `react-native-maps`
**Criar:** `src/screens/schedule/LocationScreen.js`
**Configurar:** chave de API do Google Maps no `app.json`

O fluxo:
1. Solicitar permissão de localização
2. Mostrar mapa centrado na posição atual
3. Permitir arrastar o pin para ajustar o endereço
4. Salvar lat/lng e endereço formatado

### Prioridade 3 — Anexar fotos
**Instalar:** `expo-image-picker`
**Criar:** `src/screens/schedule/PhotosScreen.js`

O fluxo:
1. Botão para abrir câmera ou galeria
2. Preview das fotos selecionadas (máx. 5)
3. Botão para remover foto individual

### Prioridade 4 — Confirmação do orçamento
**Criar:** `src/screens/schedule/ConfirmationScreen.js`
Tela de resumo mostrando: serviço, localização, data/hora, fotos e botão "Confirmar Solicitação"

### Prioridade 5 — Backend / API real
Substituir o mock do `AuthContext.js`:
- Função `login()` linha 37: trocar por `fetch('URL_DA_API/auth/login', ...)`
- Função `register()` linha 30: trocar por `fetch('URL_DA_API/auth/register', ...)`

Criar `src/services/api.js` com as chamadas centralizadas.

### Prioridade 6 — Painel da empresa (admin)
Telas para a empresa Jardinagem Weber:
- Ver solicitações recebidas
- Enviar orçamento
- Confirmar/recusar agendamento
- Histórico de serviços

---

## Como rodar o projeto

```bash
# Instalar dependências (se necessário)
npm install

# Rodar no Expo Go
npx expo start

# Rodar no Android
npx expo start --android

# Rodar no iOS
npx expo start --ios
```

---

## Observações técnicas
- A autenticação atual é **local (mock)** — os dados ficam apenas no celular via AsyncStorage
- Não há backend ainda — toda integração de API está marcada com `TODO` no código
- O botão "Solicitar Orçamento" está **desabilitado** intencionalmente (aguarda a implementação do fluxo de agendamento)
- A paleta de cores está em `src/constants/colors.js` — fácil de ajustar se precisar mudar o visual
