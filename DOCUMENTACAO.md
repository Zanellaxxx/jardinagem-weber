# Jardinagem Weber — Aplicativo Mobile

## Descrição

Aplicativo mobile desenvolvido para a empresa **Jardinagem Weber**, permitindo que clientes solicitem orçamentos de serviços de jardinagem diretamente pelo celular. A empresa recebe as solicitações, analisa e envia o orçamento pelo próprio app.

---

## Tecnologias Utilizadas

| Tecnologia | Versão | Finalidade |
|---|---|---|
| React Native | 0.81.5 | Framework mobile |
| Expo | ~54.0.35 | Plataforma de desenvolvimento |
| React Navigation | ^7.2.2 | Navegação entre telas |
| AsyncStorage | 2.2.0 | Persistência local de dados |
| expo-image-picker | ~17.0.11 | Câmera e galeria de fotos |
| expo-crypto | ~15.0.9 | Hash das senhas |
| bcryptjs | ^3.0.3 | Hash adaptativo de senhas |
| NetInfo | 11.4.1 | Detecção de conexão e reconexão |
| @react-native-community/datetimepicker | 8.4.4 | Seleção de data e hora |
| EmailJS | 5.1.0 | Envio de e-mail via API |
| FormSubmit | API externa | Fallback de envio de e-mail via AJAX |
| ESLint | ^9 | Análise estática |

---

## Funcionalidades

### Área do Cliente
- Cadastro e login com validação de campos
- Mensagem de sucesso ao criar conta
- Visualização dos 6 serviços oferecidos
- Solicitação de orçamento com fluxo completo:
  - Seleção de data e horário
  - Informação do endereço
  - Anexo de até 5 fotos (câmera ou galeria)
  - Tela de confirmação com resumo completo
- Acompanhamento das solicitações e seus status
- Visualização do orçamento enviado pela empresa
- Aceite ou recusa do orçamento com seleção da forma de pagamento
- Cancelamento com antecedência mínima de quatro horas
- Visualização das evidências do serviço concluído
- Avaliação única com nota de 1 a 5 e comentário
- Recuperação de senha com código temporário

### Área Administrativa (Empresa)
- Login exclusivo para o administrador
- Painel com todas as solicitações recebidas
- Indicadores completos, incluindo conversão de orçamentos
- Detalhes completos de cada solicitação (fotos, endereço, observações)
- Envio de orçamento com valor e descrição detalhada obrigatórios, retornando ao painel após salvar
- Confirmação somente após o aceite do cliente
- Início e conclusão do serviço com evidências
- Registro do status do pagamento e visualização da avaliação

### Integração com API
- **EmailJS/FormSubmit**: ao confirmar uma solicitação, o app envia automaticamente um e-mail de notificação para a empresa com todos os dados do pedido. Se o EmailJS não estiver configurado, usa FormSubmit sem abrir nova guia.

---

## Arquitetura do Projeto

```
jardinagem-weber/
├── App.js                          # Ponto de entrada, inicialização do EmailJS quando configurado
├── index.js                        # Registro do componente raiz
├── app.json                        # Configurações do Expo
├── src/
│   ├── constants/
│   │   ├── colors.js               # Paleta de cores do tema
│   │   ├── services.js             # Lista dos 6 serviços oferecidos
│   │   ├── requestStatus.js        # Status das solicitações
│   │   └── payment.js              # Formas e status de pagamento
│   ├── context/
│   │   ├── AuthContext.js          # Estado da autenticação
│   │   ├── RequestsContext.js      # Estado das solicitações
│   │   └── SyncContext.js          # Estado de conexão e alterações locais
│   ├── repositories/               # Acesso centralizado ao AsyncStorage
│   ├── services/                   # Regras de autenticação e solicitações
│   ├── components/
│   │   ├── Button.js               # Botão reutilizável (primary/outline)
│   │   ├── Input.js                # Campo de texto com label e erro
│   │   └── StatusBadge.js          # Identificação visual dos status
│   ├── navigation/
│   │   ├── AuthNavigator.js        # Navegação das telas de autenticação
│   │   ├── AppNavigator.js         # Navegação do cliente autenticado
│   │   └── AdminNavigator.js       # Navegação do painel administrativo
│   └── screens/
│       ├── auth/
│       │   ├── LoginScreen.js
│       │   ├── RegisterScreen.js
│       │   └── ForgotPasswordScreen.js
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
Informa endereço                     Envia orçamento detalhado
   |                                      |
Anexa fotos (opcional)               Aguarda decisão do cliente
   |                                      |
Confirma solicitação ──── e-mail ──► Empresa notificada
   |                                      |
Aceita/recusa orçamento              Confirma e inicia o serviço
   |                                      |
Acompanha e pode cancelar            Conclui anexando evidências
   |
Avalia o serviço concluído
```

