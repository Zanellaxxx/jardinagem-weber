# Jardinagem Weber — Aplicativo Mobile

## Descrição

Aplicativo mobile desenvolvido para a empresa **Jardinagem Weber**, permitindo que clientes solicitem orçamentos de serviços de jardinagem diretamente pelo celular. A empresa recebe as solicitações, analisa e envia o orçamento pelo próprio app.

---

## Tecnologias Utilizadas

| Tecnologia | Versão | Finalidade |
|---|---|---|
| React Native | 0.76.9 | Framework mobile |
| Expo | ~54.0.0 | Plataforma de desenvolvimento |
| React Navigation | ^7.2.2 | Navegação entre telas |
| AsyncStorage | 1.23.1 | Persistência local de dados |
| expo-image-picker | ~16.0.6 | Câmera e galeria de fotos |
| @react-native-community/datetimepicker | 8.2.0 | Seleção de data e hora |
| EmailJS | 5.1.0 | Envio de e-mail via API |

---

## Funcionalidades

### Área do Cliente
- Cadastro e login com validação de campos
- Visualização dos 6 serviços oferecidos
- Solicitação de orçamento com fluxo completo:
  - Seleção de data e horário
  - Informação do endereço
  - Anexo de até 5 fotos (câmera ou galeria)
  - Tela de confirmação com resumo completo
- Acompanhamento das solicitações e seus status
- Visualização do orçamento enviado pela empresa

### Área Administrativa (Empresa)
- Login exclusivo para o administrador
- Painel com todas as solicitações recebidas
- Indicadores: total, pendentes e confirmados
- Detalhes completos de cada solicitação (fotos, endereço, observações)
- Envio de orçamento com valor e mensagem para o cliente
- Confirmação ou recusa de agendamento

### Integração com API
- **EmailJS API**: ao confirmar uma solicitação, o app envia automaticamente um e-mail de notificação para a empresa com todos os dados do pedido.

---

## Arquitetura do Projeto

```
jardinagem-weber/
├── App.js                          # Ponto de entrada, inicialização do EmailJS
├── index.js                        # Registro do componente raiz
├── app.json                        # Configurações do Expo
├── src/
│   ├── constants/
│   │   ├── colors.js               # Paleta de cores do tema
│   │   └── services.js             # Lista dos 6 serviços oferecidos
│   ├── context/
│   │   ├── AuthContext.js          # Autenticação (login, cadastro, logout)
│   │   └── RequestsContext.js      # Gerenciamento de solicitações
│   ├── components/
│   │   ├── Button.js               # Botão reutilizável (primary/outline)
│   │   └── Input.js                # Campo de texto com label e erro
│   ├── navigation/
│   │   ├── AuthNavigator.js        # Navegação das telas de autenticação
│   │   ├── AppNavigator.js         # Navegação do cliente autenticado
│   │   └── AdminNavigator.js       # Navegação do painel administrativo
│   └── screens/
│       ├── auth/
│       │   ├── LoginScreen.js
│       │   └── RegisterScreen.js
│       ├── home/
│       │   └── HomeScreen.js
│       ├── services/
│       │   └── ServiceDetailScreen.js
│       ├── schedule/
│       │   ├── ScheduleScreen.js       # Seleção de data e horário
│       │   ├── LocationScreen.js       # Informação do endereço
│       │   ├── PhotosScreen.js         # Anexo de fotos
│       │   └── ConfirmationScreen.js   # Resumo e confirmação
│       ├── requests/
│       │   ├── MyRequestsScreen.js         # Lista de solicitações do cliente
│       │   └── MyRequestDetailScreen.js    # Detalhe com orçamento recebido
│       └── admin/
│           ├── AdminScreen.js              # Painel administrativo
│           └── RequestDetailScreen.js      # Gestão da solicitação
```

---

## Fluxo do Sistema

```
CLIENTE                              EMPRESA (ADMIN)
   |                                      |
Cadastro/Login                       Login admin
   |                                      |
Escolhe serviço                      Painel de solicitações
   |                                      |
Preenche data e horário              Visualiza detalhes
   |                                      |
Informa endereço                     Envia orçamento (valor + mensagem)
   |                                      |
Anexa fotos (opcional)               Confirma ou recusa
   |                                      |
Confirma solicitação ──── e-mail ──► Empresa notificada
   |
Acompanha status em
"Minhas Solicitações"
```

---

## Status das Solicitações

| Status | Descrição |
|---|---|
| ⏳ Aguardando orçamento | Solicitação enviada, empresa ainda não respondeu |
| 💰 Orçamento recebido | Empresa enviou o valor do orçamento |
| ✅ Confirmado | Agendamento confirmado pela empresa |
| ❌ Recusado | Solicitação recusada pela empresa |

---

## Serviços Disponíveis

1. 🌿 Corte de Grama
2. ✂️ Poda de Árvores
3. 🌱 Plantio
4. 🍃 Limpeza de Jardim
5. 🏡 Paisagismo
6. 💧 Irrigação

---

## Credenciais de Acesso

### Administrador (empresa)
- **E-mail:** admin@jardinagem.com
- **Senha:** admin123

### Cliente
- Cadastro pelo próprio app (nome, e-mail, telefone, senha)

---

## Armazenamento de Dados

O app utiliza **AsyncStorage** para persistência local, sem necessidade de servidor ou banco de dados externo. Todos os dados ficam armazenados no dispositivo:

| Chave | Conteúdo |
|---|---|
| `@jardinagem_weber:users` | Lista de usuários cadastrados |
| `@jardinagem_weber:session` | E-mail do usuário logado |
| `@jardinagem_weber:requests` | Todas as solicitações |

---

## Como Executar

### Pré-requisitos
- Node.js 20.x
- Expo Go instalado no celular **ou** emulador Android (Android Studio)

### Instalação
```bash
# Clonar o projeto
git clone <url-do-repositorio>
cd jardinagem-weber

# Instalar dependências
npm install

# Iniciar o projeto
npx expo start
```

### Rodar no emulador Android
```bash
npx expo start --android
```

### Rodar no celular físico
1. Instale o **Expo Go** na Play Store
2. Rode `npx expo start`
3. Escaneie o QR Code com o Expo Go

---

## API Externa — EmailJS

O app integra com a API do **EmailJS** para envio de notificações por e-mail.

**Quando é disparado:** ao cliente confirmar uma solicitação de orçamento.

**Dados enviados no e-mail:**
- Nome e contato do cliente
- Serviço solicitado
- Data e horário preferidos
- Endereço completo
- Observações
- Quantidade de fotos anexadas

**Configuração:** as credenciais estão definidas em `src/screens/schedule/ConfirmationScreen.js`.
