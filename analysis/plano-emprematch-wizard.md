# Plano de Execução — EmpreMatch (PDF) + Wizard de Candidatura Externa

> Protótipo de altíssima fidelidade: as duas entregas são peças de storytelling da jornada do candidato.
> Narrativa-alvo da demo: **match ideal → EmpreMatch liberado → candidatura guiada na plataforma externa**.

## Contexto (estado atual do código)

| Peça | Onde está | Situação |
|---|---|---|
| Liberação do match | `PrereqCard` em `src/app/assistente/page.tsx` (~l.1966) | Mostra "Match Card criado — 87% match" após cursos concluídos, com 4 adaptações ao EmpreCard base |
| PDF | `src/lib/generateCurriculoPdf.ts` (jsPDF) + duplicata em `/curriculo-pdf` | Currículo genérico, sem personalização para a vaga |
| Redirecionamento | Botão "Candidatar-se" → `/ats-vaga` (nova aba) + avança `proto_stage` 19 | Pula direto, sem preparação |
| Página externa fake | `/ats-vaga` (Sicoob Dom Eliseu "Trabalhe Conosco") | Form + upload de CV, funcional para a demo |

Estágio do protótipo onde tudo acontece: **18 — "Pré-requisitos · curso"** (cursos concluídos liberam a vaga). O clique em "Candidatar-se" leva ao **19+ — pós-candidatura**.

---

## Etapa 0 — Nomenclatura (rápida, destrava as duas atividades)

- Renomear **"Match Card" → "EmpreMatch"** em todas as menções do chat (`PrereqCard`: "EmpreMatch criado", "Seu EmpreMatch está pronto", botão "Baixar EmpreMatch").
- Ajustar também o texto de `/ats-vaga`: "Baixe seu currículo do EmpregaCOOP" → "Baixe seu EmpreMatch" e o nome do arquivo anexado no upload fake.

---

## Atividade A — PDF EmpreMatch (executar primeiro)

**Objetivo:** o PDF baixado deve ser o currículo **completo e real** do candidato, **customizado para a vaga** — exatamente o que o card no chat promete — assinado pelo EmpregaCOOP.

### Conteúdo do PDF (1–2 páginas A4)

1. **Cabeçalho**: nome, subtítulo adaptado à vaga ("Gestão Administrativo-Financeira · Tecnologia e Dados" em vez de "Product Designer"), contato, cidade.
2. **Selo de contexto discreto**: "EmpreMatch · Gerente Administrativo Financeiro · Sicoob Dom Eliseu" (marca que este currículo foi preparado para esta vaga — sem parecer panfleto).
3. **Perfil/Essência reframeada**: foco em gestão estratégica, análise financeira e ambiente cooperativista.
4. **Experiência profissional completa** (todas as 7), **reordenada por relevância** para a vaga, com descrições ajustadas para destacar gestão, dados e resultados.
5. **Formação acadêmica**.
6. **Cursos CapacitaCOOP concluídos** (seção nova — é o diferencial da plataforma: "Cooperativismo Essencial", "Gestão Financeira em Cooperativas", com carga horária).
7. **Habilidades** com as skills da vaga em destaque primeiro (Gestão financeira, Análise de dados, Automação).
8. **Idiomas + Disponibilidade**.
9. **Assinatura (rodapé)**:
   - Linha principal: "Gerado por **EmpregaCOOP** · empregacoop.com.br" (com identidade visual da marca).
   - Linha final, discreta (fonte menor, cor muted): menção **Empregol** — ex.: "Uma solução Empregol". *(confirmar grafia/formato exato com o PM antes de finalizar)*

### Implementação

- Evoluir `src/lib/generateCurriculoPdf.ts` → `generateEmpreMatchPdf.ts` (jsPDF, download direto — mais forte na demo: um clique gera arquivo real que "seria anexado" na ATS).
- Nome do arquivo: `EmpreMatch_Bolivar_Alencastro_Gerente_Adm_Financeiro.pdf`.
- Dados da vaga parametrizados num objeto único (título, cooperativa, skills destacadas) para fácil ajuste de conteúdo.
- **Unificar duplicata**: `/curriculo-pdf` passa a renderizar o mesmo EmpreMatch (versão de apresentação em tela para stakeholders) ou é aposentada — decidir na execução; padrão sugerido: manter e sincronizar, é útil para projetar em reunião.

### Critérios de aceite

