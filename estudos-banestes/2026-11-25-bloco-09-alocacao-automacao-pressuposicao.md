# Bloco 09 — Alocação restrita, automação e pressuposição

**Data:** 25/11/2026 | **Eixo:** Técnico Bancário · Conhecimentos Gerais e Específicos

## 1. Diagnóstico do foco

Examinam-se limites explícitos: as possibilidades válidas, as inferências autorizadas e os casos que exigem escalonamento.

| Questão | Peso | Disciplina | Tema |
| --- | ---: | --- | --- |
| 1 | 2 | Noções de Probabilidade e Estatística | Complemento de pelo menos um evento |
| 2 | 1 | Matemática/Raciocínio Lógico e Quantitativo | Combinações com pessoa obrigatória |
| 3 | 2 | Vendas, Negociação e Atendimento | Medição de resolução no primeiro contato |
| 4 | 1 | Língua Portuguesa | Pressuposição acionada por mudança de estado |
| 5 | 2 | Noções de Informática e Comportamentos Digitais | Escalonamento de atendimento automatizado |

### Fontes consultadas

- Enquadramento das disciplinas e pesos pelo item 8.1 e pelo Anexo IV. [Edital nº 01/2026 do Banestes com as duas retificações](https://banestes.com.br/publicacoes_legais/editais_concurso/2026/concurso2026-banestes-edital-abertura-retificado-01_2026.pdf).
- Referência de formato para casos, questões diretas e alternativas. A seleção dos temas segue prioridade didática. [Caderno FCC de Escriturário do Banco do Brasil, fevereiro de 2011](https://www.estudegratis.com.br/images/provas/20356-fcc-2011-banco-do-brasil-escriturario-prova.pdf).

## 2. Material de estudo

### Complemento de pelo menos um evento

A probabilidade de pelo menos uma ocorrência é 1 menos a de nenhuma ocorrência. Em ensaios independentes, multiplique as probabilidades individuais de falha. Para dois eventos independentes de 20% cada, a chance de algum ocorrer é 1−0,8² = 36%.

### Combinações com pessoa obrigatória

Uma combinação escolhe elementos sem considerar ordem. Fixado um membro obrigatório, restam k−1 escolhas entre n−1 pessoas. Para selecionar três de seis com uma pessoa fixa, há C(5,2)=10. Quando há cargos distintos, trocar as pessoas entre cargos produz outra configuração.

### Medição de resolução no primeiro contato

Resolução no primeiro contato mede a proporção de casos efetivamente resolvidos na interação inicial, segundo um critério e uma janela de acompanhamento. Encerrar um protocolo administrativamente não garante resolução. Contatos repetidos pelo mesmo motivo revelam casos a reclassificar.

### Pressuposição acionada por mudança de estado

Expressões como “deixar de”, “voltar a” e “continuar a” pressupõem um estado anterior. “O quiosque voltou a abrir cedo” sugere que abria cedo antes de uma interrupção. O motivo ou a duração da interrupção exigem outra informação.

### Escalonamento de atendimento automatizado

Um chatbot pode resolver demandas padronizadas, com encaminhamento a pessoas quando falta evidência, há sinais conflitantes ou a ação tem impacto elevado. O encaminhamento deve preservar o contexto necessário. Confiança declarada pelo próprio sistema não equivale à resolução verificada.

## 3. Simulado FCC — 5 questões

### Questão 1 — Complemento de pelo menos um evento · Peso 2

Duas conferências independentes encontram uma divergência com probabilidades de 20% e 30%, respectivamente. Qual é a chance de pelo menos uma encontrá-la?

A) 50%
B) 56%
C) 6%
D) 44%
E) 38%

### Questão 2 — Combinações com pessoa obrigatória · Peso 1

Um plantão será composto por quatro de oito funcionários, sem cargos distintos. Lia deve participar e Rui estará ausente. Quantos grupos diferentes podem ser formados?

A) 20
B) 120
C) 35
D) 15
E) 70

### Questão 3 — Medição de resolução no primeiro contato · Peso 2

Em uma amostra de 100 casos, 80 foram encerrados no primeiro contato. Dos 80, 12 foram reabertos no prazo definido pelo mesmo motivo. O critério só considera resolvidos os casos sem esse retorno. Qual é a taxa?

A) 80%
B) 85%
C) 88%
D) 12%
E) 68%

### Questão 4 — Pressuposição acionada por mudança de estado · Peso 1

Ao dizer “A supervisora deixou de solicitar cópias impressas”, qual informação o enunciado pressupõe?

