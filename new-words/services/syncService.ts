import { supabase } from "./supabaseClient";
import * as localDB from "./storage";
import {
  getLastSyncTimestamp,
  setLastSyncTimestamp,
} from "@/services/syncState";
import { Word } from "@/types/database";
import { eventStore } from "@/stores/eventStore";
import NetInfo from "@react-native-community/netinfo";

// --- Tipos de Dados do Supabase (snake_case) ---

type SupabaseDeck = {
  id: string; // UUID
  user_id: string;
  title: string;
  author: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
};

type SupabaseWord = {
  id: string;
  deck_id: string;
  user_id: string;
  name: string;
  meaning: string;
  times_trained: number;
  times_correct: number;
  times_incorrect: number;
  created_at: string;
  last_trained: string | null;
  last_answer_correct: boolean | null;
  mastery_level: string;
  next_review_date: string;
  category: string | null;
  synonyms: any; // JSONB
  antonyms: any; // JSONB
  sentences: any; // JSONB
  is_favorite: boolean;
  mastered_at: string | null;
  easiness_factor: number;
  interval: number;
  repetitions: number;
  updated_at: string;
  is_deleted: boolean;
};

type SupabaseProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  xp: number;
  level: number;
  current_league: string;
  weekly_xp: number;
  last_practice_date: string | null;
  consecutive_days: number;
  longest_streak: number;
  profile_picture_path: string | null;
  profile_picture_url: string | null;
  haptics_enabled: boolean;
  game_sounds_enabled: boolean;
  last_practiced_deck_id: string | null;
  updated_at: string;
  is_deleted: boolean;
};

type SupabaseUnlockedAchievement = {
  id: number;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  updated_at: string;
  is_deleted: boolean;
};

type SupabasePracticeHistory = {
  id: number;
  user_id: string;
  date: string; // YYYY-MM-DD
  words_trained: number;
  updated_at: string;
};

type SupabasePracticeLog = {
  id: string; // UUID
  user_id: string;
  word_id: string;
  practice_date: string; // TIMESTAMPTZ
  was_correct: boolean;
  updated_at: string;
  is_deleted: boolean;
};

type SupabaseLevelUpHistory = {
  id: number;
  user_id: string;
  level: number;
  unlocked_at: string;
  updated_at: string;
  is_deleted: boolean;
};

type SupabaseDailyActiveGoals = {
  id: number;
  user_id: string;
  date: string; // YYYY-MM-DD
  goal_ids: any; // JSONB
  updated_at: string;
  is_deleted: boolean;
};

// --- Lógica Principal de Sincronização ---

