# NewWords 📚

Welcome to NewWords, a mobile application built with React Native and Expo, designed to help users expand their vocabulary in an effective and fun way. The application allows users to create word sets (flashcards), practice with different mini-games, and track their learning progress.

## ✨ Overview

The main goal of this application is to be more than just a simple notepad; it aims to be a **personal learning tutor**. Through a robust architecture and plans for a Spaced Repetition System (SRS) and AI integrations, the application aims to optimize the process of memorizing new vocabulary.

---

## 🚀 Implemented Features

The application has a solid and scalable foundation, with the following features being 100% operational:

### 1. Full Deck Management

- **Full CRUD:** Create, view, edit, and delete decks.
- **Word Count:** The interface displays a real-time count of the number of words in each deck, keeping data synchronized across screens.

### 2. Full Word (Flashcard) Management

- **Full CRUD:** Add, view, edit, and delete words within a specific deck.
- **Smart Search:** A search field allows for quick filtering of words by name or meaning.
- **Polished Modal Interface:** A clean and reusable modal UI for adding and editing words, with saving indicators for enhanced UX feedback.

### 3. Advanced Architecture and Navigation

- **Centralized & Reactive State (Zustand):** All application data logic is managed by central stores (`deckStore`, `wordStore`, `practiceStore`).
- **Robust Database (Expo-SQLite):** Utilizes a local SQLite database with a fully asynchronous data access layer.
- **Typed & Nested Navigation (React Navigation):** The app uses a `BottomTabNavigator` with nested `StackNavigator`s, allowing for independent and type-safe navigation flows for each section (Decks, Practice, Stats). All navigation types are defined, ensuring code safety.
- **Optimized Components:** Rendering optimization techniques (e.g., `React.memo`, atomic state selectors) have been implemented to ensure a fluid UI without infinite loops.

### 4. Practice Hub Foundation

- **Multiple Game Modes:** The "Practice" tab is a hub where users can choose between "Classic Review" (Flashcards) and "Quick Quiz" (Multiple-Choice).
- **Intelligent Word Selection (SRS Level 1):** The practice algorithm is no longer random. It prioritizes words that have never been trained, have a higher error rate, or haven't been reviewed in a longer time.
- **Complete Practice Loop:**
  - Games are structured in rounds (e.g., 10 words).
  - A progress bar shows the user's position in the current round.
  - The results screen summarizes performance and allows the user to start a new round or exit.
- **Engaging UI/UX:**
  - **Animations:** The flashcard features a dynamic 3D flip animation.
  - **Gamification:** A "streak" counter tracks consecutive correct answers, and perfect rounds are celebrated with a confetti animation.
  - **Sensory Feedback:** Haptic feedback (vibrations) is provided for correct and incorrect answers, enhancing the interactive experience.
- **Persistent Stats Tracking:** Every answer in a practice session updates the word's statistics (`timesTrained`, `timesCorrect`, `lastTrained`, etc.) in the local database, laying the groundwork for advanced analytics.

### 5. Comprehensive Statistics and Gamification

- **Statistics Dashboard:** A dedicated screen (`StatsScreen`) provides users with key performance indicators, including global success rate, total words mastered, longest correct answer streak, and consecutive days of practice.
- **Activity Heatmap:** A visual calendar highlights practice days, with color intensity representing the volume of words trained, allowing users to see their consistency at a glance.
- **Dynamic Daily Goals:** To encourage daily engagement, the app presents three new, randomly selected goals each day (e.g., "Train 10 words," "Complete 1 session"). A countdown timer creates a sense of urgency.
- **Rich Achievement System:** A comprehensive list of unlockable achievements (badges) rewards users for reaching milestones related to practice, consistency, and vocabulary size. Unlocked achievements are persisted in the database and trigger a notification toast.
- **Actionable Insights:** The "Challenging Words" section automatically identifies the top 3 words with the lowest success rates. A dedicated button allows the user to instantly start a focused practice session with these words, creating a powerful and immediate improvement loop.

---

## 🗺️ Development Roadmap

Com uma base sólida para a prática e estatísticas, o foco agora muda para tornar a aplicação mais interativa, recompensadora e inteligente. A visão está organizada em níveis, começando com o polimento da experiência principal e evoluindo para funcionalidades sociais e de IA.

### 🎯 Current Priorities

#### Nível 1: Experiência Principal e Polimento

