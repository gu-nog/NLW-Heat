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
