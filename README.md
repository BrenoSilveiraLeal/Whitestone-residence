# Whitestone

Whitestone é um estudo de experiência digital para apresentação imobiliária. O projeto usa React, TypeScript e Vite. A sequência tem 90 quadros WebP e um poster extraídos de `Scroll Imobiliario.zip`; o ZIP original foi preservado.

## Executar

Requer Node.js 20.19+ ou 22.12+.

```sh
npm install
npm run dev
```

Para gerar a versão de publicação na Vercel, use `npm run build`; o resultado fica em `dist/`.

## Conteúdo

Edite `src/config.ts` para ajustar a assinatura, os materiais descritos visualmente e os textos das chamadas da sequência. A apresentação não contém preço, metragem, contagens de cômodos, endereço ou contatos inventados.

As chamadas da narrativa sincronizada estão em `storyBeats`, no mesmo arquivo, com início e fim entre `0` e `1`.

## Sequência visual

Os quadros ficam em `public/assets/Hero1/img01.webp` a `img90.webp`; o poster fica em `public/assets/poster.jpg`. Os quadros foram tratados localmente com reforço uniforme de nitidez e codificação WebP de alta qualidade, preservando enquadramento e dimensões para manter a continuidade da sequência. O poster de 1920×1080 permanece como quadro de abertura; os demais quadros têm resolução nativa de 1600×900. A implementação usa canvas e carregamento progressivo em lotes. Com `prefers-reduced-motion`, o trecho sticky longo é removido e a imagem fica estática, mantendo a narrativa em HTML.

Uma cópia local dos quadros originais está em `.tmp-quality/original/` para recuperação, além do ZIP original preservado em Downloads.

Para aplicar o mesmo tratamento a uma nova sequência, instale as dependências e execute `npm run enhance:frames -- <pasta-original> <pasta-de-saída>`. Use sempre os originais do ZIP como entrada para evitar acumular nitidez em imagens já tratadas.

O rodapé identifica a página como uma experiência digital de apresentação imobiliária. A localização não é indicada.
