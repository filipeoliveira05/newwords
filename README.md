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

---

## 🗺️ Development Roadmap

With a robust and engaging practice system now in place, the focus shifts to providing users with meaningful insights into their learning journey.

### 🎯 Current Priorities

1.  **Implement the Statistics Screen (`StatsScreen`)**
    - **Goal:** Allow users to visualize their learning progress.
    - **Tasks:**
      - [ ] **Create SQL Queries:** Develop functions in `services/storage.ts` to fetch aggregate data (e.g., global success rate, most frequently missed words, practice activity over time).
      - [ ] **Build the UI:** Design and implement the `StatsScreen` to display this data using charts and lists, providing actionable insights for the user.

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
