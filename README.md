# Bairro em Dia — Mobile

App em Expo, React Native e TypeScript para consultar problemas nos espaços públicos de bairros de qualquer cidade do Brasil.

## Funcionalidades

- Listagem pública com filtros de UF, cidade, bairro, categoria e situação.
- Detalhes, localização, situação atual e histórico de acompanhamento.
- Temas claro, escuro neutro e do dispositivo, com preferência salva.
- Cadastro por nome, e-mail e senha; entrar, consultar sua conta e sair.
- Retorno ao relato após login solicitado para participar.
- Confirmação “Também sou afetado” vinculada à conta autenticada, sem duplicação e sem confirmar seu próprio relato.
- Interface adaptável a PC e celular, com labels de acessibilidade e mensagens de carregamento/erro.

A consulta não exige conta. O formulário Mobile para registrar novas ocorrências é a próxima etapa; a API já protege esse cadastro.

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
