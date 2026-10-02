/* Bodega do Sertão — interações */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const RESERVA = 'https://reservation-widget.tagme.com.br/smartlink/643d5ad81951c40055a0e396';
  const ZAP = '5582998310088';
  const brl = v => 'R$ ' + (Number.isInteger(v) ? v : v.toFixed(2).replace('.', ','));

  /* Topo */
  const topo = $('#topo');
  const onScroll = () => topo.classList.toggle('is-scrolled', scrollY > 30);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* Menu hambúrguer */
  const burger = $('#burger'), nav = $('#nav');
  const fechar = () => { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Abrir menu'); document.body.classList.remove('menu-open'); };
  burger.addEventListener('click', () => {
    const abrir = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', abrir);
    burger.setAttribute('aria-expanded', String(abrir));
    burger.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
    document.body.classList.toggle('menu-open', abrir);
  });
  $$('a', nav).forEach(a => a.addEventListener('click', fechar));
  addEventListener('keydown', e => { if (e.key === 'Escape') fechar(); });

  /* Agora na Bodega — hora de Maceió (UTC-3) */
  const agora = () => {
    const d = new Date(Date.now() - 3 * 3600e3);
    const m = d.getUTCHours() * 60 + d.getUTCMinutes();
    if (m >= 720 && m < 960) return 'almoco';
    if (m >= 1080 && m < 1320) return 'jantar';
    return m < 720 ? 'antes' : (m < 1080 ? 'tarde' : 'noite');
  };
  const status = () => {
    const s = agora(); const chip = $('[data-status]');
    const t = $('#agora-title'), sub = $('#agora-sub');
    $$('.momento').forEach(el => { el.classList.toggle('is-now', el.dataset.momento === s); el.classList.toggle('is-off', (s === 'almoco' || s === 'jantar') && el.dataset.momento !== s); });
    const textos = {
      almoco: ['Hora do almoço!', 'Estamos abertos agora, com self-service e à la carte até as 16h.', 'Aberto agora · almoço'],
      jantar: ['Hora do jantar com forró!', 'Estamos abertos agora até as 22h. Forró ao vivo das 18h30 às 21h30.', 'Aberto agora · jantar'],
      antes: ['Já já tem almoço.', 'Abrimos hoje às 12h. Que tal já reservar a mesa?', 'Abre hoje às 12h'],
      tarde: ['Entre o almoço e o jantar.', 'Voltamos às 18h com jantar e forró ao vivo.', 'Volta às 18h'],
      noite: ['A Bodega já fechou por hoje.', 'Amanhã tem de novo: almoço às 12h e jantar às 18h.', 'Abre amanhã às 12h']
    }[s];
    t.textContent = textos[0]; sub.textContent = textos[1]; chip.textContent = textos[2];
    chip.classList.toggle('is-open', s === 'almoco' || s === 'jantar');
  };
  status(); setInterval(status, 60e3);

  /* Cardápio com abas */
  const tabs = $('#tabs'), panel = $('#menu-panel');
  const render = id => {
    const g = CARDAPIO.find(c => c.id === id);
    $$('.tab', tabs).forEach(b => { const on = b.dataset.id === id; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; });
    panel.setAttribute('aria-labelledby', 'tab-' + id);
    panel.innerHTML = `<h3>${g.title}</h3>${g.note ? `<p class="nota">${g.note}</p>` : ''}` +
      g.sections.map(s => `<div class="menu-sec">${s.name ? `<h4>${s.name}</h4>` : ''}<ul class="itens">` +
        s.items.map(([n, p, d], i) => `<li class="item${d ? ' tem-desc' : ''}" style="animation-delay:${Math.min(i, 12) * 25}ms"${d ? ' role="button" tabindex="0" aria-expanded="false"' : ''}><b>${n}${d ? '<span class="item__seta" aria-hidden="true"><svg viewBox="0 0 12 12"><path d="M2 4l4 4 4-4"/></svg></span>' : ''}</b><span class="preco">${brl(p)}</span>${d ? `<p><span>${d}</span></p>` : ''}</li>`).join('') +
        `</ul></div>`).join('');
  };
  CARDAPIO.forEach((c, i) => {
    const b = document.createElement('button');
    b.className = 'tab'; b.type = 'button'; b.role = 'tab'; b.id = 'tab-' + c.id; b.dataset.id = c.id; b.textContent = c.tab;
    b.setAttribute('aria-controls', 'menu-panel');
    b.addEventListener('click', () => render(c.id));
    b.addEventListener('keydown', e => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const all = $$('.tab', tabs); const k = (all.indexOf(b) + (e.key === 'ArrowRight' ? 1 : -1) + all.length) % all.length;
      all[k].focus(); all[k].click();
    });
    tabs.appendChild(b);
  });
  render(CARDAPIO[0].id);
  /* Mobile: descrição abre ao tocar */
  const mob = matchMedia('(max-width: 900px)');
  const toggleItem = li => { if (!mob.matches || !li) return; const o = li.classList.toggle('is-open'); li.setAttribute('aria-expanded', o); };
  panel.addEventListener('click', e => toggleItem(e.target.closest('.item.tem-desc')));
  panel.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.item.tem-desc')) { e.preventDefault(); toggleItem(e.target); } });

  /* Triopioquinha */
  const SABORES = [
    { id: 'nata', n: 'Carne de sol com nata', k: 'salgado', c: '#9A4A2C' },
    { id: 'rendada', n: 'Queijo coalho rendada', k: 'salgado', c: '#F2D27A' },
    { id: 'tonha', n: 'Molho Tonha Xique', k: 'salgado', c: '#D2452F' },
    { id: 'beijinho', n: 'Beijinho de coco', k: 'doce', c: '#FFF8EE' },
    { id: 'ddl', n: 'Doce de leite com banana', k: 'doce', c: '#C98236' },
    { id: 'goiabada', n: 'Goiabada com queijo manteiga', k: 'doce', c: '#B8283A' }
  ];
  let picks = [];
  const slotsEl = $('#trio-slots'), saboresEl = $('#trio-sabores');
  const go = $('#trio-go'), reset = $('#trio-reset'), falta = $('#trio-falta');
  const trio = (animar = -1) => {
    slotsEl.innerHTML = [0, 1, 2].map(i => {
      const s = SABORES.find(x => x.id === picks[i]);
      return `<button type="button" class="slot ${s ? 'is-full' : ''}" data-i="${i}" aria-label="${s ? 'Tirar ' + s.n : 'Espaço vazio'}">
        <span class="slot__tap"><span class="slot__recheio" style="background:${s ? s.c : 'transparent'}"></span><span class="slot__goma" ${s && i !== animar ? 'style="animation:none"' : ''}></span></span>
        <span class="slot__nome">${s ? s.n : 'escolha um sabor'}</span></button>`;
    }).join('');
    saboresEl.innerHTML = SABORES.map(s => {
      const q = picks.filter(p => p === s.id).length;
      return `<button type="button" class="sabor" data-id="${s.id}" ${picks.length >= 3 && !q ? 'disabled' : ''}>
        <span class="sabor__cor" style="background:${s.c}"></span>
        <span class="sabor__nome"><b>${s.n}</b><small>${s.k}</small></span>
        <span class="sabor__qtd" aria-hidden="true">${q ? '×' + q : '+'}</span></button>`;
    }).join('');
    const ok = picks.length === 3;
    go.hidden = reset.hidden = !ok; falta.hidden = ok;
    falta.textContent = `Faltam ${3 - picks.length} sabor${3 - picks.length > 1 ? 'es' : ''}…`;
    if (ok) {
      const nomes = picks.map(p => SABORES.find(x => x.id === p).n.toLowerCase());
      go.href = `https://wa.me/${ZAP}?text=` + encodeURIComponent(`Olá, Bodega do Sertão! Vi no site e quero uma Triopioquinha com: ${nomes.join(', ')}.`);
    }
  };
  saboresEl.addEventListener('click', e => { const b = e.target.closest('.sabor'); if (!b || picks.length >= 3) return; picks.push(b.dataset.id); trio(picks.length - 1); });
  slotsEl.addEventListener('click', e => { const b = e.target.closest('.slot.is-full'); if (!b) return; picks.splice(+b.dataset.i, 1); trio(); });
  reset.addEventListener('click', () => { picks = []; trio(); });
  trio();

  /* Vinhos */
  $('#rotulos').innerHTML = VINHOS.map(v => `<article class="rotulo rv"><small>${v.t}</small><b>${v.n}</b><p>${v.d}</p><span class="preco">${brl(v.p)}</span></article>`).join('');

  /* Bodega FM — carrega o Spotify só ao tocar */
  const fm = $('#fm'), fmBtn = $('#fm-btn');
  fmBtn.addEventListener('click', () => {
    if (!fm.classList.contains('is-playing')) {
      if (!$('#fm-player iframe')) $('#fm-player').innerHTML = '<iframe title="Playlist Bodega FM no Spotify" src="https://open.spotify.com/embed/playlist/1W0f0GJscs8TkoVHVJLW8H?utm_source=generator" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>';
      fm.classList.add('is-playing'); fmBtn.setAttribute('aria-label', 'Fechar a playlist');
    } else { fm.classList.remove('is-playing'); fmBtn.setAttribute('aria-label', 'Abrir a playlist Bodega FM'); }
  });
  $('.fm-tag').addEventListener('click', () => setTimeout(() => { if (!fm.classList.contains('is-playing')) fmBtn.click(); }, 600));

  /* Vídeos: só carregam se o arquivo existir e quando entram na tela */
  const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const vio = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    if (e.isIntersecting) {
      if (!v.src && v.dataset.src && !reduz) {
        v.addEventListener('loadeddata', () => { v.classList.add('is-on'); v.play().catch(() => {}); }, { once: true });
        v.addEventListener('error', () => v.remove(), { once: true });
        v.src = v.dataset.src;
      } else if (v.src) v.play().catch(() => {});
    } else if (v.src) v.pause();
  }), { rootMargin: '200px' });
  $$('video[data-src]').forEach(v => vio.observe(v));

  /* Revelar ao rolar */
  $$('.sec-head, .momentos, .trio, .bule-window, .ambientes__txt, .galeria, .polaroids, .fm, .visite__info, .visite__mapa').forEach(el => el.classList.add('rv'));
  const rio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); rio.unobserve(e.target); } }), { threshold: .12 });
  $$('.rv').forEach(el => rio.observe(el));
})();
