import { supabase } from "./supabaseClient";
import * as localDB from "./storage";
import { useAuthStore } from "@/stores/useAuthStore";
import NetInfo from "@react-native-community/netinfo";
import { Deck, Word } from "@/types/database";

// --- Tipos de Dados do Supabase (snake_case) ---

type SupabaseDeck = {
  id: string; // UUID
  user_id: string;
  title: string;
  author: string;
  created_at: string;
};

type SupabaseWord = Omit<
  Word,
  | "deckId"
  | "createdAt"
  | "lastTrained"
  | "lastAnswerCorrect"
  | "masteryLevel"
  | "nextReviewDate"
  | "isFavorite"
  | "masteredAt"
  | "easinessFactor"
> & {
  deck_id: string; // UUID
  user_id: string;
  created_at: string;
  last_trained: string | null;
  last_answer_correct: boolean | null;
  mastery_level: string;
  next_review_date: string;
  is_favorite: boolean;
  mastered_at: string | null;
  easiness_factor: number;
};

type SupabaseProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  xp: number;
  level: number;
  current_league: string;
  weekly_xp: number;
  updated_at: string;
};

type SupabaseLevelUpHistory = {
  id: number;
  user_id: string;
  level: number;
  unlocked_at: string;
};

type SupabaseUnlockedAchievement = {
  id: number;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
};

// --- Lógica Principal de Sincronização ---

/**
 * Ponto de entrada principal para a sincronização.
 * Decide se deve fazer upload de dados locais ou download de dados da nuvem.
 */
export const performInitialSync = async (): Promise<void> => {
  const { session, setIsSyncing } = useAuthStore.getState();
  if (!session?.user) {
    console.error("Sync Error: No user session found for sync.");
    return;
  }
  const userId = session.user.id;

  setIsSyncing(true);
  try {
    // 1. Verificar se existem dados na nuvem
    const { count: cloudDecksCount, error: countError } = await supabase
      .from("decks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (countError) {
      console.error("Sync Error: Could not check for cloud data.", countError);
      return;
    }

    // 2. Verificar se existem dados locais
    const localDecks = await localDB.getDecks();
    const localDataExists = localDecks.length > 0;

    if (
      localDataExists &&
      (cloudDecksCount === 0 || cloudDecksCount === null)
    ) {
      // Cenário 1: Primeiro login com dados locais -> UPLOAD
      console.log("Sync: Local data found, cloud is empty. Uploading...");
      await uploadAllLocalData(userId, localDecks);
    } else if (cloudDecksCount && cloudDecksCount > 0) {
      // Cenário 2: Dados na nuvem existem -> DOWNLOAD
      console.log("Sync: Cloud data found. Downloading...");
      await downloadAllCloudData(userId);
    } else {
      // Cenário 3: Ambos estão vazios, não é preciso fazer nada.
      console.log("Sync: No data to sync initially.");
    }
  } catch (error) {
    console.error("Erro crítico durante a sincronização inicial:", error);
  } finally {
    setIsSyncing(false);
  }
};

/**
 * Faz o upload de todos os dados do SQLite local para o Supabase.
 * Usado quando um utilizador se regista pela primeira vez mas já tinha usado a app offline.
 */
