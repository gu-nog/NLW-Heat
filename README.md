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
- Instalar o prisma: yarn add prisma -D<br />
- Resolver erro que deu no meu, cria um arquivo .env, escrito:
PRISMA_CLIENT_ENGINE_TYPE = "binary"
PRISMA_CLI_QUERY_ENGINE_TYPE = binary
- Inicar: yarn prisma init
- Preparações:<br />
No .env, apaga a linha de database_url, que é de um postgree.<br />
Configs de tabelas, BDs e outras coisas do prisma ficam em prisma>schema.prisma<br />
Deixe o datasource db com: provider = “sqlite” e url = “file:./dev.db”

#### Criar a tabela(em prisma>schema.prisma):
model User {<br />
$\qquad$	id		String @id @default(uuid())<br />
$\qquad$	name		String

$\qquad$	@@map(“users”)<br />
} <br />
- users: como vai chamar a tabela
- User(user): como vai se referir a sua tabela
- Rodar a migration: yarn prisma migrate dev
- Cria src>prisma>index.ts(pra conectar a migration com nossas funções):<br />
import { PrismaClient } from “@prisma/client”;<br />
const prismaClient = new PrismaClient();<br />
export default prismaClient;<br />
Pra usar (no service), por ex:<br />
const exemplo = await prismaClient.user.findFirst({<br />
$\qquad$	where: {<br />
$\qquad\qquad$		name: nome<br />
$\qquad$	}<br />
})<br />
- Relacionar tabelas:<br />
Na nova tabela coloque: {nova coluna} {model com qual será relacionada}<br />
Ex: Num model Message: user User<br />
E salve o arquivo que deverá ficar, por ex, assim:<br />
No model User(após o @@map): Message Message[]<br />
No model Message:<br />
user User @relation(fields: [userId], references: [id])<br />
Após o @@map: userId String<br />
E você pode trocar: Message Message[] > messages Message[] e userId > user_id<br />
Salvar com relação:<br />
await prismaClient.message.create({<br />
$\qquad$	data: {text, user_id},<br />
$\qquad$	include: {user: true}<br />
})<br />
Pra acessar dados dessa coluna, dá por ex: message.user.name<br />
- Ver coisas dos BDs do prisma: yarn prisma studio

### Socket io
Ele nos ajudará a ligar o cliente ao servidor<br />
- Comunicação http: comunicação tem início e fim<br />
- Comunicação por websocket: comunicação constante
#### O cors é responsável por permitir ou bloquear conexões.
#### Como adicioná-lo:
Da add em socket.io e cors, da @types e importa Server de socket.io e http de http e cors de cors
- No app.ts:<br />
const app = express();<br />
app.use(cors());<br />
const serverHttp = http.createServer(app);<br />
const io = new Server(serverHttp, {<br />
$\qquad$	cors: {origin: “*”}<br />
});<br />
io.on(“connection”, (socket) => {<br />
$\qquad$	console.log(`Usuário conectado no socket ${socket.id}`);<br />
});<br />
app.use(express.json());<br />
app.use(router);<br />
…<br />
export { serverHttp, io };<br />
- Em public>index.html:
No body(2 scripts):
- 1°:<br />
src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.0.1/socket.io.min.js"<br />
integrity="sha512eVL5Lb9al9FzgR63gDs1MxcDS2wFu3loYAgjIH0+Hg38tCS8Ag62dwKyH+wzDb+QauDpEZjXbMn11blw8cbTJQ=="<br />
crossorigin="anonymous"
- 2°:<br />
const socket = io(“http://localhost:4000”);<br />
socket.on(“new message”, (data) => console.log(data));<br />
- Cria src/server.ts:<br />
serverHttp.listen(4000, () =>
	console.log(“Server running”)
);<br />
- No nosso service: <br />
io.emit(“new_message”, infoWS)