- [ ] 🎨 **UI/UX e Gamificação:**
  - [ ] **Modo Escuro:** Implementar um tema escuro completo para a aplicação.
  - [ ] **Revisão Tinder-Style:** Implementar uma interface de deslizar para a direita/esquerda em alguma parte da aplicação.
  - [ ] **Flow de Prática Aprimorado:** Melhorar a experiência de prática com um flow adequado com ecrãs condicionais no final (subida de nível, metas diárias concluídas, alterações na liga semanal).
  - [ ] **Feedback:** Expandir o uso de feedback háptico por toda a app.
  - [ ] **Resumo Semanal Enriquecido:** Adicionar "fun facts" (ex: "treinaste o equivalente a 2 episódios de uma série") ao `WeeklyRecapScreen`.
  - [ ] **LevelUp View:** Melhorar o design e UI do `LevelUpView`.
- [ ] 🗂️ **Funcionalidades do Ecrã Inicial:**
  - [ ] **Widget "Palavra do Dia":** Destacar uma palavra por dia, talvez uma com a qual o utilizador tem dificuldades, com exemplos e significado.
  - [ ] **Metas Semanais:** Adicionar um novo conjunto de metas com um ciclo semanal para incentivar a consistência a longo prazo.
  - [ ] **Widget da Liga Robusto:** Garantir que o widget mostra sempre os últimos dados em cache quando offline e adicionar uma animação de transição quando a liga semanal é reiniciada.
  - [ ] **Widget da Liga Animado:** Adicionar uma animação de transição quando a liga semanal é reiniciada.
- [ ] ⚙️ **Melhorias de Funcionalidades Existentes:**
  - [ ] **Gestão de Conjuntos Flexível:** Adicionar interações de "long press" para ações sofisticadas (combinar conjuntos).
  - [ ] **Gestão de Palavras Avançada:** Permitir mover palavras entre conjuntos.
  - [ ] **Gestão de Palavras Flexível:** Adicionar interações de "long press" para ações rápidas (editar, apagar, mover para outros conjuntos).
  - [ ] **Gestão de Palavras Animada:** Adicionar uma animação de "fade in" às palavras quando o ecrã `AllWordsScreen` e `DeckDetailScreen` carrega pela primeira vez.
- [ ] 🐞 **Bugs e Melhorias Técnicas:**
  - [ ] **Correções na Tab Bar:** Resolver o bug do botão central que fica visível e o corte no ícone de prática.
- [ ] ⚡ **Performance:**
  - [ ] **Listas:** Substituir `FlatList` por `FlashList` nos ecrãs com listas longas (ex: `DeckDetailScreen`).

#### Nível 2: O Hábito (Engajamento e Retenção)

- [ ] 🗺️ **Descoberta Guiada (Primeiros Passos):** Criar um sistema de missões simples para guiar os novos utilizadores pelas funcionalidades chave da aplicação.
- [ ] 🏆 **Sistema de Conquistas Aprofundado:**
  - [ ] **Galeria de Conquistas:** Criar um ecrã dedicado para o utilizador ver todas as conquistas disponíveis e desbloqueadas.
- [ ] 🎯 **Metas Diárias Diversificadas:** Criar categorias e adicionar mais tipos de metas diárias para evitar a repetição.
- [ ] 🚶 **Jornada de Níveis Visual:** Criar um ecrã que mostre a progressão de níveis do utilizador de forma visual e interativa, destacando os marcos alcançados.
- [ ] 🔔 **Notificações Push Inteligentes:** Implementar lembretes para manter a streak, rever palavras difíceis, etc.
- [ ] 🎲 **New Game Modes:**
  - [ ] **Sprint Contra o Tempo:** Um modo rápido: "Quantas palavras consegue acertar em 60 segundos?".
  - [ ] **Completa a Frase:** Uma frase aparece com um espaço em branco, e o utilizador deve escolher a palavra correta para o preencher.
  - [ ] **Prática com "Apostas" (Stakes):** O utilizador "aposta" parte do seu XP na sua performance. Se tiver uma sessão perfeita, duplica o XP; se falhar, perde-o.
- [ ] 🏆 **Marcos Partilháveis:** Quando um utilizador atinge um marco importante (ex: nível 20), gerar uma imagem bonita e partilhável para as redes sociais.
- [ ] 🎉 **Eventos Semanais Temáticos:** Lançar um tema semanal (ex: "Semana do Espaço"). As palavras praticadas que pertençam a esse tema valem o dobro do XP.
- [ ] 🏟️ **Transição de Liga Clara:** Adicionar um ecrã ou componente que mostre claramente a transição entre o final de uma liga e o início da nova.

#### Nível 3: Comunidade e Conteúdo Social

