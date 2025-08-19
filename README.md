# NewWords 📚

Welcome to NewWords, a mobile application built with React Native and Expo, designed to help users expand their vocabulary in an effective and fun way. The application allows users to create word sets (flashcards), practice with different mini-games, and track their learning progress.

## ✨ Overview

The main goal of this application is to be more than just a simple notepad; it aims to be a **personal learning tutor**. Through a robust architecture and plans for a Spaced Repetition System (SRS) and AI integrations, the application aims to optimize the process of memorizing new vocabulary.

---

## 🚀 Implemented Features

The application has a robust and feature-rich foundation, with the following systems fully implemented:

### 1. Core Architecture & Data Management

- **Local-First Database:** Utilizes **Expo-SQLite** for a fast and reliable local database, ensuring the app is fully functional offline. The data layer is built with a fully asynchronous API.
- **Reactive State Management:** Employs **Zustand** for a clean, centralized, and reactive state management system. Data is organized into logical stores (`deckStore`, `wordStore`, `userStore`, etc.), preventing re-renders and ensuring a smooth UI.
- **Cloud Sync with Supabase:** A complete synchronization service is implemented to back up and sync user data (decks, words, progress, stats, achievements) with a **Supabase** backend. Sync is triggered automatically on app launch and when returning from the background.
- **Typed & Nested Navigation:** A sophisticated navigation structure using **React Navigation**, featuring a `BottomTabNavigator` with nested `StackNavigator`s. This provides independent navigation flows for each section and is fully type-safe.

### 2. Vocabulary & Deck Management

- **Full Deck & Word CRUD:** Users can create, view, edit, and delete decks and the words within them. The UI updates reactively to all changes.
- **Advanced Word Details:** Beyond name and meaning, users can add a grammatical **category**, **synonyms**, **antonyms**, and multiple **example sentences** to each word.
- **Multi-Select & Batch Actions:** In the decks list, a long-press activates a selection mode, allowing users to select multiple decks and perform batch actions, such as deleting them all at once.
- **Advanced Sorting & Filtering:** Both the decks list and the words list feature robust sorting options (e.g., by creation date, alphabetically, by mastery) and a debounced search for instant filtering.

### 3. Intelligent Practice System (SRS)

- **Spaced Repetition System (SM-2):** The core of the practice system is a full implementation of the **SM-2 algorithm**. Every answer updates a word's `easinessFactor`, `interval`, and `repetitions`, automatically scheduling the next review for optimal memory retention.
- **Multiple Game Modes:** To keep learning engaging, four distinct practice modes are available:
  - **Classic Flashcards:** A traditional review mode.
  - **Multiple-Choice:** Select the correct meaning from four options.
  - **Writing Practice:** Given the meaning, the user must type the word.
  - **Combine Lists:** Match words with their corresponding meanings from two shuffled lists.
- **Targeted Practice Sessions:** Users can initiate specific practice sessions, such as:
  - **Urgent Review:** Automatically selects words that are due for review based on the SRS schedule.
  - **Challenging Words:** A session focused on words with the lowest success rates.
  - **Favorite Words:** A session to review words the user has marked as favorites.
- **Complete Practice Loop:** The practice flow is seamless, from selecting a mode to a loading screen, the game itself, and a detailed results screen summarizing performance.

### 4. Deep Gamification & Engagement

- **XP & Leveling System:** Users earn XP for every correct answer, leveling up when they reach certain thresholds. A visual **Level Journey** screen shows their entire progression path.
- **Weekly Leagues:** A fully functional league system groups users into tiers (Bronze, Silver, Gold, etc.). Users compete based on weekly XP earned, with promotions and demotions at the end of each week.
- **Dynamic Daily Goals:** To encourage daily engagement, the app presents three new, randomly selected goals each day (e.g., "Train 10 words," "Complete 1 session"). A countdown timer creates a sense of urgency.
- **Rich Achievement System:** A comprehensive list of unlockable achievements (badges) rewards users for reaching milestones related to practice, consistency, and vocabulary size.
- **Weekly Recap:** Every Monday, users are presented with a "story-style" animated summary of their previous week, highlighting key metrics, comparisons, and achievements.
- **Streaks & Stats:** The app tracks the user's **consecutive day streak** and their **longest correct answer streak** within a session.

