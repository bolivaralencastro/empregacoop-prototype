# Plano — Match Card PDF v2 (modelo ATS-safe com identidade EmpregaCOOP)

> Objetivo: o PDF baixado deve (1) ser parseado corretamente por qualquer ATS — extração de texto limpa, ordem de leitura correta, keywords íntegras — e (2) carregar identidade visual clara de "ativo EmpregaCOOP / Empregol" sem comprometer o parsing.

## Princípio geral

Tudo que o ATS lê = **texto simples, coluna única, com espaços reais**.
Tudo que é marca = **imagem ou elemento gráfico** (invisível para parsers de texto, forte para o olho humano).

---

## 1. Estrutura do documento (ordem canônica de currículo)

| # | Seção | Heading no PDF | Nota ATS |
|---|---|---|---|
| 1 | Identificação | (sem heading) Nome → subtítulo → contato | Nome na primeira linha; contato como texto no corpo (nunca em imagem) |
| 2 | Selo Match Card | badge roxo (gráfico) + linha de texto | Texto do selo vem DEPOIS do contato, para não confundir extração de nome/título |
| 3 | Resumo | "Resumo Profissional" | Heading padrão reconhecido por parsers PT-BR (hoje é "Perfil" — trocar) |
| 4 | Experiência | "Experiência Profissional" | ✅ já correto |
| 5 | Formação | "Formação Acadêmica" | ✅ já correto |
| 6 | Certificações | "Certificações e Cursos" | Renomear (hoje "Cursos CapacitaCOOP Concluídos" — CapacitaCOOP vai no corpo, não no heading) |
| 7 | Habilidades | "Habilidades" | ✅ correto — mas ver correção crítica abaixo |
| 8 | Idiomas | "Idiomas" | ✅ |
| 9 | Disponibilidade | "Disponibilidade" | Vira seção própria em coluna única (hoje está em 2 colunas lado a lado) |
| 10 | Assinatura | rodapé com logos | Ver seção 3 |

## 2. Correções ATS (por prioridade)

### 🔴 Crítica — Skills sem separador
Hoje cada pill é um `doc.text()` isolado sem espaço entre elas → parsers podem extrair "Gestão FinanceiraAnálise de Dados", quebrando keyword matching (a função nº 1 do ATS).

**Solução:** skills como **texto corrido separado por vírgulas**, em duas linhas de estilo:
- Linha 1 (bold, roxo): `Gestão Financeira, Análise de Dados, Automação com IA,` — as skills da vaga em destaque
- Continuação (regular, cinza): demais skills separadas por vírgula
- Sem pills gráficas nas skills. O destaque visual passa a ser tipográfico (cor + peso), que extrai perfeitamente.

### 🔴 Crítica — Layout de duas colunas na experiência
Hoje período fica à esquerda e cargo/empresa à direita no mesmo Y → parsers posicionais podem embaralhar a ordem.

**Solução:** coluna única, padrão clássico:
```
Product Designer — Keeps Learning
Ago 2022 — atual
Liderança de produto com foco em automação...
```
Cargo (bold escuro) + empresa (roxo) na primeira linha, período na segunda, descrição em seguida. Ordem de desenho = ordem de leitura. Mesmo padrão para Formação e Certificações.

### 🟡 Média — Idiomas/Disponibilidade lado a lado
Empilhar as duas seções em coluna única (Idiomas, depois Disponibilidade).

### 🟡 Média — Metadados do PDF
`doc.setProperties({ title, author: "Bolivar Alencastro", subject: "Match Card — Gerente Administrativo Financeiro · Sicoob Dom Eliseu", keywords: skills.join(", "), creator: "EmpregaCOOP · Empregol" })`. Vários ATS leem metadados; também reforça a atribuição da marca em nível de arquivo.

### 🟢 Baixa — Datas consistentes
Padronizar todos os períodos no formato `mmm aaaa — mmm aaaa` (ex.: "Ago 2022 — Atual", "Jan 2014 — Dez 2018"). Parsers de data preferem mês+ano.

## 3. Identidade visual (camada gráfica, invisível ao parser)

1. **Logo EmpregaCOOP no topo direito** (imagem PNG pequena, ~22mm) — asset copiado para `public/brand/` (evita CORS ao converter para dataURL no jsPDF). Imagens são ignoradas na extração de texto → zero risco de ATS.
2. **Filete roxo no topo da página** (retângulo de 2mm na cor da marca, largura total) — assinatura visual imediata de "documento EmpregaCOOP", sem nenhum texto.
3. **Selo "Match Card · vaga · cooperativa"** mantido como badge roxo (posição atual, após contato).
4. **Rodapé de assinatura em todas as páginas**:
   - Logo EmpregaCOOP pequeno + texto "Gerado por EmpregaCOOP · empregacoop.com.br" (roxo, bold)
   - Linha discreta "Uma solução Empregol" (cinza, 6.5pt) — com logo da Empregol **se o PM fornecer o asset**; até lá, permanece texto
   - Implementado como função `footer()` chamada por página (hoje só sai na última página)
5. **87% match** mantido como texto pequeno ao lado do selo.

## 4. Sincronização

- `/curriculo-pdf` (versão de apresentação em tela) atualizada para espelhar o mesmo layout v2.
- `analysis/plano-emprematch-wizard.md` ganha nota apontando para este plano.

## 5. Verificação

1. Gerar o PDF no fluxo real (botão "Baixar Match Card").
2. **Teste de extração de texto** (o teste que importa): extrair o texto do PDF e conferir — skills com vírgulas íntegras, ordem cargo→empresa→período→descrição correta, nome na primeira linha, contato legível.
3. Conferência visual das 2 páginas (filete, logo, rodapé em ambas).
4. Typecheck + lint.

## Pendência (input do PM)

- **Asset do logo Empregol**: existe arquivo/URL? Sem ele, a menção Empregol permanece textual (o que já cumpre a atribuição discreta).