async function pushLocalChanges(userId: string, lastSync: string) {
  console.log("Sync (Push): Getting local changes since", lastSync);
  const changes = await localDB.getLocalChanges(lastSync);

  // --- Decks ---
  const decksToUpsert = changes.decks
    .filter((d) => !d.is_deleted)
    .map((d) => ({
      id: d.id,
      user_id: userId,
      title: d.title,
      author: d.author,
      created_at: d.createdAt,
      updated_at: d.updated_at,
      is_deleted: !!d.is_deleted,
    }));
  const deckIdsToDelete = changes.decks
    .filter((d) => d.is_deleted)
    .map((d) => d.id);

  if (decksToUpsert.length > 0) {
    console.log(`Sync (Push): Upserting ${decksToUpsert.length} decks.`);
    const { error } = await supabase.from("decks").upsert(decksToUpsert);
    if (error) console.error("Sync (Push): Failed to upsert decks.", { error });
  }
  if (deckIdsToDelete.length > 0) {
    console.log(`Sync (Push): Deleting ${deckIdsToDelete.length} decks.`);
    const { error } = await supabase
      .from("decks")
      .delete()
      .in("id", deckIdsToDelete);
    if (error) console.error("Sync (Push): Failed to delete decks.", { error });
  }

  const otherPromises = [];

  // --- Words ---
  const wordsToUpsert = changes.words
    .filter((w) => !w.is_deleted)
    .map((w) => ({
      id: w.id,
      deck_id: w.deckId,
      user_id: userId,
      name: w.name,
      meaning: w.meaning,
      times_trained: w.timesTrained,
      times_correct: w.timesCorrect,
      times_incorrect: w.timesIncorrect,
      last_trained: w.lastTrained,
      last_answer_correct:
        w.lastAnswerCorrect === null ? null : !!w.lastAnswerCorrect,
      mastery_level: w.masteryLevel,
      next_review_date: w.nextReviewDate,
      created_at: w.createdAt,
      category: w.category,
      synonyms: w.synonyms ? JSON.parse(w.synonyms) : null,
      antonyms: w.antonyms ? JSON.parse(w.antonyms) : null,
      sentences: w.sentences ? JSON.parse(w.sentences) : null,
      is_favorite: !!w.isFavorite,
      mastered_at: w.masteredAt,
      easiness_factor: w.easinessFactor,
      interval: w.interval,
      repetitions: w.repetitions,
      updated_at: w.updated_at,
      is_deleted: !!w.is_deleted,
    }));
  const wordIdsToDelete = changes.words
    .filter((w) => w.is_deleted)
    .map((w) => w.id);

  if (wordsToUpsert.length > 0) {
    console.log(`Sync (Push): Upserting ${wordsToUpsert.length} words.`);
    const { error } = await supabase.from("words").upsert(wordsToUpsert);
    if (error) console.error("Sync (Push): Failed to upsert words.", { error });
  }
  if (wordIdsToDelete.length > 0) {
    console.log(`Sync (Push): Deleting ${wordIdsToDelete.length} words.`);
    const { error } = await supabase
      .from("words")
      .delete()
      .in("id", wordIdsToDelete);
    if (error) console.error("Sync (Push): Failed to delete words.", { error });
  }

  // --- Outras tabelas (podem ser executadas em paralelo) ---

  const achievementsToUpsert = changes.unlocked_achievements
    .filter((a) => !a.is_deleted)
    .map((a) => ({
      user_id: userId,
      achievement_id: a.achievement_id,
      unlocked_at: a.unlocked_at,
      updated_at: a.updated_at,
      is_deleted: !!a.is_deleted,
    }));
  const achievementIdsToDelete = changes.unlocked_achievements
    .filter((a) => a.is_deleted)
    .map((a) => a.achievement_id);

  if (achievementsToUpsert.length > 0) {
    console.log(
      `Sync (Push): Upserting ${achievementsToUpsert.length} achievements.`
    );
    otherPromises.push(
      supabase
        .from("unlocked_achievements")
        .upsert(achievementsToUpsert, { onConflict: "user_id,achievement_id" })
    );
  }
  if (achievementIdsToDelete.length > 0) {
    console.log(
      `Sync (Push): Deleting ${achievementIdsToDelete.length} achievements.`
    );
    otherPromises.push(
      supabase
        .from("unlocked_achievements")
        .delete()
        .in("achievement_id", achievementIdsToDelete)
        .eq("user_id", userId)
    );
  }

  // --- Practice History ---
  // This table is upsert-only, no deletes.
  if (changes.practice_history.length > 0) {
    const historyToUpsert = changes.practice_history.map((h) => ({
      user_id: userId,
      date: h.date,
      words_trained: h.words_trained,
      updated_at: h.updated_at,
    }));
    console.log(
      `Sync (Push): Upserting ${historyToUpsert.length} practice history records.`
    );
    otherPromises.push(
      supabase
        .from("practice_history")
        .upsert(historyToUpsert, { onConflict: "user_id,date" })
    );
  }

  // --- Practice Log ---
  const logsToUpsert = changes.practice_log
    .filter((l) => !l.is_deleted)
    .map((l) => ({
      id: l.id,
      user_id: userId,
      word_id: l.word_id,
      practice_date: l.practice_date,
      was_correct: !!l.was_correct,
      updated_at: l.updated_at,
      is_deleted: !!l.is_deleted,
    }));
  const logIdsToDelete = changes.practice_log
    .filter((l) => l.is_deleted)
    .map((l) => l.id);

  if (logsToUpsert.length > 0) {
    console.log(`Sync (Push): Upserting ${logsToUpsert.length} practice logs.`);
    otherPromises.push(supabase.from("practice_log").upsert(logsToUpsert));
  }
  if (logIdsToDelete.length > 0) {
    console.log(
      `Sync (Push): Deleting ${logIdsToDelete.length} practice logs.`
    );
    otherPromises.push(
      supabase.from("practice_log").delete().in("id", logIdsToDelete)
    );
  }

  // --- Level Up History ---
  const levelUpsToUpsert = changes.level_up_history
    .filter((l) => !l.is_deleted)
    .map((l) => ({
      user_id: userId,
      level: l.level,
      unlocked_at: l.unlocked_at,
      updated_at: l.updated_at,
      is_deleted: !!l.is_deleted,
    }));
  const levelUpsToDelete = changes.level_up_history
    .filter((l) => l.is_deleted)
    .map((l) => l.level);

  if (levelUpsToUpsert.length > 0) {
    console.log(
      `Sync (Push): Upserting ${levelUpsToUpsert.length} level up records.`
    );
    otherPromises.push(
      supabase
        .from("level_up_history")
        .upsert(levelUpsToUpsert, { onConflict: "user_id,level" })
    );
  }
  if (levelUpsToDelete.length > 0) {
    console.log(
      `Sync (Push): Deleting ${levelUpsToDelete.length} level up records.`
    );
    otherPromises.push(
      supabase
        .from("level_up_history")
        .delete()
        .in("level", levelUpsToDelete)
        .eq("user_id", userId)
    );
  }

  // --- Daily Active Goals ---
  const goalsToUpsert = changes.daily_active_goals
    .filter((g) => !g.is_deleted)
    .map((g) => ({
      user_id: userId,
      date: g.date,
      goal_ids: JSON.parse(g.goal_ids),
      updated_at: g.updated_at,
      is_deleted: !!g.is_deleted,
    }));
  const goalsToDelete = changes.daily_active_goals
    .filter((g) => g.is_deleted)
    .map((g) => g.date);

  if (goalsToUpsert.length > 0) {
    console.log(`Sync (Push): Upserting ${goalsToUpsert.length} daily goals.`);
    otherPromises.push(
      supabase
        .from("daily_active_goals")
        .upsert(goalsToUpsert, { onConflict: "user_id,date" })
    );
  }
  if (goalsToDelete.length > 0) {
    console.log(`Sync (Push): Deleting ${goalsToDelete.length} daily goals.`);
    otherPromises.push(
      supabase
        .from("daily_active_goals")
        .delete()
        .in("date", goalsToDelete)
        .eq("user_id", userId)
    );
  }

  const results = await Promise.allSettled(otherPromises);
  results.forEach((result) => {
    if (result.status === "rejected") {
      console.error(
        "Sync (Push): A non-critical push operation failed:",
        result.reason
      );
    }
  });

  // --- User Metadata (Profile) - TRATADO SEPARADAMENTE COMO OPERAÇÃO CRÍTICA ---
  if (changes.user_metadata.length > 0) {
    const profileUpdate: Partial<SupabaseProfile> = {};

    // Lista explícita de chaves que existem na tabela 'profiles' do Supabase.
    const allowedProfileKeys: (keyof SupabaseProfile)[] = [
      "first_name",
      "last_name",
      "xp",
      "level",
      "current_league",
      "weekly_xp",
      "last_practice_date",
      "consecutive_days",
      "longest_streak",
      "profile_picture_path",
      "profile_picture_url",
      "haptics_enabled",
      "game_sounds_enabled",
      "last_practiced_deck_id",
      "is_deleted",
    ];

    changes.user_metadata.forEach((item) => {
      const keyMap: { [key: string]: keyof SupabaseProfile } = {
        user_xp: "xp",
        user_level: "level",
      };
      const supabaseKey =
        keyMap[item.key] || (item.key as keyof SupabaseProfile);

      // Apenas processa a chave se ela for permitida.
      if (allowedProfileKeys.includes(supabaseKey)) {
        // Converte explicitamente para NÚMERO para colunas numéricas.
        if (
          [
            "xp",
            "level",
            "weekly_xp",
            "consecutive_days",
            "longest_streak",
          ].includes(supabaseKey)
        ) {
          (profileUpdate as any)[supabaseKey] = parseInt(item.value, 10) || 0;
          // Converte explicitamente para BOOLEANO para colunas booleanas.
        } else if (
          ["haptics_enabled", "game_sounds_enabled", "is_deleted"].includes(
            supabaseKey
          )
        ) {
          (profileUpdate as any)[supabaseKey] = item.value === "true";
        } else {
          // Mantém como string para as restantes colunas (first_name, etc.).
          (profileUpdate as any)[supabaseKey] = item.value || null;
        }
      }
    });

    if (Object.keys(profileUpdate).length > 0) {
      console.log(`Sync (Push): Updating profile with changes:`, profileUpdate);
      const { error } = await supabase
        .from("profiles")
        .update(profileUpdate)
        .eq("id", userId);
      if (error) {
        console.error(
          "Sync (Push): CRITICAL - Failed to update profile:",
          error
        );
        throw new Error(`Profile update failed: ${error.message}`);
      }
    }
  }
}

