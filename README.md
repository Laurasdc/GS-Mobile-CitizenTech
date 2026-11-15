# Bairro em Dia — Mobile

App em Expo, React Native e TypeScript para consultar problemas nos espaços públicos de bairros de qualquer cidade do Brasil.

## Funcionalidades

- Listagem pública com filtros de UF, cidade, bairro, categoria e situação.
- Cadastro de ocorrências com título, categoria, descrição, UF, cidade, bairro e endereço.
- Detalhes, localização, situação atual e histórico de acompanhamento.
- Meus relatos: consulta dos registros da sua conta e edição de relatos próprios ainda abertos.
- Temas claro, escuro neutro e do dispositivo, com preferência salva.
- Cadastro por nome, e-mail e senha; entrar, consultar sua conta e sair.
- Retorno ao relato após login solicitado para participar.
- Confirmação “Também sou afetado” vinculada à conta autenticada, sem duplicação e sem confirmar seu próprio relato.
- Interface adaptável a PC e celular, com labels de acessibilidade e mensagens de carregamento/erro.

A consulta não exige conta. Registrar problemas e confirmar relatos exigem uma sessão. O cadastro usa a identidade autenticada na API, sem pedir um identificador de usuário no formulário.

## Executar

Requer Node compatível com Expo SDK 58 e a API C# atualizada, com a migration `AdicionaAutenticacao` aplicada.

```powershell
npm install
npx expo start --clear
```

Pressione `w` no terminal do Expo para abrir a versão web. A URL local esperada é `http://localhost:8081`, permitida no CORS e na validação de origem da API.

A API padrão é `http://localhost:5239/api`. Para usar outro endereço, crie `.env.local`:

```dotenv
EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:5239/api
```

Essa variável é pública e contém somente a URL, nunca senhas/tokens. No iPhone, `localhost` aponta para o próprio aparelho: use o IP do PC, com API acessível na rede e ambos conectados à mesma rede. A URL deve terminar em `/api`. Reinicie o Expo após mudar a variável.

## Conta e sessão

Crie uma conta do **Bairro em Dia** pelo botão Entrar → Criar conta. Ela é independente da conta do Expo. Os usuários antigos de demonstração da API não possuem senha.

No navegador, a sessão usa cookie HttpOnly e o token não é exposto ao JavaScript nem armazenado no AsyncStorage. No app nativo, o token é salvo no Expo SecureStore. A sessão expira em 8 horas e o logout a revoga na API. A preferência de aparência continua salva ao sair.

As senhas não são armazenadas pelo app. Não há recuperação de senha, verificação de e-mail ou login social nesta etapa. Alterar status é uma operação do perfil Gestor na API; o cadastro público concede somente o perfil Morador.

## Validação

```powershell
npx tsc --noEmit
npx expo lint
npx expo export --platform web
```

O fluxo web pode ser testado consultando sem login, abrindo um relato de outra pessoa, criando conta, confirmando a ocorrência, recarregando e saindo da conta. O cadastro e o login requerem a API rodando. O SecureStore nativo requer conferência no aparelho.

## Registrar um problema

Use **Registrar problema** no início, na lista ou na sua conta. Quem ainda não entrou pode fazer login ou criar conta e voltar ao formulário. O envio só acontece quando a pessoa toca em **Enviar relato**.

Todos os campos são obrigatórios. Os limites de texto e as categorias seguem o contrato da API. Depois de salvar, o app abre os detalhes com uma confirmação de envio; o relato aparece na lista com a situação **Registrada** e vinculado ao autor da sessão.

O rascunho fica apenas em memória durante a navegação na aba/app, separado por conta. Ele sobrevive à ida ao login quando a sessão termina, mas é perdido ao recarregar a página ou reiniciar o app e é limpo após o envio bem-sucedido. Uma conta diferente não vê o rascunho anterior. Não há gravação automática de endereço no armazenamento local.

Em falha de conexão, os campos são mantidos. Como um envio interrompido pode ter sido processado pela API, a interface oferece conferir a lista antes de reenviar. O botão é bloqueado enquanto há envio em andamento, inclusive para cliques repetidos.

O formulário de criação usa o contrato de API existente. Na validação web, foram conferidos: bloqueio de campos vazios sem chamar a API, login e retorno, sessão expirada com recuperação do rascunho, falha de rede, clique repetido, criação única em SQLite com autor correto, abertura dos detalhes e limpeza do rascunho. O formulário também foi inspecionado em largura de celular no navegador; falta validar o teclado e os controles no aparelho físico.

## Meus relatos e edição

Abra **Meus relatos** na navegação inferior ou na sua conta. A lista exige login e consulta um endpoint autenticado específico; ela mostra somente seus registros, incluindo os encerrados. A API precisa incluir `GET /api/ocorrencias/minhas`.

Use **Editar relato** na lista ou **Editar meu relato** nos detalhes. Os campos vêm preenchidos. **Salvar alterações** atualiza a mesma ocorrência sem modificar autor, situação ou confirmações. Relatos encerrados continuam disponíveis para consulta, com edição bloqueada. Acessar diretamente a edição de um relato de outra pessoa também é bloqueado.

O rascunho em memória é separado por conta e por operação: um relato em edição não altera o formulário de novo relato nem outro relato. Se a sessão expirar, faça login na mesma conta para continuar. **Cancelar e voltar aos detalhes** descarta o rascunho daquela edição. Recarregar a página ou reiniciar o app perde os rascunhos não salvos.

Validação web desta atualização: login e retorno à lista, isolamento entre duas contas, preenchimento da edição, um único PUT em clique repetido, atualização da lista, cancelamento, recuperação após expiração e bloqueio de relatos encerrados/de outro autor. O cadastro de novas ocorrências também foi revalidado após compartilhar o formulário. TypeScript, lint e exportação web passaram. O layout foi conferido em largura de celular no navegador; teclado e controles nativos ainda precisam de conferência no aparelho. Não há dependências ou migrations novas.
