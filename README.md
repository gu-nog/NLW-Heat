# Trilha Expanse
## Aula 1(falhas em sistemas distribuídos):
Quando um nó(servidores, serviços, etc) não consegue ver outro, houve uma partição.

### Técnicas pra resolver:
- Retries: quando é um erro que pode ser resolvido só tentando novamente, executa de novo. <br />
Falhas em cascata: quando o erro se mantém com o tempo e um serviço que usa outro continua tentando fazer uma requisição repetidamente ele pode derrubar o serviço que antes funcionava <br /><br />
- Circuit Breaker: funciona como um disjuntor fechando o fluxo de requisições quando ocorre algum problema<br />
Estado 1(fechado) passa pro estado 2(aberto) quando um percentual(chamado threshold) das requisições feitas a ele são respondidas com falha, e o estado 2 passa pro estado 3(semiaberto) depois de um tempo de reset e nesse estado ele tenta responder algumas requisições e se tiverem retornando falha volta pro estado 2, já se tiver voltado a funcionar volta pro 1. <br />
Caminho que fica: client > circuit breaker > service. <br />
Quando você possui vários microsserviços é legal armazenar o estado de seus circuit breaker em um storage. <br />
Circuit breaker também pode pegar o N° de requests/s como “parametro”<br />
Reverse proxy: terceiriza quem possui o circuit breaker:
client > reverse proxy(que possui um circuit breaker) > serviço<br />
OBS: Você pode retornar também uma resposta padrão em vez de erro quando o estado é aberto<br />
Service mesh + sidecar proxy: uma proxy “conversa” com outras, que estão ligadas a um serviço e o service mesh controla as proxys
<br /><br />
### Conclusão:
- Falhas ocorrem e temos que saber lidar com elas. <br />
- Circuit breakers: logs e métricas, override manual(alguém que entende mesmo pode ativar e desativar uma chave), health check durante half-open, replay de falhas, concorrência: evitar bloqueios, resource differentiation, detecção de falhas(detectar se a falha é por ex de negócio ou não), bulkheading. <br />
- Raramente o circuit breaker pode representar um problema.
<br /><br />
# Trilha Impulse
## Aula 1(backend):
### Como criar um BD no prisma:
- Instalar o prisma: ```yarn add prisma -D```<br />
- Resolver erro que deu no meu, cria um arquivo .env, escrito:
```
PRISMA_CLIENT_ENGINE_TYPE = "binary"
PRISMA_CLI_QUERY_ENGINE_TYPE = binary
```
- Inicar: ```yarn prisma init```
- Preparações:<br />
No .env, apaga a linha de database_url, que é de um postgree.<br />
Configs de tabelas, BDs e outras coisas do prisma ficam em prisma>schema.prisma<br />
Deixe o datasource db com: provider = “sqlite” e url = “file:./dev.db”

#### Criar a tabela(em prisma>schema.prisma):
```
model User {
	id		String @id @default(uuid())
	name		String

	@@map(“users”)
} 
```
- users: como vai chamar a tabela
- User(user): como vai se referir a sua tabela
- Rodar a migration: ```yarn prisma migrate dev```
- Cria src>prisma>index.ts(pra conectar a migration com nossas funções):<br />
```
import { PrismaClient } from “@prisma/client”;
const prismaClient = new PrismaClient();
export default prismaClient;
Pra usar (no service), por ex:
const exemplo = await prismaClient.user.findFirst({
	where: {
		name: nome
	}
})
```
- Relacionar tabelas:<br />
Na nova tabela coloque: ```{nova coluna} {model com qual será relacionada}```<br />
Ex: Num model Message: ```user User```<br />
E salve o arquivo que deverá ficar, por ex, assim:<br />
No model User(após o ```@@map```): ```Message Message[]```<br />
No model Message:<br />
```user User @relation(fields: [userId], references: [id])```<br />
Após o ```@@map```: ```userId String```<br />
E você pode trocar: ```Message Message[]``` > ```messages Message[]``` e ```userId``` > ```user_id```<br />
Salvar com relação:<br />
```
await prismaClient.message.create({
	data: {text, user_id},
	include: {user: true}
})
```
Pra acessar dados dessa coluna, dá por ex: ```message.user.name```
- Ver coisas dos BDs do prisma: ```yarn prisma studio```

