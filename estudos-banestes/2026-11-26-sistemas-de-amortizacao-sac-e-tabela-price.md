# Sistemas de Amortização: SAC e Tabela Price
**Data:** 26/11/2026 | **Eixo:** Matemática Financeira

## 1. DIAGNÓSTICO DO FOCO (Tema escolhido, Justificativa da escolha focada na FCC/Banestes e 4 Subtópicos)

*   **Tema:** Sistemas de Amortização: SAC (Sistema de Amortização Constante) e Tabela Price (Sistema Francês de Amortização)

*   **Justificativa da escolha focada na FCC/Banestes:** A Fundação Carlos Chagas (FCC) frequentemente explora a Matemática Financeira em seus concursos bancários, e os sistemas de amortização são um pilar essencial para a compreensão de operações de crédito e financiamento. Para o cargo de Técnico Bancário do Banestes, o domínio desses sistemas é crucial não apenas para a resolução de problemas práticos de cálculo, mas também para a interpretação e comparação de produtos bancários oferecidos. A FCC adora questões comparativas e que exigem a compreensão das características de cada sistema, focando em suas diferenças, impactos nos fluxos de pagamento e saldos devedores, bem como o custo total de juros. É um tema de peso 2 que exige raciocínio lógico e conhecimento das fórmulas e comportamentos.

*   **4 Subtópicos:**
    1.  Conceitos Fundamentais de Juros, Amortização e Saldo Devedor
    2.  Sistema de Amortização Constante (SAC): Características, Comportamento e Cálculo
    3.  Sistema Francês de Amortização (Tabela Price): Características, Comportamento e Cálculo
    4.  Comparativo entre SAC e Tabela Price: Vantagens, Desvantagens e Aplicações

## 2. MATERIAL DE ESTUDO (1. Conceitos essenciais; 2. Regras, classificações e exceções; 3. Exemplos práticos curtos; 4. Alertas de pegadinhas típicas da FCC; 5. Mnemônicos ou regras de retenção rápida)

### 1. Conceitos essenciais

*   **Amortização:** É o processo de extinção gradual de uma dívida através de pagamentos periódicos. Refere-se à parcela do principal da dívida que é paga em cada período.
*   **Juros:** É a remuneração paga pelo uso do capital emprestado. Calculado sobre o saldo devedor remanescente.
*   **Parcela (ou Prestação):** É o valor total pago periodicamente pelo devedor. É a soma da amortização do principal e dos juros do período (Parcela = Amortização + Juros).
*   **Saldo Devedor (SD):** É o valor da dívida remanescente em determinado período, após o pagamento da parcela anterior.

### 2. Regras, classificações e exceções

*   **Sistema de Amortização Constante (SAC):**
    *   **Regra Fundamental:** A parcela de amortização do principal é **constante** em todos os períodos.
    *   **Consequência:** Como a amortização é constante e o saldo devedor diminui a cada pagamento, os juros (calculados sobre o saldo devedor) também diminuem. Assim, as parcelas (amortização + juros) são **decrescentes** ao longo do tempo.
    *   **Fórmula da Amortização (A):** `A = Valor Financiado / Número de Períodos`
    *   **Cálculo da Parcela (Pn):** `Pn = A + Jn` (onde `Jn = SD_{n-1} * i`, sendo `SD_{n-1}` o saldo devedor do período anterior e `i` a taxa de juros).
    *   **Características:** Maior desembolso inicial (primeiras parcelas mais altas), porém menor custo total de juros devido à amortização mais rápida do saldo devedor.

*   **Sistema Francês de Amortização (Tabela Price):**
    *   **Regra Fundamental:** A parcela (prestação) é **constante** em todos os períodos (assumindo taxa de juros e número de períodos fixos).
    *   **Consequência:** Para manter a parcela constante, a composição interna da parcela muda ao longo do tempo. No início, a maior parte da parcela é composta por juros e a amortização é menor. Com o tempo, os juros diminuem (pois o SD diminui), e a parcela de amortização aumenta para compensar e manter a prestação fixa.
    *   **Fórmula da Parcela (P):** `P = PV * [i * (1+i)^n] / [(1+i)^n - 1]` (onde `PV` = Valor Presente/Financiado, `i` = taxa de juros, `n` = número de períodos).
    *   **Cálculo da Amortização (An) e Juros (Jn) em cada período:** `Jn = SD_{n-1} * i`; `An = P - Jn`.
    *   **Características:** Parcelas fixas e, geralmente, menores no início em comparação com o SAC. Resulta em um maior custo total de juros devido à amortização mais lenta do saldo devedor nas primeiras parcelas.

### 3. Exemplos práticos curtos