async function pullRemoteChanges(userId: string, lastSync: string) {
  console.log("Sync (Pull): Getting remote changes since", lastSync);

  const [
    decksRes,
    wordsRes,
    achievementsRes,
    profileRes,
    practiceHistoryRes,
    practiceLogRes,
    levelUpHistoryRes,
    dailyActiveGoalsRes,
  ] = await Promise.all([
    supabase
      .from("decks")
      .select("*")
      .eq("user_id", userId)
      .gt("updated_at", lastSync),
    supabase
      .from("words")
      .select("*")
      .eq("user_id", userId)
      .gt("updated_at", lastSync),
    supabase
      .from("unlocked_achievements")
      .select("*")
      .eq("user_id", userId)
      .gt("updated_at", lastSync),
    supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .gt("updated_at", lastSync)
      .single(),
    supabase
      .from("practice_history")
      .select("*")
      .eq("user_id", userId)
      .gt("updated_at", lastSync),
    supabase
      .from("practice_log")
      .select("*")
      .eq("user_id", userId)
      .gt("updated_at", lastSync),
    supabase
      .from("level_up_history")
      .select("*")
      .eq("user_id", userId)
      .gt("updated_at", lastSync),
    supabase
      .from("daily_active_goals")
      .select("*")
      .eq("user_id", userId)
      .gt("updated_at", lastSync),
  ]);

  // Envolve todas as operações de escrita na base de dados local numa única transação
  await localDB.withTransaction(async () => {
    // --- Decks ---
    if (decksRes.data && decksRes.data.length > 0) {
      console.log(
        `Sync (Pull): Received ${decksRes.data.length} updated decks.`
      );
      const decksToHardDelete = decksRes.data
        .filter((d: SupabaseDeck) => d.is_deleted)
        .map((d: SupabaseDeck) => d.id);
      const decksToUpsert = decksRes.data
        .filter((d: SupabaseDeck) => !d.is_deleted)
        .map((d: SupabaseDeck) => ({
          id: d.id,
          title: d.title,
          author: d.author,
          createdAt: d.created_at,
          updated_at: d.updated_at,
          is_deleted: d.is_deleted ? 1 : 0,
        }));
      if (decksToUpsert.length > 0)
        await localDB.bulkInsertDecks(decksToUpsert);
      if (decksToHardDelete.length > 0) {
        for (const id of decksToHardDelete) {
          await localDB.hardDeleteDeck(id);
        }
      }
    }

    // --- Words ---
    if (wordsRes.data && wordsRes.data.length > 0) {
      console.log(
        `Sync (Pull): Received ${wordsRes.data.length} updated words.`
      );
      const wordsToHardDelete = wordsRes.data
        .filter((w: SupabaseWord) => w.is_deleted)
        .map((w: SupabaseWord) => w.id);
      const wordsToUpsert = wordsRes.data
        .filter((w: SupabaseWord) => !w.is_deleted)
        .map((w: SupabaseWord) => ({
          id: w.id,
          deckId: w.deck_id,
          name: w.name,
          meaning: w.meaning,
          timesTrained: w.times_trained,
          timesCorrect: w.times_correct,
          timesIncorrect: w.times_incorrect,
          lastTrained: w.last_trained,
          lastAnswerCorrect:
            w.last_answer_correct === null
              ? null
              : w.last_answer_correct
              ? 1
              : 0,
          masteryLevel: w.mastery_level as Word["masteryLevel"],
          nextReviewDate: w.next_review_date,
          createdAt: w.created_at,
          category: w.category,
          synonyms: JSON.stringify(w.synonyms || null),
          antonyms: JSON.stringify(w.antonyms || null),
          sentences: JSON.stringify(w.sentences || null),
          isFavorite: w.is_favorite ? 1 : 0,
          masteredAt: w.mastered_at,
          easinessFactor: w.easiness_factor,
          interval: w.interval,
          repetitions: w.repetitions,
          updated_at: w.updated_at,
          is_deleted: w.is_deleted ? 1 : 0,
        }));
      if (wordsToUpsert.length > 0)
        await localDB.bulkInsertWords(wordsToUpsert);
      if (wordsToHardDelete.length > 0) {
        for (const id of wordsToHardDelete) {
          await localDB.hardDeleteWord(id);
        }
      }
    }

    // --- Achievements ---
    if (achievementsRes.data && achievementsRes.data.length > 0) {
      console.log(
        `Sync (Pull): Received ${achievementsRes.data.length} updated achievements.`
      );
      const achievementsToHardDelete = (
        achievementsRes.data as SupabaseUnlockedAchievement[]
      )
        .filter((a: SupabaseUnlockedAchievement) => a.is_deleted)
        .map((a: SupabaseUnlockedAchievement) => a.achievement_id);
      const achievementsToUpsert = (
        achievementsRes.data as SupabaseUnlockedAchievement[]
      )
        .filter((a: SupabaseUnlockedAchievement) => !a.is_deleted)
        .map((a: SupabaseUnlockedAchievement) => ({
          achievement_id: a.achievement_id,
          unlocked_at: a.unlocked_at,
          updated_at: a.updated_at,
          is_deleted: a.is_deleted ? 1 : 0,
        }));
      if (achievementsToUpsert.length > 0)
        await localDB.bulkInsertUnlockedAchievements(achievementsToUpsert);
      if (achievementsToHardDelete.length > 0) {
        for (const id of achievementsToHardDelete) {
          await localDB.hardDeleteUnlockedAchievement(id);
        }
      }
    }

    // --- Profile ---
    if (profileRes.data) {
      console.log(`Sync (Pull): Received updated profile.`);
      const profile = profileRes.data as SupabaseProfile;
      const metadataToUpdate = [];
      const keyMap: { [key in keyof SupabaseProfile]?: string } = {
        xp: "user_xp",
        level: "user_level",
      };

      for (const key in profile) {
        const localKey = keyMap[key as keyof SupabaseProfile] || key;
        const value = (profile as any)[key];
        if (value !== null && value !== undefined) {
          metadataToUpdate.push({ key: localKey, value: String(value) });
        }
      }
      if (metadataToUpdate.length > 0) {
        await localDB.bulkSetMetaValues(metadataToUpdate);
      }
    }

    // --- Practice History ---
    if (practiceHistoryRes.data && practiceHistoryRes.data.length > 0) {
      console.log(
        `Sync (Pull): Received ${practiceHistoryRes.data.length} updated practice history records.`
      );
      // No deletes for this table
      const historyToUpsert = (
        practiceHistoryRes.data as SupabasePracticeHistory[]
      ).map((h: SupabasePracticeHistory) => ({
        date: h.date,
        words_trained: h.words_trained,
        updated_at: h.updated_at,
      }));
      if (historyToUpsert.length > 0)
        await localDB.bulkInsertPracticeHistory(historyToUpsert);
    }

    // --- Practice Log ---
    if (practiceLogRes.data && practiceLogRes.data.length > 0) {
      console.log(
        `Sync (Pull): Received ${practiceLogRes.data.length} updated practice logs.`
      );
      const logsToHardDelete = (practiceLogRes.data as SupabasePracticeLog[])
        .filter((l) => l.is_deleted)
        .map((l) => l.id);
      const logsToUpsert = (practiceLogRes.data as SupabasePracticeLog[]).map(
        (l: SupabasePracticeLog) => ({
          id: l.id,
          word_id: l.word_id,
          practice_date: l.practice_date,
          was_correct: l.was_correct ? 1 : 0,
          updated_at: l.updated_at,
          is_deleted: l.is_deleted ? 1 : 0,
        })
      );
      if (logsToUpsert.length > 0)
        await localDB.bulkInsertPracticeLog(logsToUpsert);
      if (logsToHardDelete.length > 0) {
        for (const id of logsToHardDelete) {
          await localDB.hardDeletePracticeLog(id);
        }
      }
    }

    // --- Level Up History ---
    if (levelUpHistoryRes.data && levelUpHistoryRes.data.length > 0) {
      console.log(
        `Sync (Pull): Received ${levelUpHistoryRes.data.length} updated level up records.`
      );
      const levelUpsToHardDelete = (
        levelUpHistoryRes.data as SupabaseLevelUpHistory[]
      )
        .filter((l) => l.is_deleted)
        .map((l) => l.level);
      const levelUpsToUpsert = (
        levelUpHistoryRes.data as SupabaseLevelUpHistory[]
      ).map((l: SupabaseLevelUpHistory) => ({
        level: l.level,
        unlocked_at: l.unlocked_at,
        updated_at: l.updated_at,
        is_deleted: l.is_deleted ? 1 : 0,
      }));
      if (levelUpsToUpsert.length > 0)
        await localDB.bulkInsertLevelUpHistory(levelUpsToUpsert);
      if (levelUpsToHardDelete.length > 0) {
        for (const level of levelUpsToHardDelete) {
          await localDB.hardDeleteLevelUpHistory(level);
        }
      }
    }

    // --- Daily Active Goals ---
    if (dailyActiveGoalsRes.data && dailyActiveGoalsRes.data.length > 0) {
      console.log(
        `Sync (Pull): Received ${dailyActiveGoalsRes.data.length} updated daily goals.`
      );
      const goalsToHardDelete = (
        dailyActiveGoalsRes.data as SupabaseDailyActiveGoals[]
      )
        .filter((g) => g.is_deleted)
        .map((g) => g.date);
      const goalsToUpsert = (
        dailyActiveGoalsRes.data as SupabaseDailyActiveGoals[]
      ).map((g: SupabaseDailyActiveGoals) => ({
        date: g.date,
        goal_ids: JSON.stringify(g.goal_ids),
        updated_at: g.updated_at,
        is_deleted: g.is_deleted ? 1 : 0,
      }));
      if (goalsToUpsert.length > 0)
        await localDB.bulkInsertDailyActiveGoals(goalsToUpsert);
      if (goalsToHardDelete.length > 0) {
        for (const date of goalsToHardDelete) {
          await localDB.hardDeleteDailyActiveGoals(date);
        }
      }
    }
  });
}

