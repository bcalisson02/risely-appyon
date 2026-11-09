# Risely — Desafio 1 (teste prático Appyon)

App de fitness e nutrição implementado a partir do pacote de design em `../design_handoff_risely`:
onboarding de 18 telas com plano calculado, contador de calorias (N1–N7), treinos em casa (W1–W7),
coach com IA (C1–C5) e a tela Today (H1).

**Stack:** Expo SDK 58 · React Native 0.88 · TypeScript · expo-router · Reanimated 4 + Gesture Handler 3 ·
expo-blur · expo-linear-gradient · expo-haptics · expo-image · react-native-svg · phosphor-react-native ·
Zustand + AsyncStorage. Tudo local, sem backend.

---

## Como rodar

```bash
npm install
npx expo start          # w = web, i = iOS, a = Android
```

- **Web:** `npx expo start --web`. Em tela de desktop (≥ 600 px) o app aparece dentro de uma moldura de
  iPhone 393 pt de largura, como no protótipo HTML. Em celular, ocupa a tela inteira e usa as safe areas reais.
- **iOS/Android:** todas as dependências nativas fazem parte do SDK do Expo. Abra no Expo Go ou gere um
  dev build (`npx expo run:ios` / `run:android`).
- **Recomeçar o onboarding:** abra `/onboarding/0`, ou limpe os dados do site (o estado fica salvo no
  AsyncStorage / localStorage).

Checagens:

```bash
npx tsc --noEmit        # tipos: 0 erros
npx eslint src          # lint: 0 erros (avisos de exhaustive-deps em efeitos de montagem)
```

### Build web e deploy

```bash
npm run export:web      # = npx expo export -p web  →  ./dist
```

`dist/` é um SPA estático. Já está configurado para os dois hosts:

- **Vercel:** `vercel.json` (build, `outputDirectory: dist` e rewrite de todas as rotas para `/`).
  `npx vercel --prod` na raiz, ou importe o repositório no painel.
- **Netlify:** `netlify.toml` + `public/_redirects` (copiado para `dist/`). `npx netlify deploy --prod --dir dist`,
  ou arraste a pasta `dist` no painel.

Os rewrites são necessários porque as rotas (`/nutrition`, `/onboarding/7`…) são do cliente.

---

## Decisões técnicas

**Navegação: stack em JS em vez do native-stack.** O link público é web, e o native-stack não anima no
navegador. Usei `expo-router/js-stack` com interpolators próprios (`src/nav/transitions.tsx`), nos tempos
e curvas do README:

| Transição | Comportamento | Tempo / curva |
|---|---|---|
| Push (onboarding, W3, W4) | nova tela entra pela direita, a anterior vai a −30% sob sombra preta de 8% | 540 ms, `cubic-bezier(0.32,0.72,0,1)` |
| Sheet (N2, W2) | dim até `rgba(0,0,0,0.28)`, sheet sobe do rodapé, grabber 36×5, arrastar para fechar | 560 ms abre / 420 ms fecha |
| Modal em tela cheia (scan, sessão, coach) | sobe do rodapé, a tela de trás escurece para 85% | 560 ms / 480 ms |
| Troca de aba | crossfade + indicador preto deslizando | 280 ms + 460 ms `cubic-bezier(0.34,1.4,0.64,1)` |
| Reduce Motion | todos os slides viram fade, loops decorativos param | 340 ms |

O stack decide a animação da tela de baixo a partir da tela que entra, então o push desloca a tela
anterior, o modal só a escurece e o sheet a deixa parada.

**Header do onboarding fixo.** O botão de voltar e a barra de 5 segmentos ficam no layout do onboarding,
fora do stack. As telas deslizam por baixo e só o preenchimento anima (650 ms, 180 ms de atraso). O conteúdo
entra em cascata (opacidade + translateY 10, 460 ms, 60 ms de intervalo).

**Controles com manipulação direta** (`src/onboarding/controls/`), todos com Gesture Handler 3
(`usePanGesture`) e shared values do Reanimated, para o gesto rodar na UI thread:

