# Segurança da Informação: Ameaças, Mecanismos de Proteção e Boas Práticas
**Data:** 25/11/2026 | **Eixo:** Informática/Segurança Digital

## 1. DIAGNÓSTICO DO FOCO
**Tema escolhido:** Segurança da Informação: Ameaças, Mecanismos de Proteção e Boas Práticas.

**Justificativa da escolha focada na FCC/Banestes:**
A Segurança da Informação é um tema de extrema relevância para instituições financeiras como o Banestes, dada a constante ameaça de ataques cibernéticos e a necessidade de proteger dados sensíveis de clientes e operações bancárias. Para a banca Fundação Carlos Chagas (FCC), este é um tópico de alta incidência em concursos bancários, sendo frequentemente cobrado com questões que exigem tanto o conhecimento conceitual quanto a aplicação prática de medidas de segurança. A FCC costuma detalhar tipos de ameaças (malware, phishing, engenharia social), mecanismos de proteção (firewall, criptografia, antivírus) e boas práticas de uso da tecnologia. Este tema, incluído no eixo de Informática/Segurança Digital (peso 2), é crucial para o desempenho do futuro Técnico Bancário e ainda não foi abordado em profundidade, diferenciando-se de LGPD (foco em privacidade de dados) e PLD (foco em crimes financeiros).

**4 Subtópicos:**
1.  Conceitos Fundamentais de Segurança da Informação (Confidencialidade, Integridade, Disponibilidade, Autenticidade, Não Repúdio).
2.  Principais Ameaças e Ataques Digitais (Malware: vírus, worms, trojans, ransomware; Phishing; Engenharia Social; Ataques de Negação de Serviço - DDoS).
3.  Mecanismos e Ferramentas de Proteção (Antivírus, Firewall, Criptografia, Certificados Digitais, Backup, Senhas Fortes e Autenticação Multifator).
4.  Boas Práticas e Políticas de Segurança para Usuários (Navegação Segura, Uso Consciente de E-mail, Atualizações de Software, Conscientização e Manuseio de Informações).

## 2. MATERIAL DE ESTUDO

### 1. Conceitos essenciais

A Segurança da Informação visa proteger os ativos de informação contra acessos não autorizados, modificações indevidas ou destruição, garantindo a continuidade dos negócios. Seus pilares são:

*   **Confidencialidade:** Garantia de que a informação é acessível apenas por pessoas autorizadas. Ex: Senha de banco.
*   **Integridade:** Garantia de que a informação não foi alterada ou destruída de forma não autorizada. Ex: Extrato bancário sem modificações.
*   **Disponibilidade:** Garantia de que os usuários autorizados terão acesso à informação e aos sistemas sempre que precisarem. Ex: Sistema do PIX funcionando 24/7.
*   **Autenticidade:** Garantia de que a identidade de um usuário ou a origem de uma informação é genuína. Ex: Assinatura digital.
*   **Não Repúdio:** Garantia de que a parte que originou uma comunicação ou transação não pode negar sua autoria posteriormente. Ex: Comprovante de transação bancária.

### 2. Regras, classificações e exceções

#### Ameaças e Ataques Digitais
*   **Malware (Software Malicioso):** Termo genérico para qualquer software projetado para causar dano, operar sem consentimento do usuário ou obter acesso não autorizado.
    *   **Vírus:** Anexa-se a um programa e se propaga quando o programa é executado. Necessita de um hospedeiro.
    *   **Worm (Verme):** Programa autônomo que se propaga automaticamente pela rede, explorando vulnerabilidades. Não necessita de um hospedeiro.
    *   **Trojan (Cavalo de Troia):** Disfarça-se de software legítimo para instalar programas maliciosos secretamente. Não se replica por conta própria.
    *   **Ransomware:** Criptografa dados da vítima e exige resgate (ransom) para liberá-los.
    *   **Spyware:** Monitora atividades do usuário para coletar informações.
    *   **Keylogger:** Tipo de spyware que registra as teclas digitadas.
*   **Phishing:** Tentativa de obter informações confidenciais (senhas, dados bancários) por meio de mensagens falsas (e-mails, SMS, redes sociais) que se passam por instituições confiáveis.
    *   **Spear Phishing:** Phishing direcionado a indivíduos ou grupos específicos.
    *   **Whaling:** Phishing direcionado a "grandes peixes" (diretores, executivos).
*   **Engenharia Social:** Manipulação psicológica de pessoas para que revelem informações confidenciais ou realizem ações que comprometam a segurança.
*   **DDoS (Distributed Denial of Service):** Ataque que sobrecarrega um servidor, serviço ou rede com um volume massivo de tráfego, tornando-o indisponível para usuários legítimos.

