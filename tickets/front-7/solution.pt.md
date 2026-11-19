# Solução: As estrelas são botões

**Causa raiz.** O `client/src/components/RatingStars.tsx` desenha cada estrela como um `<span>` com `onClick`. Um span não recebe foco, não reage ao teclado e não tem papel, então as estrelas só existem para o mouse.

## Passo a passo

1. **Reproduza.** Em uma receita publicada, aperte Tab até o fim da página: as estrelas são puladas.
2. **Inspecione uma estrela.** Ela é um `<span title="4 stars">`; o coração ao lado do título é um `<button>`.
3. **Use o elemento que é um controle.**

   ```tsx
   <div role="group" aria-label="Rate this recipe" className="flex gap-1.5" onMouseLeave={() => setPreview(0)}>
     {STARS.map((stars) => (
       <button
         key={stars}
         type="button"
         className="flex size-11 items-center justify-center rounded-full border border-border bg-surface-raised text-2xl leading-none text-accent shadow-sm transition-transform hover:scale-110 disabled:opacity-50"
         title={nameOf(stars)}
         aria-label={nameOf(stars)}
         disabled={disabled}
         onMouseEnter={() => setPreview(stars)}
         onFocus={() => setPreview(stars)}
         onBlur={() => setPreview(0)}
         onClick={() => onRate(stars)}
       >
         <span aria-hidden="true">{stars <= preview ? '★' : '☆'}</span>
       </button>
     ))}
   </div>
   ```

   O `nameOf` já dá "1 star", "2 stars"… O anel de foco vem do `:focus-visible` do `styles.css`.

A referência também adiciona um teste de regressão, `client/src/components/RatingStars.keyboard.test.tsx`: um controle com nome por estrela, o Tab chegando a elas, o Espaço dando a nota da estrela em foco, o clique, e o estado desabilitado.

Depois rode `npm test`, avalie uma receita sem tocar no mouse e mova o card para **Em QA**.