*   **Exemplo SAC (simplificado):** Financiamento de R$ 1.000 em 2 meses, taxa de 10% a.m.
    *   Amortização (A) = R$ 1.000 / 2 = R$ 500,00.
    *   **Mês 1:** Saldo Devedor (SD0) = R$ 1.000. Juros (J1) = 1.000 * 0,10 = R$ 100. Parcela (P1) = 500 + 100 = R$ 600. SD final (SD1) = 1.000 - 500 = R$ 500.
    *   **Mês 2:** Saldo Devedor (SD1) = R$ 500. Juros (J2) = 500 * 0,10 = R$ 50. Parcela (P2) = 500 + 50 = R$ 550. SD final (SD2) = 500 - 500 = R$ 0.
    *   **Observação:** Amortização constante (R$ 500), Juros decrescentes (R$ 100 -> R$ 50), Parcela decrescente (R$ 600 -> R$ 550).

*   **Exemplo Price (conceitual):** Financiamento de R$ 1.000 em 2 meses, taxa de 10% a.m. (Parcela calculada ≈ R$ 576,19)
    *   **Mês 1:** Saldo Devedor (SD0) = R$ 1.000. Juros (J1) = 1.000 * 0,10 = R$ 100. Amortização (A1) = 576,19 - 100 = R$ 476,19. SD final (SD1) = 1.000 - 476,19 = R$ 523,81.
    *   **Mês 2:** Saldo Devedor (SD1) = R$ 523,81. Juros (J2) = 523,81 * 0,10 = R$ 52,38. Amortização (A2) = 576,19 - 52,38 = R$ 523,81. SD final (SD2) = 523,81 - 523,81 = R$ 0.
    *   **Observação:** Parcela constante (R$ 576,19), Juros decrescentes (R$ 100 -> R$ 52,38), Amortização crescente (R$ 476,19 -> R$ 523,81).

### 4. Alertas de pegadinhas típicas da FCC

*   **Confundir Amortização com Parcela:** A FCC adora trocar os termos. Lembre-se: Parcela = Amortização + Juros. No SAC, a *amortização* é constante; na Price, a *parcela* é constante.
*   **Custo Total do Financiamento:** A FCC pode perguntar qual sistema resulta no menor custo total de juros. O SAC sempre tem um custo total de juros menor que a Tabela Price (para o mesmo valor financiado, taxa e prazo), devido à amortização mais rápida do saldo devedor.
*   **Comportamento dos Componentes:** É fundamental saber que na Price a amortização é crescente e os juros decrescentes (mantendo a parcela constante), e no SAC tanto os juros quanto a parcela são decrescentes (com amortização constante).
*   **Variação da Taxa de Juros:** As fórmulas da Tabela Price pressupõem taxa de juros constante. Em cenários de juros flutuantes, a parcela da Price também pode variar, mas a FCC geralmente cobra o cenário de taxa fixa.
*   **Cálculo da Amortização no SAC:** É o valor financiado dividido pelo número de parcelas. Simples, mas muitos esquecem essa facilidade.

### 5. Mnemônicos ou regras de retenção rápida

*   **SAC:** "**S**empre **A**mortização **C**onstante". Se a amortização é constante, o saldo devedor cai mais rápido, os juros caem e, consequentemente, a parcela total cai.
*   **PRICE:** "**P**arcela **R**eta, **I**nteresses (Juros) **C**aem, **E** Amortização **E**leva". A parcela é constante (reta). Juros caem e amortização sobe.
*   **Custo:** "**SAC** é **S**empre **M**ais **B**arato" (em termos de custo total de juros).

## 3. SIMULADO FCC – 5 QUESTÕES

**Questão 1**
Um financiamento de R$ 120.000,00 foi contratado pelo Sistema de Amortização Constante (SAC) para ser pago em 24 parcelas mensais, com taxa de juros de 1% ao mês. O valor da segunda parcela desse financiamento será de:
a) R$ 5.000,00
b) R$ 5.120,00
c) R$ 5.060,00
d) R$ 6.200,00
e) R$ 6.150,00

**Questão 2**
Sobre os sistemas de amortização SAC (Sistema de Amortização Constante) e Tabela Price (Sistema Francês de Amortização), considere as afirmativas a seguir:
I. No SAC, as parcelas são decrescentes, enquanto na Tabela Price, as parcelas são constantes (assumindo taxa de juros fixa).
II. O custo total de juros de um financiamento é sempre menor no SAC em comparação com a Tabela Price, para o mesmo valor financiado, taxa e prazo.
III. Na Tabela Price, a parcela de amortização é crescente e a parcela de juros é decrescente ao longo do tempo.
IV. No SAC, a parcela de amortização do principal é constante, e a parcela de juros é crescente ao longo do tempo.

Está correto o que se afirma SOMENTE em:
a) I e II
b) I, II e III
c) II e IV
d) III e IV
e) I, III e IV

**Questão 3**
Um cliente deseja financiar um imóvel e está em dúvida entre o Sistema de Amortização Constante (SAC) e a Tabela Price. Qual das seguintes afirmações é uma característica *exclusiva* da Tabela Price, quando comparada ao SAC?
a) O saldo devedor diminui mais rapidamente nas primeiras parcelas.
b) O custo total de juros do financiamento é menor.
c) As parcelas iniciais são mais elevadas.
d) A composição da parcela de amortização é crescente ao longo do tempo.
e) A parcela de amortização do principal é constante.