---

## Status das Solicitações

| Status | Descrição |
|---|---|
| ⏳ Aguardando orçamento | Solicitação enviada, empresa ainda não respondeu |
| 💰 Orçamento recebido | Empresa enviou o valor do orçamento |
| ✅ Orçamento aceito | Cliente aceitou o orçamento e escolheu a forma de pagamento |
| ❌ Orçamento recusado | Cliente ou empresa recusou a solicitação |
| 📅 Confirmado/agendado | Empresa confirmou após o aceite do cliente |
| 🔄 Em andamento | Serviço foi iniciado |
| 🚫 Cancelado | Cliente cancelou respeitando a antecedência mínima |
| ✅ Concluído | Empresa concluiu com evidências anexadas |
| ⭐ Avaliado | Cliente registrou uma avaliação única |

---

## Serviços Disponíveis

1. 🌿 Corte de Grama
2. ✂️ Poda de Árvores
3. 🌱 Plantio
4. 🍃 Limpeza de Jardim
5. 🏡 Paisagismo
6. 💧 Irrigação

---

## Acesso administrativo

Para uso acadêmico, o app possui um administrador fixo:

- E-mail: `admin@jardinagemweber.com`
- Senha: `Admin1234`

Também é possível provisionar outros administradores pelas variáveis
`EXPO_PUBLIC_ADMIN_EMAIL`, `EXPO_PUBLIC_ADMIN_PASSWORD_HASH`,
`EXPO_PUBLIC_ADMIN_NAME` e `EXPO_PUBLIC_PROVIDER_ADMINS_JSON`.

### Cliente
- Cadastro pelo próprio app (nome, e-mail, telefone, senha)

---

## Configuração Local

Copie as variáveis de `.env.example` para um arquivo `.env` antes de iniciar o app.

- `EXPO_PUBLIC_ADMIN_EMAIL`, `EXPO_PUBLIC_ADMIN_PASSWORD_HASH` e `EXPO_PUBLIC_ADMIN_NAME` configuram o administrador local.
- `EXPO_PUBLIC_PROVIDERS_JSON` configura prestadores adicionais.
- `EXPO_PUBLIC_PROVIDER_ADMINS_JSON` configura administradores associados aos prestadores.
- `EXPO_PUBLIC_COMPANY_EMAIL` define o destinatário dos e-mails. As variáveis `EXPO_PUBLIC_EMAILJS_*` habilitam o envio pelo EmailJS; sem elas, o app usa FormSubmit.
- `EXPO_PUBLIC_SYNC_API_URL` habilita a fila de sincronização e o envio automático das operações pendentes.

Gere o hash administrativo com:

```bash
npm run admin:hash -- "sua-senha"
```

O comando já retorna a linha pronta para o `.env`, com os caracteres `$` escapados
para evitar a expansão de variáveis realizada pelo Expo.

---

## Autenticação e Recuperação de Senha

- E-mails são normalizados antes do cadastro e login.
- A senha deve ter no mínimo 8 caracteres, contendo letras e números.
- Senhas são armazenadas com bcrypt e fator de custo 10.
- Senhas antigas em SHA-256 com salt ou texto puro são migradas para bcrypt após o primeiro login válido.
- Login incorreto exibe a mensagem única `Usuário ou senha inválidos`.
- A recuperação valida o e-mail cadastrado, gera um código temporário válido por 15 minutos e envia por EmailJS ou FormSubmit.
- O código é invalidado após o uso e um novo pedido invalida o código anterior.

---

## Regras das Solicitações

1. A empresa envia orçamento com valor válido e descrição detalhada.
2. O cliente aceita ou recusa o orçamento.
3. A empresa só pode confirmar após o aceite do cliente.
4. O cliente pode cancelar estados elegíveis com no mínimo quatro horas de antecedência.
5. A conclusão exige ao menos uma imagem de evidência.
6. O cliente pode avaliar o serviço concluído uma única vez, com nota de 1 a 5 e comentário.

As imagens de conclusão ficam separadas das imagens anexadas na solicitação inicial.
As fotos anexadas são armazenadas como data URI/base64 no AsyncStorage para que
continuem visíveis no painel administrativo depois da troca de perfil ou recarga.

---

## Pagamentos

O cliente escolhe uma forma de pagamento ao aceitar o orçamento:

- Pix
- Cartão de crédito
- Cartão de débito
- Dinheiro

O sistema registra forma e status do pagamento. Pagamentos em dinheiro são marcados como pagos na conclusão do serviço. Não são armazenados dados sensíveis de cartão.

---

## Prestadores