let isSyncing = false;

export async function synchronize(userId: string): Promise<boolean> {
  const networkState = await NetInfo.fetch();
  if (!networkState.isConnected || !networkState.isInternetReachable) {
    console.log("Sync: No internet connection. Skipping.");
    return false;
  }

  if (!userId) {
    console.error("Sync Error: No user ID provided for sync.");
    return false;
  }

  if (isSyncing) {
    console.log("Sync: Already in progress. Skipping.");
    return false;
  }

  isSyncing = true;
  console.log("Sync: Starting delta synchronization...");

  try {
    // Fase 1: Obter Timestamps
    const lastSyncTimestamp = await getLastSyncTimestamp();
    const newSyncTimestamp = new Date().toISOString();
    const isFirstSync = !lastSyncTimestamp;

    if (isFirstSync) {
      console.log("Sync: First sync detected. Pulling all remote data.");
      // Numa primeira sincronização, a nuvem é a fonte da verdade.
      // Apenas puxamos os dados para popular a base de dados local.
      // NÃO fazemos push, para evitar sobrescrever dados da nuvem com os valores padrão locais.
      await pullRemoteChanges(userId, new Date(0).toISOString());
    } else {
      // Para sincronizações normais, a ordem é Push e depois Pull.
      // Fase 2: Push (enviar alterações locais para a nuvem)
      await pushLocalChanges(userId, lastSyncTimestamp);

      // Fase 3: Pull (puxar alterações da nuvem para o local)
      await pullRemoteChanges(userId, lastSyncTimestamp);
    }

    // Fase 4: Conclusão
    await setLastSyncTimestamp(newSyncTimestamp);
    console.log("Sync: Synchronization completed successfully.");
    eventStore.getState().publish("syncCompleted", {});
    return true;
  } catch (error) {
    console.error(
      "Sync: A critical error occurred during synchronization.",
      error
    );
    return false;
  } finally {
    isSyncing = false;
  }
}
