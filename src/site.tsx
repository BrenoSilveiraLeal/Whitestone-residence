import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight, Menu, X } from 'lucide-react';
import { property, storyBeats } from './config';

const frameUrl = (index: number) => `/assets/Hero1/img${String(index + 1).padStart(2, '0')}.webp`;

function ScrollFilm() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const [beatIndex, setBeatIndex] = useState(0);
  const [reduced, setReduced] = useState(false);
  const imageCache = useRef<(HTMLImageElement | null)[]>(Array(90).fill(null));
  const loaded = useRef(new Set<number>());
  const currentFrame = useRef(-1);
  const progressRef = useRef(0);
  const raf = useRef(0);

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update(); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const draw = (index: number) => {
      const canvas = canvasRef.current;
      if (!canvas || currentFrame.current === index || document.hidden) return;
      const image = imageCache.current[index] ?? [...imageCache.current].slice(0, index + 1).reverse().find(Boolean) ?? null;
      if (!image?.complete || !image.naturalWidth) return;
      const ctx = canvas.getContext('2d'); if (!ctx) return;
      const width = canvas.clientWidth, height = canvas.clientHeight;
      // Render at native source resolution at most: higher DPR should not invent pixels.
      const dpr = Math.min(window.devicePixelRatio || 1, 2, image.naturalWidth / width, image.naturalHeight / height);
      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
      const w = image.naturalWidth * scale, h = image.naturalHeight * scale;
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(image, (width - w) / 2, (height - h) / 2, w, h);
      currentFrame.current = index;
    };
    const load = (index: number) => {
      if (index < 0 || index > 89 || loaded.current.has(index)) return;
      loaded.current.add(index);
      const image = new Image(); image.decoding = 'async'; image.src = frameUrl(index);
      image.onload = () => { imageCache.current[index] = image; if (index <= Math.round(progressRef.current * 89)) draw(Math.round(progressRef.current * 89)); };
      image.onerror = () => { imageCache.current[index] = null; };
    };
    // Poster and opening frames first; remaining frames load in small idle batches.
    const poster = new Image(); poster.src = '/assets/poster.jpg';
    poster.onload = () => { imageCache.current[0] = poster; loaded.current.add(0); draw(0); };
    // The 1920px poster is also frame zero; keep it instead of replacing it with
    // the smaller first WebP. Continue from frame two (array index one).
    [1, 2, 3, 4, 5, 6].forEach(load);
    let batch = 7;
    let cancelled = false;
    let batchTimer = 0;
    const idleLoad = () => {
      if (cancelled || document.hidden) return;
      const stop = Math.min(batch + 8, 90);
      while (batch < stop) load(batch++);
      if (batch < 90) batchTimer = window.setTimeout(idleLoad, 220);
    };
    const introObserver = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) idleLoad(); }, { rootMargin: '1200px' });
    if (sectionRef.current) introObserver.observe(sectionRef.current);

    const onScroll = () => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        const section = sectionRef.current; if (!section) return;
        const rect = section.getBoundingClientRect();
        const value = Math.min(1, Math.max(0, -rect.top / (section.offsetHeight - innerHeight)));
        progressRef.current = value;
        setProgress(value);
        const next = storyBeats.findIndex((beat) => value >= beat.start && value < beat.end);
        setBeatIndex(next < 0 ? 3 : next);
        if (!reduced) draw(Math.round(value * 89));
      });
    };
    const onResize = () => { currentFrame.current = -1; onScroll(); };
    const onVisibility = () => { if (!document.hidden) { currentFrame.current = -1; onScroll(); idleLoad(); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize); document.addEventListener('visibilitychange', onVisibility);
    onScroll();
    return () => { cancelled = true; window.clearTimeout(batchTimer); introObserver.disconnect(); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize); document.removeEventListener('visibilitychange', onVisibility); cancelAnimationFrame(raf.current); };
  }, [reduced]);

  const beat = storyBeats[beatIndex];
  return <section className={`film-section ${reduced ? 'is-reduced' : ''}`} id="casa" ref={sectionRef} aria-label="Whitestone — percurso cinematográfico">
    <div className="film-sticky">
      <div className="film-image"><img className="film-poster" src="/assets/poster.jpg" alt="Residência contemporânea de pedra clara diante de uma piscina ao entardecer" /><canvas ref={canvasRef} aria-hidden="true" />
        <div className="film-shade" />
        <div className="film-opening" style={{ opacity: Math.max(0, 1 - progress * 11) }}><span>WHITESTONE <i>—</i> APRESENTAÇÃO IMOBILIÁRIA</span><p>{property.signature}</p><h1>A paisagem muda.<br/><em>O ritmo também.</em></h1><div className="film-invitation"><span>ROLE PARA ENTRAR</span><ArrowDown size={15}/></div></div>
        <div className={`film-copy ${progress > 0.08 ? 'is-visible' : ''}`} aria-live="polite" aria-hidden={progress <= 0.08}><span>{beat.eyebrow}</span><h2>{beat.title}</h2><p>{beat.text}</p></div>
        <div className="film-progress" aria-label={`Progresso da narrativa: ${Math.round(progress * 100)}%`}><span>PERCURSO</span><div><i style={{ transform: `scaleX(${progress})` }} /></div><small>{String(Math.round(progress * 90)).padStart(2, '0')} / 90</small></div>
      </div>
    </div>
    <div className="film-alt" aria-label="Narrativa da sequência"><p>Da aproximação à fachada em pedra, o percurso revela o terraço, a piscina e os ambientes integrados para estar e jantar.</p></div>
  </section>;
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  return <>
    <header className="nav"><a href="#top" className="wordmark" aria-label="Whitestone — início">WHITESTONE<span>®</span></a>
      <nav className={menuOpen ? 'nav-links open' : 'nav-links'} id="primary-navigation" aria-label="Navegação principal">
        <a href="#casa" onClick={closeMenu}>A casa</a><a href="#arquitetura" onClick={closeMenu}>Arquitetura</a><a href="#paisagem" onClick={closeMenu}>Paisagem</a><a href="#contato" onClick={closeMenu}>O projeto</a>
        <a className="nav-visit" href="#contato" onClick={closeMenu}>Apresentar meu imóvel <ArrowUpRight size={15}/></a>
      </nav>
      <button className="menu-toggle" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button>
    </header>
    <main id="top">
      <ScrollFilm />
      <section className="approach section-pad" aria-labelledby="approach-title"><div className="section-label"><span>ESTRATÉGIA DE APRESENTAÇÃO</span><span>WHITESTONE / EXPERIÊNCIA DIGITAL</span></div><div className="approach-grid"><div><h2 id="approach-title">Do primeiro olhar<br/><em>a um percurso.</em></h2><p className="approach-lead">Uma apresentação imobiliária também pode dar ritmo às imagens e contexto à arquitetura.</p></div><div className="approach-points"><article><span>01</span><div><h3>Narrativa visual</h3><p>Os 90 quadros respondem à rolagem e conduzem o olhar pela fachada, pelo terraço e pelos ambientes.</p></div></article><article><span>02</span><div><h3>Informação no contexto</h3><p>As chamadas aparecem junto aos momentos de chegada, arquitetura, luz e integração entre dentro e fora.</p></div></article><article><span>03</span><div><h3>Feita para diferentes telas</h3><p>Carregamento progressivo, navegação acessível e uma apresentação estática para quem prefere movimento reduzido.</p></div></article></div></div></section>
      <section className="intro section-pad" aria-labelledby="intro-title"><div className="section-label"><span>01 / A CASA</span><span>UMA ARQUITETURA PARA SER PERCORRIDA</span></div><div className="intro-grid"><h2 id="intro-title">Um lugar para<br/><em>abrir espaço</em></h2><div className="intro-copy"><p>Volumes curvos, pedra clara e grandes superfícies de vidro definem a presença da Whitestone na paisagem.</p><p>Do terraço à sala, a sequência revela uma casa pensada visualmente como uma continuidade entre dentro e fora.</p><a className="text-link" href="#arquitetura">Percorra os detalhes <ArrowUpRight size={16}/></a></div></div>
        <div className="experience-points"><div><span>01</span><strong>Uma chegada que revela a arquitetura</strong></div><div><span>02</span><strong>Terraço, jardim e piscina em continuidade</strong></div><div><span>03</span><strong>Sala e jantar conectados à paisagem</strong></div></div>
      </section>
      <section className="gallery section-pad" aria-labelledby="gallery-title"><div className="section-label"><span>02 / MOMENTOS</span><span>UM PERCURSO EM IMAGENS</span></div><div className="gallery-head"><h2 id="gallery-title">A casa, em <em>detalhe</em></h2><p>Uma aproximação em três momentos.</p></div>
        <div className="gallery-grid"><figure className="gallery-large"><img src="/assets/Hero1/img23.webp" alt="Fachada curva em pedra clara com caixilhos escuros" loading="lazy"/><figcaption><span>01</span> A fachada se aproxima</figcaption></figure><figure className="gallery-small"><img src="/assets/Hero1/img59.webp" alt="Terraço com piscina e mobiliário junto à casa" loading="lazy"/><figcaption><span>02</span> Terraço e horizonte</figcaption></figure><figure className="gallery-small"><img src="/assets/Hero1/img88.webp" alt="Sala de estar integrada à área de jantar, com grandes planos de vidro" loading="lazy"/><figcaption><span>03</span> Dentro e fora</figcaption></figure></div>
        <p className="disclaimer">Fachada, terraço e áreas sociais, vistos ao longo da sequência.</p>
      </section>
      <section className="architecture section-pad" id="arquitetura" aria-labelledby="architecture-title"><div className="architecture-image" role="img" aria-label="Detalhe da fachada em pedra clara e das aberturas envidraçadas"/><div className="architecture-panel"><div className="section-label"><span>03 / ARQUITETURA</span></div><h2 id="architecture-title">Matéria, luz<br/>e <em>silêncio</em></h2><p>A superfície clara contrasta com os caixilhos escuros. Os planos envidraçados prolongam o olhar da área social para o terraço.</p><div className="material-list">{property.materials.map((material, i)=><div key={material}><span>0{i+1}</span>{material}</div>)}</div></div></section>
      <section className="location section-pad" id="paisagem"><div className="section-label"><span>04 / PAISAGEM</span><span>CASA E EXTERIOR</span></div><div className="location-content"><span className="location-mark">W</span><div><h2>O horizonte<br/><em>faz parte da casa.</em></h2><p>O jardim, a piscina e as aberturas voltadas para o exterior compõem o cenário desta apresentação.</p></div></div></section>
      <section className="contact" id="contato"><div className="contact-image"/><div className="contact-content"><span>WHITESTONE • EXPERIÊNCIA IMOBILIÁRIA</span><h2>Seu imóvel merece<br/><em>um percurso próprio.</em></h2><p>Veja novamente como a narrativa conduz pela arquitetura.</p><a className="contact-button" href="#casa">Rever o percurso <ArrowUpRight size={17}/></a></div></section>
    </main>
    <footer className="footer"><a href="#top" className="wordmark">WHITESTONE<span>®</span></a><span>Experiência digital de apresentação imobiliária</span><a href="#top">VOLTAR AO TOPO ↑</a></footer>
  </>;
}

export default App;