- Prestadores possuem entidade própria com identificador, nome, tipo e estado ativo.
- O cliente seleciona o prestador na confirmação da solicitação.
- Cada solicitação, administrador e avaliação fica associado a um `providerId`.
- Para simplificar o uso acadêmico, o painel administrativo mostra todas as solicitações.
- A camada de contexto bloqueia ações administrativas para usuários não administradores e ações de cliente para solicitações de outro cliente.
- Prestadores e administradores adicionais podem ser configurados pelas variáveis descritas em `.env.example`.

---

## Persistência de Dados

O app utiliza **AsyncStorage** por meio de repositories, sem chamadas diretas nas telas.
As regras de autenticação e solicitações ficam centralizadas em services.

| Chave | Conteúdo |
|---|---|
| `@jardinagem_weber:users` | Lista de usuários cadastrados |
| `@jardinagem_weber:session` | Identificador do usuário logado |
| `@jardinagem_weber:requests` | Todas as solicitações |
| `@jardinagem_weber:sync_queue` | Histórico de alterações locais quando `EXPO_PUBLIC_SYNC_API_URL` está configurado |
| `@jardinagem_weber:providers` | Prestadores cadastrados |

O `SyncContext` utiliza NetInfo para identificar conexão e reconexão. Quando
`EXPO_PUBLIC_SYNC_API_URL` está configurado, alterações locais entram na fila e o
`SyncService` tenta enviá-las para `EXPO_PUBLIC_SYNC_API_URL/sync`. Operações
concluídas são removidas; falhas registram quantidade de tentativas e último erro.
Sem URL de sincronização, as alterações ficam somente no AsyncStorage local.

Repositories emitem eventos internos após alterações. Dessa forma, dashboards, listas
e detalhes são atualizados imediatamente sem depender de navegação ou recarga manual.

---

## Desempenho

- Repositories mantêm cache em memória para evitar leituras repetidas do AsyncStorage.
- Atualizações são distribuídas por eventos internos, evitando recargas por foco de tela.
- Listas usam `FlatList`, chaves estáveis e cards memoizados.
- Filtros, ordenações, métricas e avaliações médias usam memoização.
- Callbacks de navegação reutilizados evitam recriação desnecessária de propriedades.
- Layouts limitam largura e quantidade de colunas conforme o tamanho da tela.

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

## API Externa — E-mail

O app integra com **EmailJS** para envio de notificações por e-mail. Se as
chaves do EmailJS não estiverem configuradas, usa **FormSubmit** via AJAX como
fallback, sem abrir nova guia.

**Quando é disparado:**
- Ao cliente confirmar uma solicitação de orçamento.
- Ao cliente pedir recuperação de senha.

**Dados enviados no e-mail:**
- Nome e contato do cliente
- Serviço solicitado
- Data e horário preferidos
- Endereço completo
- Observações
- Quantidade de fotos anexadas

**Configuração:** defina `EXPO_PUBLIC_COMPANY_EMAIL` com um e-mail real.
Opcionalmente, utilize `EXPO_PUBLIC_EMAILJS_PUBLIC_KEY`,
`EXPO_PUBLIC_EMAILJS_SERVICE_ID`, `EXPO_PUBLIC_EMAILJS_TEMPLATE_ID`,
`EXPO_PUBLIC_EMAILJS_RESET_TEMPLATE_ID` e `EXPO_PUBLIC_COMPANY_NAME`.

Na primeira submissão feita pelo FormSubmit, o destinatário pode receber um
e-mail de ativação. Depois da confirmação, os próximos envios chegam direto.

### Templates do EmailJS

Crie um serviço de e-mail no EmailJS e dois templates:

1. Template de nova solicitação, informado em `EXPO_PUBLIC_EMAILJS_TEMPLATE_ID`.
2. Template de recuperação de senha, informado em `EXPO_PUBLIC_EMAILJS_RESET_TEMPLATE_ID`.

No template de nova solicitação, configure o destinatário como `{{to_email}}` e use as variáveis:

```text
to_email
to_name
service_name
client_name
client_email
client_phone
scheduled_date
scheduled_time
address
observations
photos_count
provider_name
```

No template de recuperação de senha, configure o destinatário como `{{to_email}}` e use as variáveis:

```text
to_email
to_name
reset_code
expires_in_minutes
```

Depois de alterar o `.env`, reinicie o Expo para as variáveis públicas serem carregadas.

---

## Verificação do Projeto

```bash
npm install
npx expo-doctor
npx expo export --platform web
npm run dead-code
npm run dead-deps
npm audit
npm run lint
npm run start
npm run android
npm run ios
npm run web
```

O projeto possui lint configurado em `npm run lint`, mas ainda não possui testes automatizados.

O relatório requisito por requisito está em `RELATORIO_ADERENCIA_FINAL.md`.