#### Mecanismos de Proteção
*   **Antivírus:** Software para detectar, prevenir e remover malwares. É essencial mantê-lo atualizado.
*   **Firewall:** Barreira de segurança que monitora e controla o tráfego de rede, permitindo ou bloqueando conexões com base em regras predefinidas. Pode ser de software ou hardware.
*   **Criptografia:** Processo de codificar informações para protegê-las.
    *   **Simétrica:** Usa uma única chave para criptografar e descriptografar. Ex: AES.
    *   **Assimétrica (Chave Pública/Privada):** Usa um par de chaves (uma pública, uma privada). A chave pública criptografa, a privada descriptografa (e vice-versa para assinaturas digitais). Ex: RSA.
*   **Certificados Digitais:** Documentos eletrônicos que atestam a identidade de uma pessoa, empresa ou site, utilizando criptografia assimétrica. Garantem autenticidade e integridade.
*   **Backup:** Cópia de segurança de dados para recuperação em caso de perda ou corrupção.
*   **Senhas Fortes:** Combinação longa de letras (maiúsculas e minúsculas), números e símbolos.
*   **Autenticação Multifator (MFA/2FA):** Exige duas ou mais formas de verificação de identidade (algo que você sabe – senha; algo que você tem – token/celular; algo que você é – biometria).

### 3. Exemplos práticos curtos

*   **Confidencialidade:** O sigilo bancário impede que seu gerente compartilhe seus dados financeiros com terceiros não autorizados.
*   **Phishing:** Você recebe um e-mail idêntico ao do seu banco pedindo para "atualizar suas credenciais" clicando em um link. Ao clicar, você insere seus dados em um site falso.
*   **Ransomware:** Um funcionário abre um anexo suspeito, todos os arquivos da rede são criptografados, e uma mensagem exige pagamento em Bitcoin para liberá-los.
*   **Criptografia:** Ao acessar um site bancário (HTTPS), a comunicação entre seu navegador e o banco é criptografada, protegendo seus dados de interceptação.
*   **MFA:** Ao fazer login no aplicativo do banco, além da senha, você precisa inserir um código enviado por SMS para seu celular cadastrado.

### 4. Alertas de pegadinhas típicas da FCC

*   **Confundir os pilares:** A FCC adora misturar as definições de Confidencialidade, Integridade e Disponibilidade. Memorize bem cada uma.
*   **Características de Malware:** Perguntar sobre um malware que "se replica sozinho sem hospedeiro" (Worm) e colocar "Vírus" como alternativa, ou vice-versa.
*   **Phishing vs. Engenharia Social:** Embora relacionados, Phishing é um método de ataque (geralmente digital) que usa engenharia social como técnica. A FCC pode tentar confundi-los.
*   **Criptografia Simétrica vs. Assimétrica:** As diferenças no uso das chaves são cruciais. Lembre-se que a assimétrica é mais lenta, mas oferece maior segurança para autenticação e não repúdio.
*   **Função do Firewall:** A FCC pode tentar induzir que o firewall protege contra vírus (tarefa do antivírus) ou que ele é um "filtro de conteúdo" genérico. Sua função primária é controlar o tráfego de rede.
*   **Backup como única solução:** O backup é essencial, mas não é a única medida de segurança. Questões podem tentar supervalorizá-lo em detrimento de outras proteções.

### 5. Mnemônicos ou regras de retenção rápida

*   **C.I.D.A.N. (Piares da Segurança):** **C**onfidencialidade, **I**ntegridade, **D**isponibilidade, **A**utenticidade, **N**ão Repúdio.
*   **V.W.T.R.S.K. (Tipos de Malware):** **V**írus, **W**orm, **T**rojan, **R**ansomware, **S**pyware, **K**eylogger.
*   **"HTTPS é Criptografia, Firewall é Barreira"**: Lembre-se que o "S" no HTTPS indica segurança via criptografia (SSL/TLS), e o Firewall age como um muro de proteção na rede.
*   **"Chave Única Simétrica, Par de Chaves Assimétrica"**: Para diferenciar os tipos de criptografia.

## 3. SIMULADO FCC – 5 QUESTÕES

**Questão 1**
No contexto da Segurança da Informação, os pilares fundamentais garantem a proteção dos ativos de informação. Assinale a alternativa que apresenta corretamente a definição do pilar da Confidencialidade.