async function uploadAllLocalData(userId: string, localDecks: Deck[]) {
  try {
    // 1. Inserir Decks. Com UUIDs, os IDs são os mesmos localmente e na nuvem.
    const decksToInsert = localDecks.map((deck) => ({
      id: deck.id,
      user_id: userId,
      title: deck.title,
      author: deck.author,
      created_at: deck.createdAt,
    }));

    const { error: deckError } = await supabase
      .from("decks")
      .insert(decksToInsert);

    if (deckError) throw deckError;

    // 2. Preparar e inserir todas as palavras. O deckId já é o UUID correto.
    let allWordsToInsert = [];
    for (const localDeck of localDecks) {
      const localWords = await localDB.getWordsOfDeck(localDeck.id);

      if (localWords.length > 0) {
        const wordsForSupabase = localWords.map((word) => ({
          ...word,
          id: word.id,
          deck_id: word.deckId, // O deckId já é o UUID correto
          user_id: userId,
          is_favorite: !!word.isFavorite,
          last_answer_correct:
            word.lastAnswerCorrect === null ? null : !!word.lastAnswerCorrect,
          synonyms: word.synonyms ? JSON.parse(word.synonyms) : [],
          antonyms: word.antonyms ? JSON.parse(word.antonyms) : [],
          sentences: word.sentences ? JSON.parse(word.sentences) : [],
        }));
        allWordsToInsert.push(...(wordsForSupabase as any));
      }
    }

    if (allWordsToInsert.length > 0) {
      const { error: wordError } = await supabase
        .from("words")
        .insert(allWordsToInsert as any);
      if (wordError) throw wordError;
    }

    // 3. Upload dos dados de Gamificação (Perfil, Níveis, Conquistas)
    // O perfil já foi criado pelo trigger, então aqui fazemos um UPDATE com os dados locais.
    const localGamification = await localDB.getGamificationStats();
    const localUserDetails = await localDB.getLocalUserDetails();
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        first_name: localUserDetails.firstName,
        last_name: localUserDetails.lastName,
        xp: localGamification.xp,
        level: localGamification.level,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (profileError)
      console.error("Sync Error: Failed to upload profile data.", profileError);

    const localLevelHistory = await localDB.getLocalLevelUpHistory();
    if (localLevelHistory.length > 0) {
      const levelHistoryToInsert = localLevelHistory.map((h) => ({
        user_id: userId,
        level: h.level,
        unlocked_at: h.unlocked_at,
      }));
      await supabase.from("level_up_history").insert(levelHistoryToInsert);
    }

    const localAchievements = await localDB.getLocalUnlockedAchievements();
    if (localAchievements.length > 0) {
      const achievementsToInsert = localAchievements.map((a) => ({
        user_id: userId,
        achievement_id: a.achievement_id,
        unlocked_at: a.unlocked_at,
      }));
      await supabase.from("unlocked_achievements").insert(achievementsToInsert);
    }

    console.log("Sync: Upload completed successfully.");
  } catch (error) {
    console.error("Sync Error: Failed to upload local data.", error);
  }
}

/**
 * Faz o download de todos os dados do Supabase e substitui a base de dados local.
 * Usado quando um utilizador faz login num novo dispositivo.
 */
async function downloadAllCloudData(userId: string) {
  try {
    // 1. Apagar a base de dados local para garantir um estado limpo
    await localDB.deleteDatabase();
    await localDB.initializeDB();

    // 2. Fazer o download de todos os dados da nuvem
    const [
      profileResult,
      decksResult,
      wordsResult,
      levelHistoryResult,
      achievementsResult,
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("decks").select("*").eq("user_id", userId),
      supabase.from("words").select("*").eq("user_id", userId),
      supabase.from("level_up_history").select("*").eq("user_id", userId),
      supabase.from("unlocked_achievements").select("*").eq("user_id", userId),
    ]);

    const cloudProfile = profileResult.data as SupabaseProfile | null;
    const cloudDecks = decksResult.data;
    const cloudWords = wordsResult.data;
    const cloudLevelHistory = levelHistoryResult.data;
    const cloudAchievements = achievementsResult.data;

    // 3. Inserir os dados na base de dados local
    if (cloudProfile) {
      // O perfil é guardado na tabela de metadados local
      await localDB.setMetaValue("first_name", cloudProfile.first_name || "");
      await localDB.setMetaValue("last_name", cloudProfile.last_name || "");
      await localDB.setMetaValue("user_xp", (cloudProfile.xp || 0).toString());
      await localDB.setMetaValue(
        "user_level",
        (cloudProfile.level || 1).toString()
      );
      await localDB.setMetaValue(
        "current_league",
        cloudProfile.current_league || "Bronze"
      );
    }

    if (cloudDecks && cloudDecks.length > 0) {
      const localDecks = (cloudDecks as SupabaseDeck[]).map((d) => ({
        id: d.id,
        title: d.title,
        author: d.author,
        createdAt: d.created_at,
      }));
      await localDB.bulkInsertDecks(localDecks);
    }

    if (cloudWords && cloudWords.length > 0) {
      const localWords = (cloudWords as SupabaseWord[]).map((w) => ({
        ...w,
        deckId: w.deck_id,
        createdAt: w.created_at,
        lastTrained: w.last_trained,
        lastAnswerCorrect:
          w.last_answer_correct === null ? null : w.last_answer_correct ? 1 : 0,
        masteryLevel: w.mastery_level as Word["masteryLevel"],
        nextReviewDate: w.next_review_date,
        isFavorite: w.is_favorite ? 1 : 0,
        masteredAt: w.mastered_at,
        easinessFactor: w.easiness_factor,
        synonyms: JSON.stringify(w.synonyms || []),
        antonyms: JSON.stringify(w.antonyms || []),
        sentences: JSON.stringify(w.sentences || []),
      }));
      await localDB.bulkInsertWords(localWords);
    }

    if (cloudLevelHistory && cloudLevelHistory.length > 0) {
      const localLevelHistory = (
        cloudLevelHistory as SupabaseLevelUpHistory[]
      ).map((h) => ({
        level: h.level,
        unlocked_at: h.unlocked_at,
      }));
      await localDB.bulkInsertLevelUpHistory(localLevelHistory);
    }

    if (cloudAchievements && cloudAchievements.length > 0) {
      const localAchievements = (
        cloudAchievements as SupabaseUnlockedAchievement[]
      ).map((a) => ({
        achievement_id: a.achievement_id,
        unlocked_at: a.unlocked_at,
      }));
      await localDB.bulkInsertUnlockedAchievements(localAchievements);
    }

    console.log("Sync: Download completed successfully.");
  } catch (error) {
    console.error("Sync Error: Failed to download cloud data.", error);
  }
}

