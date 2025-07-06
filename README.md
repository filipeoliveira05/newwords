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

With a robust foundation for practice and statistics, the focus now shifts to making the app more interactive, rewarding, and intelligent.

### 🎯 Current Priorities

#### Level 1: Core Experience & Polish (High-Impact)

- [x] 🔊 **Audio (Text-to-Speech):** Allow users to hear the pronunciation of words, adding a crucial audio component to learning.
- [ ] 📊 **Visible Gamification Stats:** Display key stats like total words, day streak, and a new XP/Level metric in a prominent place (e.g., the main screen's header) to constantly motivate the user.
- [ ] 🌙 **Dark Mode:** Implement a full dark theme for the application.
- [x] 🗂️ **Category on Creation:** Allow users to select a word's grammatical category directly from the creation/edit modal.
- [ ] 🎨 **UI/UX Enhancements:**
  - [ ] Improve the design of the "Combine Lists" game mode to be more intuitive and visually appealing, similar to Duolingo's interface.
  - [ ] Refine screen transitions to use a consistent slide-right for forward navigation and slide-left for backward navigation.
- [ ] 🧠 **Refined Mastery System:** Improve the logic for `masteryLevel`. For example, a word might only be considered "mastered" after being answered correctly 5 times in a row.

#### Level 2: The Habit Hook (Getting the User to Come Back)

- [ ] 🔔 **Smart Push Notifications:** Implement smart reminders to help users maintain their streak (“🔥 Your 3-day streak is waiting for you!”) or review challenging words.
- [ ] 📖 **"All Words" Library:** Create a dedicated screen where users can view and search all words in the database, regardless of deck, and tap to see their details.
- [ ] 🎲 **New Game Modes:**
  - [ ] **Time Sprint:** A fast-paced mode: "How many words can you answer in 60 seconds?"
  - [ ] **Complete the Phrase:** A sentence appears with a blank space in which the user must insert a word with the appropriate meaning.
  - [ ] **Combine Lists Variant:** A version of the existing mode with a countdown timer and score multipliers for combos.
- [ ] 🏆 **Shareable Milestones:** When a user unlocks an important achievement or reaches a new level, generate a beautiful, shareable image for social media to encourage sharing and organic growth.
- [ ] ⬅️ ➡️ **Tinder-Style Review:** Implement a fast and fluid swipe-right/swipe-left interface for flashcard review, making practice sessions more engaging.

#### Level 3: Content Depth & Community

- [ ] 📈 **XP & Leveling System:** Implement a comprehensive XP and leveling system to reward users for all learning activities (adding words, practicing, completing goals).
- [ ] 🥇 **Leaderboards & Leagues:** Introduce weekly leagues based on XP earned, fostering friendly competition and long-term retention.

#### Level 4: 🤖 AI Magic

- [ ] **Automatic Flashcard Creation:** Use an LLM API to assist in creating flashcards (`WordOverview` and `WordDetailsScreen`). The user writes the word, and an LLM API suggests the definition, identifies if it's an adjective, noun, verb, etc., generates 3 sentences with increasing difficulties showing how to use the word, generates synonyms and antonyms.
- [ ] **Synonyms Finder:** In `WordDetailsScreen`, a button that makes the AI to find and display synonyms of that word, adding them to the word database if the user wants.
- [ ] **Smart Scanner (OCR + NLP):** The user takes a photo of a text and the AI (using OCR to read the text and NLP to understand it) identifies and highlights the less common or more complex words. The user simply taps on the words they want to learn, and the app automatically creates flashcards.
- [ ] **Conversational Tutor:** Option to open a chat with an AI tutor that plays out like this:
  - _AI Tutor:_ “Hello! Today's word is ‘resilience.’ Can you use this word in a sentence about sports?”
  - _User:_ “The athlete showed great resilience by finishing the race.”
  - _AI Tutor:_ “Perfect! Your sentence is grammatically correct and the context is ideal. Now, how about one about a personal challenge?”
- [] **Contextual Story Generator:** The user selects 3 to 5 words and the AI creates a micro-story or paragraph that uses those words in a cohesive and memorable way.

#### Level 5: Polish and Growth

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