### Socket io
Ele nos ajudará a ligar o cliente ao servidor<br />
- Comunicação http: comunicação tem início e fim<br />
- Comunicação por websocket: comunicação constante
#### O cors é responsável por permitir ou bloquear conexões.
#### Como adicioná-lo:
Da add em socket.io e cors, da @types e importa Server de socket.io e http de http e cors de cors
- No app.ts:
```
const app = express();
app.use(cors());
const serverHttp = http.createServer(app);
const io = new Server(serverHttp, {
	cors: {origin: “*”} // Depois esse valor é mudado
});
io.on(“connection”, (socket) => {
	console.log(`Usuário conectado no socket ${socket.id}`);
});
app.use(express.json());
app.use(router);
…
export { serverHttp, io };
```
- Em public>index.html:
No body(2 scripts):
- 1°:
```
src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.0.1/socket.io.min.js"
integrity="sha512eVL5Lb9al9FzgR63gDs1MxcDS2wFu3loYAgjIH0+Hg38tCS8Ag62dwKyH+wzDb+QauDpEZjXbMn11blw8cbTJQ=="
crossorigin="anonymous"
```
- 2°:
```
const socket = io(“http://localhost:4000”);
socket.on(“new message”, (data) => console.log(data));
```
- Cria src/server.ts:
```
serverHttp.listen(4000, () =>
	console.log(“Server running”)
);
```
- No nosso service: 
```io.emit(“new_message”, infoWS)```
## Aula 2(frontend):
### Criar projeto de React JS: 
- Usaremos o Vite, onde podemos executar nosso código js, podendo usar, por exemplo o typescript também.
- Código para criar um projeto de ts e react(“web” é o nome do projeto): ```yarn create vite web --template react-ts```<br />
- Dentro do index.html criado existe apenas uma div, que possui tudo o que será mostrado.
- OBS: Todos componentes no React não são nada mais que funções que retornam HTMLs, que podem estar enfeitados com códigos js para trazerem interatividade.
### - Preparações:
- No src deixe só o vite-env.d.td, mais.tsx e o App.tsx.<br />
- No App.tsx: Apague todos imports, troque o export pro estilo: ```export function App(){}```, porque no export default você pode importar com o nome que quiser e isso pode ter confundir, e tire a primeira linha da função App e no return deixe apenas ```(<h1>Hello World</h1>)```. <br />
No main: delete import do css e colque as {} no import do App.
- Cria src>styles>global.css. <br />
Formato padrão de css:
```
componente {
	propriedade: valor;
}
```
- DICA: Quando usar fonte que não é padrão vai no google fonts seleciona os modelos dela que usará copia o código html e no index.html coloca no início do head as tags com rel e href e a que possui só o href no final, antes do title.
- Importa o global.css no main.
- OBS: No html dos projetos de react nós usamos className e não class, porque temos class do js e isso são atributos de tags html.
- No react é possível você criar módulos de css e usá-los para estilos como em: ```className = {styles.contentWrapper}```, usando o import ```import styles from ‘./App.module.css’;``` e no .css:
```.contentWrapper {```os estilos aqui```}```, então mesmo com classes iguais os estilos podem mudar.
- Adicionar algumas funcionalidades ao css, usando pre-processamento: ```yarn add sass e coloca.scss```
- EX: Nos estilos duma classe podemos colocar ```h1 {estilos pra h1}```
- No react sempre colocamos {} pra incluir js em html.
- No react tudo são componentes e podemos criar pastas pra cada um, tendo seus estilos, testes, etc.
- Nos componentes têm uma pasta de index.tsx, onde a estrutura é: ```export function (nome da pasta)(){return(html)}``` e para colocar esses componentes em outros códigos use: ```<(nome do componente) />```
- Exemplos de tags:
	* Texto > strong
	* hiperlink > a, onde o href é o link
	* listas > li
	* parágrafo > p 
- DICA: Sempre que for usar ícones no react use a biblioteca react-icons, que possui muitos ícones, como o pacote do material e para usar um basta colocá-lo como um componente no código, e esse ícone vira um svg que pode ter estilos. 
- Quando você usa a tag img deve importar a imagem.
- Para receber infos do back usaremos o axios.
- Para executar coisas no react, antes do return colocamos: ```useEffect(() => {o que é pra executar}, [array com vars que quando mudar executam a função dnv, se for só um carregamento inicial deixe vazio])```
- Pra guardar vars no react usamos ```useState([])```, onde o [] é o valor inicial da nossa var e essa func também retorna uma função ```set<nome da var>```, ex ```setMessages``` e com essa função podemos alterar seu val e para usar essa var acesse ela entre {}.
- Para percorrer array em react: ```{array.map(message=>{ o que fará, ex: return um html })}``` 
- OBS: Ao usar o map no react você deve passar para o primeiro elemento html dentro dele um param key com o identificador único de cada item.
- Pegar url: ```window.location.href;```
- ### React context api:
- Permite que todos componentes acessem certos dados. Criamos uma estrutura que tudo que está em volto dela pode acessar seus dados e colocamos ela no main.
- Para acessar, no componente você coloca: ```const { dado } = useContext(nome do context com o dado);```, ex: ```const { signInUrl } = useContext(AuthContext);``` <br><br />
- Mostrar uma coisa de acordo com o val de uma var: ```{ !!user ? <SendMessageForm /> : <LoginBox />}``` O !! transforma o user em um bool e se for true mostra o Send…