**Questão 4**
Um empréstimo de R$ 50.000,00 será pago em 10 meses, com taxa de juros de 2% ao mês, utilizando a Tabela Price. Qual será o valor aproximado da primeira parcela?
(Considere: (1,02)^10 ≈ 1,219)
a) R$ 4.500,00
b) R$ 5.566,21
c) R$ 5.000,00
d) R$ 5.750,00
e) R$ 6.200,00

**Questão 5**
Em relação ao Sistema de Amortização Constante (SAC), assinale a alternativa INCORRETA.
a) A amortização do principal é a mesma em todas as parcelas.
b) Os juros são calculados sobre o saldo devedor remanescente.
c) As parcelas de pagamento são decrescentes ao longo do tempo.
d) O custo total de juros do financiamento é geralmente maior que na Tabela Price.
e) O saldo devedor diminui de forma linear (em valor absoluto) a cada período.

---

**Gabarito Comentado**

**Questão 1**
**Resposta: e) R$ 6.150,00**
*   **1. Cálculo da Amortização (A):** No SAC, a amortização é constante. `A = Valor Financiado / Número de Parcelas = R$ 120.000,00 / 24 = R$ 5.000,00` por mês.
*   **2. Cálculo da Primeira Parcela (P1):**
    *   Saldo Devedor inicial (SD0) = R$ 120.000,00
    *   Juros do 1º mês (J1) = `SD0 * Taxa = 120.000 * 0,01 = R$ 1.200,00`
    *   `P1 = A + J1 = 5.000 + 1.200 = R$ 6.200,00`
*   **3. Cálculo do Saldo Devedor após o 1º pagamento (SD1):** `SD1 = SD0 - A = 120.000 - 5.000 = R$ 115.000,00`
*   **4. Cálculo da Segunda Parcela (P2):**
    *   Juros do 2º mês (J2) = `SD1 * Taxa = 115.000 * 0,01 = R$ 1.150,00`
    *   `P2 = A + J2 = 5.000 + 1.150 = R$ 6.150,00`

**Questão 2**
**Resposta: b) I, II e III**
*   **I. Correta.** No SAC, a amortização é constante, mas os juros diminuem (pois o SD diminui), tornando as parcelas decrescentes. Na Price, a parcela é constante por definição (com taxa fixa).
*   **II. Correta.** Devido à amortização mais rápida do saldo devedor no SAC, os juros incidem sobre uma base menor por mais tempo, resultando em um custo total de juros inferior ao da Tabela Price (para as mesmas condições).
*   **III. Correta.** Na Tabela Price, para manter a parcela constante, a medida que os juros diminuem (por causa da redução do SD), a parcela de amortização deve, necessariamente, aumentar.
*   **IV. Incorreta.** No SAC, a parcela de amortização do principal é constante, mas a parcela de juros é *decrescente* ao longo do tempo (não crescente), pois o saldo devedor diminui.

**Questão 3**
**Resposta: d) A composição da parcela de amortização é crescente ao longo do tempo.**
*   a) O saldo devedor diminui mais rapidamente nas primeiras parcelas no SAC, pois a amortização é constante e, em termos proporcionais, maior no início. Na Price, a amortização inicial é menor, fazendo o SD diminuir mais lentamente no começo.
*   b) O custo total de juros do financiamento é menor no SAC.
*   c) As parcelas iniciais são geralmente mais elevadas no SAC.
*   d) **Correta.** Na Tabela Price, para que a parcela seja constante, à medida que os juros diminuem (pois o saldo devedor diminui), a parcela de amortização necessariamente aumenta.
*   e) A parcela de amortização do principal é constante no SAC.

**Questão 4**
**Resposta: b) R$ 5.566,21**
*   **Fórmula da Parcela (P) na Tabela Price:** `P = PV * [i * (1+i)^n] / [(1+i)^n - 1]`
*   `PV` = R$ 50.000,00
*   `i` = 2% ao mês = 0,02
*   `n` = 10 meses
*   `(1+i)^n` = `(1,02)^10` ≈ 1,219 (dado na questão)
*   Substituindo os valores:
    `P = 50.000 * [0,02 * 1,219] / [1,219 - 1]`
    `P = 50.000 * [0,02438] / [0,219]`
    `P = 50.000 * 0,11132419...`
    `P ≈ R$ 5.566,21`

**Questão 5**
**Resposta: d) O custo total de juros do financiamento é geralmente maior que na Tabela Price.**
*   a) **Correta.** No SAC, a amortização do principal é a mesma em todas as parcelas.
*   b) **Correta.** Os juros são calculados sobre o saldo devedor remanescente de cada período.
*   c) **Correta.** Como a amortização é constante e o saldo devedor diminui, os juros diminuem e, consequentemente, as parcelas (amortização + juros) são decrescentes.
*   d) **Incorreta.** O custo total de juros do financiamento no SAC é *geralmente menor* (e não maior) que na Tabela Price, pois o saldo devedor é amortizado mais rapidamente, o que reduz a base de cálculo dos juros ao longo do tempo.
*   e) **Correta.** Como a amortização é constante, o saldo devedor diminui em valores iguais (lineares) a cada período.