### 5. Polished User Experience

- **Custom Animated Components:** The app is filled with polished, custom-built components, including an animated tab bar, a 3D flipping flashcard, animated progress bars, and a custom alert and notification system.
- **Sensory Feedback:** A centralized service provides haptic feedback and game sounds for key interactions, which can be toggled in the settings.
- **Dynamic Home Screen:** The home screen is personalized with a dynamic welcome message and features a `DynamicActionCard` that intelligently suggests the most relevant practice session (e.g., Urgent Review, Challenging Words).
- **Full User Lifecycle:** The app includes a complete authentication flow (Login, Sign Up, Forgot Password) with email/password and Google OAuth, a multi-step onboarding tutorial, and a profile section for account management.

---

## 🗺️ Development Roadmap

Com uma base sólida para a prática e estatísticas, o foco agora é preparar a aplicação para um lançamento de sucesso. A roadmap foi reorganizada com base na pergunta: **"O que é mais importante fazer hoje se a aplicação fosse lançada amanhã?"**.

A estratégia é clara: primeiro, garantir uma **experiência de utilizador impecável e polida**; depois, expandir com funcionalidades de **engajamento e retenção**; e, por fim, construir as grandes funcionalidades de **comunidade e IA**.

---

### 🎯 Nível 1: Essencial para o Lançamento (Prioridade Máxima)

_Estas são as tarefas críticas para garantir que a primeira impressão do utilizador seja fantástica e que a aplicação seja estável, rápida e intuitiva._

- [ ] 🐞 **Correção de Bugs Críticos:**
- [ ] ✨ **Polimento Visual e Experiência do Utilizador (UI/UX):**
  - [ ] **Feedback Sensorial:** Expandir o uso de feedback háptico e sonoro para mais interações (ex: abrir um modal, completar uma meta) para tornar a app mais viva.
  - [ ] **Design do LevelUpView:** Redesenhar o ecrã de subida de nível para ser mais impactante e recompensador.
  - [ ] **Transição de Liga Clara:** Criar um ecrã ou modal que mostre claramente a transição entre o final de uma liga e o início da nova, celebrando promoções.
- [ ] 🚀 **Performance:**
  - [ ] **Listas Otimizadas:** Substituir `FlatList` por `FlashList` nos ecrãs com listas potencialmente longas (`DeckDetailScreen`, `AllWordsScreen`, `AchievementsScreen`) para garantir uma performance fluida.
- [ ] 🚶 **Experiência do Novo Utilizador:**
  - [ ] **Onboarding Interativo com Missões:** Criar um sistema de missões iniciais (ex: um checklist no ecrã principal) para guiar os novos utilizadores pelas funcionalidades chave (criar um conjunto, adicionar uma palavra, fazer uma prática).

---

### 📈 Nível 2: Engajamento e Retenção (Pós-Lançamento Imediato)

_Assim que a base estiver polida, o foco passa para funcionalidades que fazem os utilizadores voltar todos os dias._

- [ ] 🗂️ **Funcionalidades do Ecrã Inicial:**

  - [ ] **Widget "Palavra do Dia":** Destacar uma palavra por dia para incentivar a descoberta.
  - [ ] **Metas Semanais:** Adicionar um novo conjunto de metas com um ciclo semanal para incentivar a consistência a longo prazo.
  - [ ] **Widget da Liga Robusto:** Garantir que o widget mostra sempre os últimos dados em cache quando offline e adicionar uma animação de transição quando a liga semanal é reiniciada.

- [ ] 🔔 **Notificações Push Inteligentes:**

  - [ ] Implementar lembretes para manter a streak, rever palavras difíceis e avisar sobre o final da liga.

