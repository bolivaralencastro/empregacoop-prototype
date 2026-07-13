# Plano — Casos de uso de recandidatura (2ª vaga em diante)

> Premissa inegociável: **o EmpregaCOOP não é um ATS.** Nenhuma candidatura é "enviada" dentro da plataforma — ela sempre acontece na plataforma externa da cooperativa. O EmpregaCOOP prepara, direciona e registra o que o candidato declara.

## Diagnóstico (verificado no código em 2026-07-12)

| Componente | Comportamento atual | Problema |
|---|---|---|
| `OpportunitiesCard` (1ª candidatura) | Clique em "Candidatar-se" → badge "✓ Enviada" + avança para pré-requisitos | "Enviada" é mentira nesse momento — nada foi enviado; o candidato nem fez os cursos ainda |
| `ReactivationOpportunitiesCard` (novas vagas) | Clique em "Candidatar-se" → badge "✓ Enviada". Fim. | Erro duplo: além do rótulo, o fluxo inteiro some — sem pré-requisitos, sem Match Card, sem wizard, sem plataforma externa |
| `PrereqCard` | Hardcoded para a vaga 1 (Gerente Adm. Financeiro) | Não há como demonstrar a 2ª candidatura com cursos já aproveitados |
| `ExternalApplicationWizard` | Sempre as 3 telas completas | Candidato que já viu o wizard não precisa da aula de novo |

## Modelo mental proposto

O botão "Candidatar-se" **nunca conclui nada** — ele **inicia a preparação**. Estados de uma vaga no EmpregaCOOP:

```
Candidatar-se →  Em preparação (cursos pendentes)
              →  Pronta (pré-requisitos ok · Match Card liberado)
              →  Aguardando sua confirmação (saiu para a plataforma externa)
              →  Registrada (candidato voltou e confirmou — auto-declarado)
```

"Enviada"/"Registrada" só existe depois que o candidato **volta e confirma** — coerente com a decisão de design já tomada (sem integração ATS, status auto-gerenciado).

## Caso 1 — Segunda candidatura com cursos já aproveitados

O mesmo `PrereqCard`, parametrizado por vaga, com estados derivados do histórico:

- Curso já concluído em candidatura anterior → linha com badge **"Concluído · certificado"**, sem CTA de refazer.
- Se **todos** os pré-requisitos já estão cumpridos → o card nasce liberado, com destaque: **"Você já cumpre os pré-requisitos desta vaga"** + Match Card criado na hora + botões Baixar/Candidatar-se.
- Narrativa da demo (contraste proposital entre as 3 vagas novas):
  - **Vaga A** (mesma família financeira): 2 cursos já feitos → liberada instantaneamente. Mostra o valor do CapacitaCOOP acumulado.
  - **Vaga B**: 1 curso já feito + 1 novo (ex.: "Design de Sistemas Cooperativos", que já existe na sidebar como "Nova trilha") → mostra o fluxo parcial.

## Caso 2 — Wizard já visto

Flag `proto_wizard_seen` (localStorage). Na 2ª candidatura, em vez das 3 telas:

- **Confirmação única** (1 tela): "Você já conhece o caminho: baixe o Match Card desta vaga e anexe na plataforma da cooperativa." + botões [Baixar Match Card] [Ir para a página da vaga →].
- Link discreto "rever passo a passo" reabre o wizard completo.

## Caso 3 — Correção dos cards de vagas (o bug apontado)

`OpportunitiesCard` e `ReactivationOpportunitiesCard` unificados no mesmo comportamento:

1. Clique em "Candidatar-se" → **nunca** "Enviada". O botão vira **"Em preparação"** e o chat avança para o PrereqCard da vaga (com estados do Caso 1).
2. Quando o candidato sai para a plataforma externa (via wizard ou confirmação única) → estado **"Aguardando confirmação"** no drawer Candidaturas.
3. A IA pergunta na volta (mensagem já existente: "Conseguiu concluir a inscrição?") → resposta positiva → **"Registrada"**.

## Escopo de implementação (quando aprovado)

1. Parametrizar `PrereqCard` por vaga (`{ vaga, cursos: [{nome, horas, jaConcluido}] }`) — destrava multi-vaga, que hoje não existe (tudo hardcoded para Gerente Adm. Financeiro).
2. Corrigir os 2 cards de vagas (estados novos, sem "Enviada" no clique).
3. Flag `proto_wizard_seen` + tela de confirmação única no `ExternalApplicationWizard`.
4. Estender o fluxo de reativação: clique numa vaga nova → PrereqCard "já liberado" → confirmação única → `/ats-vaga` → volta e confirma.
5. Estados "Aguardando confirmação"/"Registrada" no drawer Candidaturas.
6. Verificação end-to-end das duas jornadas (1ª candidatura completa + 2ª candidatura abreviada).

## Pontos para decisão do PM

1. **Quantas mensagens novas no chat?** A 2ª candidatura pode acontecer quase toda em cards (sem esticar o roteiro de 23 mensagens), ou ganhar 2–3 mensagens novas de diálogo. Sugestão: só cards + 1 mensagem de retorno da IA.
2. **Vaga B com curso novo** entra na demo ou todas as 3 vagas novas nascem liberadas? Sugestão: incluir a Vaga B — o contraste conta a história do CapacitaCOOP.