- **Régua:** 8 pt por 0,1 kg, arrasto + arremesso com inércia (fórmula do protótipo, com velocidade limitada
  e zerada se o dedo parou antes de soltar), snap em 0,1, haptic a cada tick. Os ticks são virtualizados
  (cerca de 120 renderizados, e não 1.100).
- **Ritmo:** slider de 0,25 a 1,0 em passos de 0,05; o polegar segue o dedo e o valor faz snap. O gráfico de
  projeção (SVG 329×160) é recalculado ao vivo pelo `derive()`.
- **Barras de atividade** (toque ou arraste), **seletor de dias** (pelo menos 1 fica ligado, com tremida),
  **dial circular** (5–60 min, regras de volta completa do protótipo), **cards com swipe** (snap no centro,
  escala 0,9 / opacidade 0,6 nas laterais), **wheel pickers** (rotateX em 3D, inércia, toque para pular) e
  **segmented control** com indicador deslizante.

**`derive()` e `plan()` portados literalmente** em `src/logic/derive.ts`. Com os valores padrão o resultado é
**62 kg em 27 de jan, 1.650 kcal, P110 C190 G50**, e o caminho da curva e a posição do rótulo batem com o
markup do protótipo. As metas de Nutrição (kcal e macros) vêm do plano, então mudar as respostas muda o N1.

**Números consistentes entre telas.** `useDay()` calcula meta, consumido, gasto, restante e macros a partir
do store. Today, N1/N7 e o Coach leem a mesma fonte:

- antes do jantar: restam 810, consumidas 1.050, P60 C105 G26;
- depois do bowl escaneado (628 kcal): restam 182, consumidas 1.678, P106 C167 G48.

**Estado.** Zustand com `persist` + AsyncStorage para onboarding, nutrição e treinos. O coach fica só em
memória e reinicia junto com o app.

**Tipografia.** SF Pro no iOS. No Android usa Inter (`@expo-google-fonts/inter`). No web, a pilha do protótipo
(`-apple-system`, depois Inter via Google Fonts). Os números usam `ui-rounded` com algarismos tabulares.

**Aura.** As auras em `radial-gradient` do CSS foram refeitas com elipses SVG preenchidas por um
`RadialGradient` em `objectBoundingBox`. É a mesma matemática do CSS, sem blur.

**Glass.** `BlurView` (intensidade 40) com overlay branco no nativo, e `backdrop-filter: blur(20px) saturate(180%)`
no web.

**Animações JS vs. UI thread.** Gestos, press feedback, indicadores e entradas usam o Reanimated. Count-ups e
preenchimento de anéis usam um tween em `requestAnimationFrame` (`useTween`), que se comporta igual no web e
no nativo.

---

## Estrutura de pastas

```
risely/
  app.json · vercel.json · netlify.toml · public/_redirects
  assets/                       imagens copiadas de design/assets
  src/
    app/                        rotas (expo-router)
      _layout.tsx               stack raiz, fontes, moldura web, transições por rota
      index.tsx                 redireciona para o onboarding ou para as abas
      onboarding/_layout.tsx    stack do onboarding + header fixo de progresso
      onboarding/[step].tsx     O00–O17
      (tabs)/_layout.tsx        abas em JS com a tab bar flutuante custom
      (tabs)/index.tsx          H1 Today
      (tabs)/nutrition.tsx      N1 / N7 (toast com Desfazer)
      (tabs)/workouts.tsx       W1
      category.tsx              W3
      workout/[id].tsx          W4
      log-food.tsx              N2 (sheet)
      filters.tsx               W2 (sheet)
      scan.tsx                  N3 → N4 → N5 (modal)
      search-food.tsx           N6 (modal)
      session.tsx               W5 ↔ W6 → W7 (modal escuro)
      coach.tsx                 C1–C5 (modal, sem tab bar)
    components/                 Press, Button, Glass, Aura, Ring, List (InsetList/Row/IconTile),
                                Controls (SelectTile, Chip, Switch, Segmented), Sheet, TabBar,
                                Bits (CountUp, Toast, GlassButton…), Frame, Icon, Rise
    onboarding/
      controls/                 Ruler, Pace (gráfico + slider), Bars + DayPicker, Dial, SwipeCards, Wheel
      steps/                    StepsA (O00–O09), StepsB (O10–O17)
      OnbHeader · OnbScreen · nav · progress
    logic/derive.ts             port de derive() / plan()
    store/                      onboarding, nutrition, workouts, coach (Zustand)
    data/                       mocks de alimentos e treinos
    theme/                      tokens, tipografia, motion (curvas, durações, Reduce Motion)
    nav/transitions.tsx         interpolators de push / modal / sheet / fade
```