// --- Lógica de Sincronização Contínua com Fila Offline ---

let isSyncing = false;

/**
 * Processa a fila de operações pendentes, enviando-as para o Supabase.
 * Executa apenas se houver ligação à internet e não estiver já a sincronizar.
 */
export const processSyncQueue = async (): Promise<void> => {
  const networkState = await NetInfo.fetch();
  if (!networkState.isConnected || !networkState.isInternetReachable) {
    console.log("Sync Queue: Sem ligação à internet. A saltar.");
    return;
  }

  if (isSyncing) {
    console.log("Sync Queue: Sincronização já em progresso. A saltar.");
    return;
  }

  isSyncing = true;
  console.log(
    "Sync Queue: A iniciar o processamento de operações pendentes..."
  );

  try {
    const pendingOperations = await localDB.getPendingOperations();
    if (pendingOperations.length === 0) {
      console.log("Sync Queue: Nenhuma operação pendente.");
      isSyncing = false;
      return;
    }

    const { session } = useAuthStore.getState();
    if (!session?.user) {
      console.error(
        "Sync Queue: Sem sessão de utilizador, impossível processar a fila."
      );
      isSyncing = false;
      return;
    }
    const userId = session.user.id;

    const processedIds: number[] = [];

    for (const op of pendingOperations) {
      try {
        const payload = JSON.parse(op.payload);
        let error = null;

        switch (op.operation_type) {
          case "CREATE_DECK":
            ({ error } = await supabase
              .from("decks")
              .insert({ ...payload, user_id: userId }));
            break;
          case "UPDATE_DECK":
            ({ error } = await supabase
              .from("decks")
              .update(payload.updates)
              .eq("id", payload.id));
            break;
          case "DELETE_DECK":
            ({ error } = await supabase
              .from("decks")
              .delete()
              .eq("id", payload.id));
            break;
          case "CREATE_WORD":
            ({ error } = await supabase
              .from("words")
              .insert({ ...payload, user_id: userId }));
            break;
          case "UPDATE_WORD":
          case "UPDATE_WORD_DETAILS":
          case "UPDATE_WORD_STATS":
            ({ error } = await supabase
              .from("words")
              .update(payload.updates)
              .eq("id", payload.id));
            break;
          case "TOGGLE_WORD_FAVORITE":
            ({ error } = await supabase
              .from("words")
              .update({ is_favorite: payload.is_favorite })
              .eq("id", payload.id));
            break;
          case "DELETE_WORD":
            ({ error } = await supabase
              .from("words")
              .delete()
              .eq("id", payload.id));
            break;
        }

        if (error) {
          console.error(
            `Sync Queue: Falha ao processar operação ${op.id} (${op.operation_type}). Erro:`,
            error.message
          );
          // Aqui poderia implementar lógica de tentativas ou uma "dead-letter queue"
        } else {
          processedIds.push(op.id);
        }
      } catch (e) {
        console.error(
          `Sync Queue: Erro ao fazer parse do payload para a operação ${op.id}.`,
          e
        );
      }
    }

    if (processedIds.length > 0) {
      await localDB.deleteProcessedOperations(processedIds);
      console.log(
        `Sync Queue: ${processedIds.length} operações processadas e apagadas com sucesso.`
      );
    }
  } catch (error) {
    console.error(
      "Sync Queue: Ocorreu um erro crítico durante o processamento.",
      error
    );
  } finally {
    isSyncing = false;
  }
};
