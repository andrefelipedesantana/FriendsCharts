# FriendsCharts 🎵🏆

Construí um projeto chamado **FriendsCharts** onde um grupo de amigos pode visualizar coletivamente um ranking semanal de músicas, artistas e álbuns mais ouvidos entre eles. A aplicação consome a API pública do **Last.fm** para buscar os dados de escuta de cada usuário cadastrado, agrega tudo em um ranking unificado e exibe um painel visual elegante com os charts da semana — similar ao estilo do Spotify Wrapped, mas em tempo real e colaborativo.

Além da visualização, é possível **exportar o ranking como imagem** para compartilhar com os amigos.

> ⚠️ **Importante:** Os nomes de usuário do Last.fm estão hardcodados no arquivo `src/constants/index.ts`. Quem for replicar o projeto deve substituí-los pelos usernames do Last.fm do seu próprio grupo de amigos.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4
- **Componentes UI:** shadcn/ui, Radix UI
- **Ícones:** Lucide React
- **Requisições HTTP:** Axios
- **Exportação de imagem:** html-to-image, html2canvas
- **API de dados musicais:** Last.fm API
- **Linguagem:** TypeScript

---

## ⚙️ Como configurar e rodar localmente

Siga os passos abaixo para rodar a aplicação na sua máquina:

**Clone o repositório:**

```bash
git clone https://github.com/seu-usuario/friendcharts.git
cd friendcharts
```

**Instale as dependências:**

```bash
npm install
```

**Configure as variáveis de ambiente:** Crie um arquivo `.env` na raiz do projeto e adicione a sua chave de API do Last.fm:

```env
NEXT_PUBLIC_LASTFM_API_KEY=sua_chave_aqui
```

> Você pode obter uma chave gratuita em [https://www.last.fm/api/account/create](https://www.last.fm/api/account/create)

**Configure os usuários do seu grupo:** Abra o arquivo `src/constants/index.ts` e substitua a lista `users` pelos usernames do Last.fm dos seus amigos:

```ts
export const users = ["username1", "username2", "username3", ...];
```

**Inicie o servidor de desenvolvimento:**

```bash
npm run dev
```

**Acesse no navegador:** Abra [http://localhost:3000](http://localhost:3000) para ver o site funcionando.

---

## 🎯 Como funciona

A lógica principal do FriendsCharts é simples e eficiente:

1. **Coleta de dados:** Para cada usuário cadastrado na lista, a aplicação faz uma chamada à API do Last.fm buscando as top músicas, artistas e álbuns da **última semana** (`period: 7day`).

2. **Agregação:** Os dados de todos os usuários são combinados. As contagens de plays de músicas, artistas e álbuns iguais são somadas, formando um ranking coletivo do grupo.

3. **Destaques:** Para cada item do ranking, a aplicação identifica automaticamente quem foi o **top listener** — ou seja, o usuário do grupo que mais ouviu aquela música ou artista específico.

4. **Ranking de ouvintes:** Um placar mostra os 3 usuários do grupo com mais plays na semana, criando uma competição saudável entre os amigos.

5. **Exportação:** Um botão permite exportar o ranking visual como imagem PNG para ser compartilhado facilmente.

---

## 📂 Estrutura do Projeto

```
src/
├── app/
│   ├── api/
│   │   ├── top-artists/    # Endpoint para ranking de artistas
│   │   ├── top-tracks/     # Endpoint para ranking de músicas
│   │   └── top-albums/     # Endpoint para ranking de álbuns
│   ├── page.tsx            # Página principal com todos os rankings
│   └── globals.css
├── components/
│   ├── ranking/            # Componentes de cada ranking (artistas, músicas, álbuns, top listener)
│   ├── export-button.tsx   # Botão de exportação como imagem
│   └── export-view.tsx     # Layout renderizado para exportação
├── constants/
│   └── index.ts            # ⭐ Lista de usuários e configurações globais
├── lib/
│   └── aggregators/        # Lógica de agregação dos dados por categoria
├── services/               # Chamadas à API do Last.fm por categoria
└── types/                  # Tipagens TypeScript
```

---

## 🔑 Obtendo a chave de API do Last.fm

1. Crie uma conta gratuita em [last.fm](https://www.last.fm)
2. Acesse [https://www.last.fm/api/account/create](https://www.last.fm/api/account/create)
3. Preencha o formulário e copie a **API Key** gerada
4. Cole no seu arquivo `.env` como `NEXT_PUBLIC_LASTFM_API_KEY`

---

## 👥 Adicionando/removendo usuários do grupo

O único arquivo que você precisa editar para personalizar o seu grupo é o [`src/constants/index.ts`](./src/constants/index.ts):

```ts
export const users = [
  "seu_username_lastfm",
  "username_do_amigo_1",
  "username_do_amigo_2",
  // adicione quantos quiser...
];
```

> Todos os usuários precisam ter uma conta ativa no Last.fm com o **scrobbling habilitado** para que seus dados apareçam no ranking.

---

## 🚀 Deploy

O projeto está pronto para ser publicado no **Vercel**. Basta conectar o repositório e configurar a variável de ambiente `NEXT_PUBLIC_LASTFM_API_KEY` nas configurações do projeto.

O app detecta automaticamente a URL do Vercel via a variável `VERCEL_URL` para o correto funcionamento das chamadas de API internas.