---

## O que está mockado

- **Sem backend nem login.** "Continue with Apple/Google" e "Use email instead" só concluem o onboarding.
  Apple Health e lembretes só gravam a escolha.
- **Câmera:** o scan usa a foto `meal-bowl.jpg` como visor. O disparador simula a captura. A análise leva cerca
  de 2,9 s e sempre retorna o "Teriyaki chicken bowl" (628 kcal, P46 C62 G22).
- **Busca de alimentos:** resultados fixos para "avoc". Os filtros All / My foods / Brands funcionam sobre
  essa lista.
- **Treinos:** catálogo fixo. A contagem "N workouts" segue a regra do protótipo (9 com todos os grupos
  ativos, +3 por grupo removido). A sessão reproduz o fluxo do protótipo: exercício 3 de 8 (0:42) → descanso
  de 15 s → conclusão.
- **Coach:** respostas roteirizadas a partir do design, chegando depois de cerca de 2,2 s em estado "pensando".
  - Jantar: o card do salmão; "Log" registra a refeição no jantar.
  - Sexta mais curta: card de troca; "Swap it" mostra "Friday updated".
  - "Add a stretch": simula a falha offline do C5, com "Tap to retry".
  - "How am I doing this week?" e "Help me sleep better": respostas próprias, com quick replies
    ("Show my progress" / "Plan next week" e "Add it to tonight" / "Maybe later").
  - Qualquer outra mensagem: "I can help with meals, workouts and your plan…", sugerindo as perguntas
    roteirizadas. Todas as respostas passam pelo estado "pensando".
  - Os valores citados (kcal restantes, proteína faltando) vêm do store de nutrição.
- **Sem tela no design = "Coming soon".** Todo toque sem destino mostra o toast de vidro do topo com
  "Coming soon", que some em 2 s, em vez de não fazer nada:
  - "Quick add calories", "Saved meals", a pílula "Dinner";
  - sino, calendário, linhas de refeição do N1 e ingredientes do N5;
  - virar câmera, som da sessão, "Share";
  - histórico e microfone do coach.

## Onde o design divergia e o que segui

O protótipo HTML é a fonte da verdade para comportamento e o `SCREENS.md` para a copy. Quando o README do
pacote divergia deles, segui o protótipo e o `SCREENS.md`:

- **W1:** campo "Search workouts" e botão de filtros no header, sem a fileira de chips.
- **Aura:** o protótipo usa a aura violeta também em Treinos. A aura "sky" só aparece no design system.
- **Card de refeição do coach:** "Glazed salmon, sweet potato & broccoli · 560 kcal · 40 g protein", como no
  `SCREENS.md`.
- **Medidas do markup:** cards de dieta 260×360, botão "Continue with Google" cinza `#F2F2F7`, barras de
  atividade abaixo da seleção em `#DCD3FD`, traço do dial com 26 pt.

## Limitações conhecidas

- Testado no web (Chrome, desktop) contra o protótipo, tela por tela. **Não testei em aparelho iOS/Android
  físico.** A tipagem e as APIs são as do SDK 58, mas vale um teste no Expo Go antes de demonstrar no celular.
- **Copy que não vem do `SCREENS.md`** foi definida depois, no briefing de ajustes:
  - "Leg circles" e "Cool-down stretch" no W4 (agora com os 8 exercícios);
  - as três respostas novas do coach e os quick replies delas;
  - "Coming soon".
