export const property = {
  name: 'Whitestone',
  signature: 'Um novo olhar sobre morar.',
  materials: ['Pedra clara', 'Caixilhos escuros', 'Planos envidraçados'],
} as const;

// Faixas relativas ao progresso da sequência. Ajuste conforme o ritmo dos quadros.
export const storyBeats = [
  { start: 0, end: 0.2, eyebrow: '01 — Chegada', title: 'Uma presença na paisagem', text: 'A fachada de pedra clara se revela entre o jardim e o horizonte.' },
  { start: 0.2, end: 0.48, eyebrow: '02 — Arquitetura', title: 'Linhas que acompanham o olhar', text: 'Volumes curvos, recortes precisos e uma varanda suspensa.' },
  { start: 0.48, end: 0.73, eyebrow: '03 — Luz', title: 'O entardecer encontra a casa', text: 'O vidro amplia a vista para o terraço e para a água.' },
  { start: 0.73, end: 1, eyebrow: '04 — Interior', title: 'Dentro e fora, em continuidade', text: 'A sequência chega à sala e à área de jantar integradas.' },
] as const;