A) A causa da mudança foi o custo do papel.
B) As cópias impressas jamais foram solicitadas.
C) A supervisora solicitava cópias impressas anteriormente.
D) Os pedidos continuarão pelo mesmo prazo.
E) A supervisora proibiu toda impressão.

### Questão 5 — Escalonamento de atendimento automatizado · Peso 2

Um chatbot recebe contestação com documentos divergentes. Seu catálogo cobre consulta de protocolo, mas não escolha entre evidências conflitantes. Que procedimento é adequado?

A) Direcionar a uma fila humana sem repassar qualquer dado já recebido.
B) Encaminhar a um agente humano e preservar protocolo e documentos para revisão.
C) Repetir o mesmo roteiro até que o cliente desista.
D) Escolher o documento mais recente apenas pela data.
E) Encerrar o caso como resolvido após informar o protocolo.

## 4. Gabarito comentado

**Gabarito resumido** — 1 D · 2 A · 3 E · 4 C · 5 B

### Questão 1 — Resposta: D

- **Alternativa correta — D)** A chance de nenhuma encontrar é 0,80×0,70 = 0,56. O complemento é 44%.
- **A) Incorreta** — Soma 20% e 30% e conta duas vezes a interseção.
- **B) Incorreta** — É a probabilidade de nenhuma encontrar.
- **C) Incorreta** — É a probabilidade de as duas encontrarem.
- **E) Incorreta** — Conta exatamente uma ocorrência, 0,20×0,70 + 0,80×0,30.
- **Regra de retenção** — Pelo menos uma inclui a ocorrência simultânea.

### Questão 2 — Resposta: A

- **Alternativa correta — A)** Fixada Lia e excluído Rui, escolhem-se três dos seis restantes. C(6,3)=20.
- **B) Incorreta** — 6×5×4 conta ordens diferentes no mesmo grupo.
- **C) Incorreta** — C(7,3) permite selecionar Rui.
- **D) Incorreta** — C(6,2) escolhe apenas dois participantes além de Lia.
- **E) Incorreta** — C(8,4) ignora a presença obrigatória e a ausência.
- **Regra de retenção** — Aplique as restrições antes de contar combinações.

### Questão 3 — Resposta: E

- **Alternativa correta — E)** Dos 80 inicialmente encerrados, 68 cumprem o critério. O denominador segue 100.
- **A) Incorreta** — Conta todos os encerramentos iniciais, inclusive os reabertos.
- **B) Incorreta** — É 68/80, que usa apenas os encerramentos iniciais como base.
- **C) Incorreta** — Subtrai os reabertos do total como se todos os demais tivessem sido resolvidos no primeiro contato.
- **D) Incorreta** — Mede só os reabertos conhecidos em relação à amostra.
- **Regra de retenção** — Fixe o critério de resolução antes de contar encerramentos.

### Questão 4 — Resposta: C

- **Alternativa correta — C)** “Deixou de” pressupõe a prática anterior e afirma sua interrupção.
- **A) Incorreta** — A construção deixa a causa em aberto.
- **B) Incorreta** — Contradiz a prática anterior pressuposta.
- **D) Incorreta** — A frase afirma interrupção da prática, sem prever retomada ou calendário.
- **E) Incorreta** — Interromper seu pedido de cópias não implica uma proibição geral.
- **Regra de retenção** — Um verbo de mudança de estado orienta a busca pela condição anterior.

### Questão 5 — Resposta: B

- **Alternativa correta — B)** Respeita o limite da automação e permite continuidade com informação suficiente.
- **A) Incorreta** — Faz a revisão recomeçar sem necessidade e prejudica a continuidade.
- **C) Incorreta** — A repetição não acrescenta a competência de avaliar as evidências.
- **D) Incorreta** — A data isolada não comprova qual documento prevalece.
- **E) Incorreta** — Consultar protocolo não resolve o conflito documental.
- **Regra de retenção** — Automatize tarefas cobertas e escale decisões que exigem avaliação adicional.

## 5. Mapa de revisão rápida

1. **Complemento de pelo menos um evento** — Que evento é o complemento de “pelo menos uma”?
2. **Combinações com pessoa obrigatória** — Quantas vagas livres e quantas pessoas elegíveis sobram?
3. **Medição de resolução no primeiro contato** — Por que o denominador continua sendo 100?
4. **Pressuposição acionada por mudança de estado** — Que prática anterior “deixou de” pressupõe?
5. **Escalonamento de atendimento automatizado** — Que informação deve acompanhar uma contestação escalonada?
