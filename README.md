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

- **Mini-Game Hub:** The "Practice" tab is now a game hub, allowing the user to choose how they want to train.
- **Global Training Mode:** The games operate on a set of **all words from all decks**, providing a consolidated review experience.
- **Complete Practice Loop (Flashcard Mode):**
  - Selecting the "Classic Review" game starts a practice session.
  - The game screen (`FlashcardView`) allows the user to review cards and assess their performance (Correct/Incorrect).
  - The Session Results screen displays a performance summary, highlighting incorrect words for future review.

---

## 🗺️ Development Roadmap

With the practice architecture now in place, the focus is on enriching the learning experience and completing the core functionalities.

### 🎯 Current Priorities

1.  **Expand the Practice Hub**

    - [ ] **Implement "Quick Quiz" Mini-Game**: Build the multiple-choice interface where the user selects the correct meaning from 4 options.
    - [ ] **Progress Bar:** Add a visual indicator on the game screen to show the current session's progress (e.g., 5/20 words).
    - [ ] **(Optional) Refine Practice UI/UX:** Add animations for flipping the flashcard or for providing answer feedback (correct/incorrect).

2.  **Connect Statistics to Practice**

    - [ ] **Update the Database:** Modify the `recordAnswer` action in `usePracticeStore` to not only manage the session state but also call a function to update the word's metadata in the database (`timesTrained`, `timesCorrect`, `lastTrained`, etc.).
    - [ ] **Implement the Statistics Screen (`StatsScreen`):** Create SQL queries to fetch aggregate data and develop the UI to display stats like a global success rate, most frequently missed words, etc.

3.  **Improve the Word Selection Algorithm**
    - [ ] **Implement Spaced Repetition (SRS) - Level 1:** Modify the word selection logic in the `PracticeHubScreen`. Instead of fetching all words, prioritize those that haven't been trained for the longest time (`lastTrained`) or have a lower success rate.

### 🔮 Future Features (Next Levels)

#### Level 1: Core Improvements

- [ ] **Alternative Training Modes:** Add a "Writing Game" (type the word based on its meaning).
- [ ] **Internationalization (i18n):** Abstract all UI text into translation files.

#### Level 2: AI Magic

- [ ] **Definition and Example Sentence Generator:** Use an LLM API to assist in creating flashcards.
- [ ] **Word "Discoverer":** Extract vocabulary from a photo or pasted text.

#### Level 3: Polish and Growth

- [ ] **Authentication and Cloud Sync.**
- [ ] **Push Notifications for Practice Reminders.**
- [ ] **Dark Mode.**

---

## 🛠️ Main Tech Stack

- **Framework:** React Native (Expo)
- **Language:** TypeScript
- **State Management:** Zustand
- **Database:** Expo-SQLite (with `next` API)
- **Navigation:** React Navigation (v6)
- **UI:** React Native's built-in components and icon libraries.
