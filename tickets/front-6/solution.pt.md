# Solução: Os passos ocupam a largura que houver

**Causa raiz.** Em `client/src/components/StepList.tsx`, o parágrafo de um passo tem `w-[38rem] shrink-0`, 608px fixos que não encolhem, e a lista tem `overflow-x-hidden`, que corta o que não cabe. No celular o texto é mais largo que a tela e a parte que sobra fica escondida.

## Passo a passo

1. **Reproduza.** Abra uma receita com as ferramentas de desenvolvedor em 375px: cada passo está cortado na borda direita.
2. **Inspecione um passo.** O `<p>` tem 608px em uma tela de 375px; o `<ol>` esconde o que transborda.
3. **Deixe o texto quebrar no espaço que ele recebe.**

   ```tsx
   <ol className="flex flex-col gap-4" data-testid="steps">
     {steps.map((step, index) => (
       <li key={step.id} className="flex gap-3">
         <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent font-semibold text-accent-content">
           {index + 1}
         </span>
         <p className="min-w-0 flex-1 text-base leading-relaxed break-words" data-testid="step">
           {step.text}
         </p>
       </li>
     ))}
   </ol>
   ```

   O número mantém o `shrink-0` (ele não pode ser espremido); o texto ganha `min-w-0 flex-1`.

A referência também adiciona um teste de regressão, `client/src/components/StepList.layout.test.tsx`. O ambiente de teste não tem motor de layout, então ele confere as regras em si: nenhuma largura fixa e nenhum `shrink-0` no texto de um passo, e nada na lista que corte conteúdo.

Depois rode `npm test`, olhe uma receita em 375px e em 320px e mova o card para **Em QA**.