a) Garantia de que a informação será acessível e utilizável pelos usuários autorizados sempre que for necessário.
b) Garantia de que a informação não foi modificada ou destruída de forma não autorizada e que é precisa e completa.
c) Garantia de que a informação é acessível apenas por pessoas, entidades ou processos autorizados, e que não será revelada a terceiros.
d) Garantia de que a origem da informação ou a identidade de um usuário é genuína e pode ser verificada.
e) Garantia de que o autor de uma ação ou transação não pode negar sua autoria posteriormente.

**Questão 2**
Um funcionário do Banestes recebe um e-mail que, aparentemente, é do departamento de TI do próprio banco, solicitando que ele clique em um link para "atualizar suas credenciais de acesso ao sistema interno" devido a uma "manutenção urgente". Ao clicar, ele é direcionado a uma página idêntica à de login do banco, onde insere seu usuário e senha. Este é um exemplo clássico de qual tipo de ataque digital?

a) Ataque de Negação de Serviço (DDoS).
b) Ransomware.
c) Engenharia Social, utilizando a técnica de Phishing.
d) Worm (Verme).
e) Ataque de Força Bruta.

**Questão 3**
Sobre os mecanismos e ferramentas de proteção em Segurança da Informação, considere as afirmativas abaixo:
I. O Firewall atua como uma barreira de segurança, controlando o tráfego de rede e bloqueando acessos não autorizados com base em regras predefinidas.
II. A criptografia simétrica utiliza um par de chaves (uma pública e uma privada) para codificar e decodificar informações, garantindo maior segurança em transações digitais.
III. O Antivírus é um software essencial para detectar, prevenir e remover softwares maliciosos (malware), devendo ser constantemente atualizado.

Está correto o que se afirma em:

a) Apenas I.
b) Apenas II.
c) Apenas I e II.
d) Apenas I e III.
e) I, II e III.

**Questão 4**
Um tipo de software malicioso que se destaca por criptografar os arquivos de um sistema ou rede, tornando-os inacessíveis, e exigindo um pagamento (geralmente em criptomoedas) para que os dados sejam restaurados, é conhecido como:

a) Vírus.
b) Worm.
c) Trojan.
d) Ransomware.
e) Spyware.

**Questão 5**
A Autenticação Multifator (MFA ou 2FA) é uma prática de segurança recomendada para fortalecer o acesso a sistemas e contas online. Qual das opções a seguir exemplifica corretamente o conceito de MFA?

a) Utilizar uma senha complexa com letras maiúsculas, minúsculas, números e símbolos.
b) Realizar o login com usuário e senha, e em seguida, inserir um código enviado para o celular cadastrado.
c) Fazer backup regular de todos os dados importantes do sistema.
d) Acessar o sistema somente por meio de uma rede Wi-Fi privada e segura.
e) Utilizar um software antivírus atualizado para proteger o dispositivo.

---

### Gabarito Comentado

**Questão 1:**
**Resposta: c)**
*   **Comentário:** A Confidencialidade é a garantia de que a informação é acessível apenas por pessoas, entidades ou processos autorizados. As outras alternativas descrevem: a) Disponibilidade; b) Integridade; d) Autenticidade; e) Não Repúdio.

**Questão 2:**
**Resposta: c)**
*   **Comentário:** O cenário descrito é um exemplo clássico de Phishing (um tipo de fraude online que busca obter dados confidenciais), que, por sua vez, é uma técnica de Engenharia Social (manipulação psicológica para obter informações ou induzir ações).

**Questão 3:**
**Resposta: d)**
*   **Comentário:**
    *   **I - Correta:** O Firewall de fato controla o tráfego de rede, atuando como uma barreira.
    *   **II - Incorreta:** A criptografia simétrica utiliza uma *única* chave. A descrição de "par de chaves (pública e privada)" refere-se à criptografia assimétrica.
    *   **III - Correta:** O Antivírus é fundamental para a proteção contra malwares e sua atualização é crucial.

**Questão 4:**
**Resposta: d)**
*   **Comentário:** Ransomware é o tipo de malware que criptografa arquivos e exige resgate para sua liberação. Os outros malwares têm características diferentes (Vírus e Worm se replicam, Trojan se disfarça, Spyware monitora).

**Questão 5:**
**Resposta: b)**
*   **Comentário:** A Autenticação Multifator exige mais de um fator de verificação de identidade. A opção "b" exemplifica isso ao combinar "algo que você sabe" (senha) com "algo que você tem" (código enviado ao celular). As outras opções são medidas de segurança, mas não definem MFA.