- [ ] 🏆 **Gamificação Aprofundada:**

  - [ ] **Jornada de Níveis Visual:** Melhorar o ecrã que da progressão de níveis do utilizador de forma a torná-lo mais apelativo e cativante.
  - [ ] **Resumo Semanal Melhorado:** Melhorar o design e UI do Weekly Recap. Adicionar "fun facts" (ex: "treinaste o equivalente a 2 episódios de uma série") ao `WeeklyRecapScreen`.
  - [ ] **Marcos Partilháveis:** Quando um utilizador atinge um marco importante (ex: nível 20), gerar uma imagem bonita e partilhável.

- [ ] ⚙️ **Melhorias de Qualidade de Vida (QoL):**
  - [ ] **Gestão de Conjuntos Flexível:** Adicionar interações de "long press" para ações rápidas (editar, apagar) e, futuramente, combinar conjuntos.
  - [ ] **Gestão de Palavras Avançada:** Permitir mover palavras entre conjuntos.
  - [ ] **Visualização de Progresso por Palavra:** No ecrã de detalhes da palavra, adicionar um pequeno gráfico que mostre o histórico de acertos/erros ao longo do tempo.

---

### 🎮 Nível 3: Expansão de Conteúdo e Interação

_Com uma base de utilizadores engajada, expandimos as formas de aprender e interagir._

- [ ] 🎲 **Novos Modos de Jogo:**

  - [ ] **Sprint Contra o Tempo:** "Quantas palavras consegue acertar em 60 segundos?".
  - [ ] **Completa a Frase:** Apresentar uma frase com um espaço em branco para o utilizador preencher.
  - [ ] **Prática com "Apostas" (Stakes):** O utilizador "aposta" XP na sua performance para ganhar mais ou perder.

- [ ] 🎉 **Eventos Semanais Temáticos:**

  - [ ] **Eventos Temáticos:** Lançar um tema semanal (ex: "Semana do Espaço"). As palavras praticadas que pertençam a esse tema valem o dobro do XP.
  - [ ] **Desafios Comunitários:** Metas colaborativas onde todos os utilizadores contribuem (ex: "Dominar 10.000 palavras de 'Ciência' em conjunto esta semana"), com uma leaderboard de utilizadores que mais contribuiram.

- [ ] 💬 **Acessibilidade:**

  - [ ] Adicionar `accessibilityLabel` e `accessibilityHint` aos principais componentes interativos para melhorar a experiência para todos os utilizadores.

- [ ] 🛠️ **Ferramentas Avançadas:**
  - [ ] **Importar/Exportar Conjuntos (CSV):** Permitir que os utilizadores façam backup dos seus conjuntos ou importem listas de palavras de outras fontes.

---

### 🌐 Nível 4: Comunidade e IA (O Futuro)

_Transformar a NewWords numa plataforma de aprendizagem colaborativa e inteligente._

- [ ] 🏪 **Marketplace da Comunidade:**

  - [ ] Permitir que os utilizadores publiquem os seus próprios conjuntos para que outros possam adicionar à sua biblioteca.
  - [ ] Implementar um sistema de votação (upvote) e categorias para os conjuntos partilhados.

- [ ] ⚔️ **Duelos de Vocabulário (1v1):**

  - [ ] Modo de jogo onde um utilizador pode desafiar um amigo em tempo real.

- [ ] 🤖 **Magia com IA (O Tutor Inteligente):**
  - [ ] **Criação Automática de Flashcards:** IA gera significados, sinónimos, antónimos e frases de exemplo.
  - [ ] **Scanner Inteligente (OCR + NLP):** Extrair palavras de textos e imagens.
  - [ ] **Tutor Conversacional com IA:** Um chat que desafia o utilizador a usar as palavras que está a aprender em frases, oferecendo correções e sugestões.

---

### 🤔 Talvez implementarei no futuro

_Funcionalidades interessantes mas não prioritárias para o lançamento ou para as fases imediatas pós-lançamento._

- [ ] **Modo Escuro:** Implementar um tema escuro completo. É uma das funcionalidades mais pedidas em qualquer app moderna.
- [ ] **Animações de Entrada:** Adicionar animações de "fade in" às listas de palavras (`AllWordsScreen`, `DeckDetailScreen`) e aos slides do Onboarding para uma entrada mais suave.

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