- [ ] PDF baixado reflete as 4 adaptações listadas no card do chat.
- [ ] Seções em estrutura padrão de currículo (a história do "auto-fill da ATS lê bem" se sustenta visualmente).
- [ ] Assinatura EmpregaCOOP visível + Empregol discreto no final.
- [ ] Visual alinhado à identidade do protótipo (roxo #5c0060 como cor de marca).

---

## Atividade B — Wizard de candidatura externa

**Objetivo:** no momento exato em que o candidato está **apto** (pré-requisitos concluídos, EmpreMatch liberado) e **inicia a candidatura**, a Isa o prepara para o que vai encontrar fora do EmpregaCOOP. Conteúdo **genérico** — vale para Gupy, Empregare ou qualquer site de carreira.

### Trigger e posição no fluxo

- Botão **"Candidatar-se"** do `PrereqCard` (estágio 18) deixa de abrir `/ats-vaga` direto e passa a abrir o **wizard** (modal overlay).
- Ao concluir o wizard, o CTA final abre `/ats-vaga` em nova aba e avança o fluxo para o estágio 19 (comportamento atual preservado).
- Fechar/pular o wizard não avança o estágio (candidato pode reabrir).

### Formato

Modal em formato **chat/wizard**: avatar da Isa, um passo por tela, indicador de progresso (dots), navegação Voltar/Avançar. Componente novo `ExternalApplicationWizard` (em `src/components/`), reutilizável.

### Roteiro dos passos (conteúdo genérico, baseado na análise Gupy × Empregare)

| # | Passo | Mensagem-chave |
|---|---|---|
| 1 | **Você vai continuar em outra plataforma** | A candidatura acontece no site da cooperativa (plataformas como Gupy, Empregare ou página de carreiras própria). O EmpregaCOOP te preparou até aqui — agora te acompanho na saída. |
| 2 | **Entre ou crie sua conta** | A plataforma vai pedir cadastro com e-mail. Use o mesmo e-mail do EmpregaCOOP para facilitar seu controle. |
| 3 | **Anexe seu EmpreMatch** ⭐ | Momento-chave: no campo de upload de currículo, anexe o PDF do seu EmpreMatch. A maioria das plataformas lê o arquivo e **pré-preenche seu perfil automaticamente**. Botão embutido: **Baixar EmpreMatch**. |
| 4 | **Revise seu perfil** | Confira o que o preenchimento automático importou: dados pessoais, formação, experiências, idiomas e habilidades. Corrija o que vier errado e complete até a barra de progresso ficar cheia. |
| 5 | **Perguntas opcionais** | Diversidade e PCD podem aparecer — são opcionais e não eliminatórias. Responda apenas se quiser. |
| 6 | **Envie e volte para me contar** | Clique em "Enviar candidatura" na plataforma. Depois volte ao EmpregaCOOP e atualize o status em "Minhas candidaturas" — eu te ajudo a acompanhar. CTA final: **Ir para a página da vaga →** |

*(Passo 6 coerente com a decisão de design existente: sem integração ATS, o candidato auto-gerencia o status.)*

### Critérios de aceite

- [ ] Wizard abre ao clicar "Candidatar-se" no estágio 18 com pré-requisitos concluídos.
- [ ] Linguagem 100% genérica (nenhum passo depende de layout de uma ATS específica).
- [ ] Passo 3 permite baixar o EmpreMatch sem sair do wizard.
- [ ] CTA final abre `/ats-vaga` e avança para estágio 19; fechar não avança.
- [ ] Visual consistente com os cards do chat (mesma família do PrereqCard/EmpreCard).

---

## Sequência de execução e verificação

1. Etapa 0 — renomear Match Card → EmpreMatch.
2. Atividade A — PDF EmpreMatch (o wizard referencia o artefato).
3. Atividade B — wizard.
4. Retoques em `/ats-vaga` (nomes de arquivo/textos EmpreMatch).
5. **Verificação end-to-end**: percorrer estágios 15 → 19 no navegador (EmpreCard gerado → vaga compatível → cursos → EmpreMatch liberado → wizard → ats-vaga → candidatura confirmada), com screenshots de cada tela para revisão do PM.

## Atualização (2026-07-12): PDF evoluiu para v2

O gerador do PDF (`generateEmpreMatchPdf.ts`) foi reescrito seguindo `analysis/plano-pdf-matchcard-v2.md` — coluna única (sem risco de embaralhar ordem de leitura em ATS), skills como texto corrido com vírgulas (sem pills gráficas), headings canônicos, metadados do PDF, logos reais (imagem) + filete de marca em todas as páginas. `/curriculo-pdf` sincronizada com o mesmo modelo.

## Decisões confirmadas pelo PM (2026-07-12)

1. **Rodapé "Empregol"**: linha discreta "Uma solução Empregol", abaixo da assinatura principal "Gerado por EmpregaCOOP".
2. **Liberação do EmpreMatch**: mantém o gatilho atual — após pré-requisitos (cursos) concluídos no `PrereqCard`.
3. **`/curriculo-pdf`**: sincronizada como versão de apresentação em tela do EmpreMatch (útil para projetar em reunião).