- [ ] 🏪 **Marketplace da Comunidade:**
- [ ] **Partilha de Conjuntos e Palavras:** Permitir que os utilizadores publiquem os seus próprios conjuntos e palavras para que outros possam adicionar à sua biblioteca.
- [ ] **Rankings e Votação:** Os utilizadores podem votar (upvote) nos melhores conjuntos, com abas para "Mais Populares", "Tendências" e "Recentes".
- [ ] ⚔️ **Duelos de Vocabulário (1v1):** Um modo de jogo onde um utilizador pode desafiar um amigo. Ambos respondem às mesmas 10 perguntas num sprint contra o tempo.
- [ ] 💬 **Interação nos Conjuntos:** Permitir que os utilizadores deixem comentários, dicas ou frases de exemplo nos conjuntos partilhados pela comunidade.
- [ ] 👤 **Perfis de Utilizador Personalizáveis:** Permitir que os utilizadores personalizem o seu perfil com a sua palavra favorita, a palavra mais treinada, etc.

#### Nível 4: 🤖 Magia com IA (O Tutor Inteligente)

- [ ] **Criação Automática de Flashcards:** O utilizador insere uma palavra, e uma IA gera automaticamente o significado, categoria gramatical, sinónimos, antónimos e 3 frases de exemplo com dificuldade crescente.
- [ ] **Scanner Inteligente (OCR + NLP):** O utilizador tira uma foto a um texto, e a IA identifica e destaca as palavras mais complexas. O utilizador toca nas palavras que quer aprender, e a app cria os flashcards automaticamente.
- [ ] **Tutor Conversacional:** Um chat com uma IA que testa o conhecimento do utilizador de forma interativa. Ex: "A palavra de hoje é 'resiliência'. Consegues usá-la numa frase sobre desporto?".
- [ ] **Gerador de Histórias Contextuais:** O utilizador seleciona 3 a 5 palavras, e a IA cria um micro-conto que usa essas palavras de forma coesa e memorável.
- [ ] **Constelações de Palavras:** Uma vista gráfica e interativa onde as palavras são "estrelas" ligadas por relações (sinónimos, antónimos, etc.), ajudando a visualizar as conexões do vocabulário.

#### Nível 5: Escalabilidade e Crescimento

- [ ] ☁️ **Authentication and Cloud Sync.**

---

## 🛠️ Main Tech Stack

- **Framework:** React Native (Expo)
- **Language:** TypeScript
- **State Management:** Zustand
- **Database:** Expo-SQLite (with `next` API)
- **Navigation:** React Navigation (v6)
- **UI:** React Native's built-in components and icon libraries.

---

## 🧭 Launch Checklist

This section documents the **launch strategy** and system setup.

### 🪄 Pre-Launch System Setup

#### ✅ 1. Waitlist Page

- **Goal:** Validate interest and build a pre-launch audience.
- **Status:** _Planned_
- **Tools:** `Framer` for landing page, `FormSpark` for email collection.

#### ✅ 2. App Analytics

- **Goal:** Track usage, understand churn, guide decisions.
- **To Do:**
  - [ ] Integrate analytics (e.g., `PostHog` or similar).
  - [ ] Track key events like onboarding, training sessions, and retention patterns.

#### ✅ 3. Feedback Board

- **Goal:** Collect and prioritize user feature requests.
- **To Do:**
  - [ ] Set up a board (e.g., `Canny` or `User Jot`).
  - [ ] Embed or link it in-app for easy access.
  - [ ] Use feedback to shape roadmap priorities.

#### ✅ 4. Email Sequence System

- **Goal:** Improve retention via onboarding and feature education.
- **To Do:**
  - [ ] Implement `Loops` (or alternative) for sequences like:
    - Welcome email.
    - Inactivity reminders (e.g., no practice in 7 days).
    - Feature highlights (e.g., mini-games, stats).
  - [ ] Sync with waitlist and live user base.

#### ✅ 5. Google/App Store Listing

- **Goal:** Maximize visibility via Google/App Store search.
- **To Do:**
  - [ ] Design high-quality screenshots (spend 3–4 days).
  - [ ] Write optimized title, description, and tags.
  - [ ] Prepare metadata before Google/App Store submission.

#### ✅ 6. Landing Page

- **Goal:** Showcase the app and drive installs.
- **To Do:**
  - [ ] Build with `Framer` (reuse assets from screenshots).
  - [ ] Include clear CTAs, feature highlights, and testimonials (if available).

---

### 🧪 Launch Timing Strategy

- Use **beta testing** to measure user engagement and stickiness.
- Launch when:
  - [ ] Users show sustained activity over a few days.
  - [ ] Analytics indicate solid early retention.
  - [ ] Confidence level is high (even if not perfect).

---

### 📣 Launch Actions

Depending on time and resources:

- **Soft Launch (current plan):**

  - YouTube demo (optional).
  - Announcements on Twitter, LinkedIn.
  - Email the waitlist.

- **Optional Big Launch:**
  - 4-week lead-up with teaser posts.
  - Product Hunt launch.
  - Reddit & online communities.
  - Collab posts from friends/influencers.

--
