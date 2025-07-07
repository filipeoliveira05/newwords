import { useDeckStore } from "@/stores/deckStore";
import { useWordStore } from "@/stores/wordStore";

const seedData = [
  {
    title: "Verbos Irregulares (Inglês)",
    author: "Seed Data",
    words: [
      { name: "go", meaning: "ir", category: "Verbo" },
      { name: "see", meaning: "ver", category: "Verbo" },
      { name: "eat", meaning: "comer", category: "Verbo" },
      { name: "take", meaning: "pegar / levar", category: "Verbo" },
      { name: "give", meaning: "dar", category: "Verbo" },
      { name: "come", meaning: "vir", category: "Verbo" },
      { name: "drink", meaning: "beber", category: "Verbo" },
      { name: "write", meaning: "escrever", category: "Verbo" },
      { name: "read", meaning: "ler", category: "Verbo" },
      { name: "speak", meaning: "falar", category: "Verbo" },
      { name: "run", meaning: "correr", category: "Verbo" },
      { name: "drive", meaning: "conduzir", category: "Verbo" },
      { name: "buy", meaning: "comprar", category: "Verbo" },
      { name: "fly", meaning: "voar", category: "Verbo" },
      { name: "sing", meaning: "cantar", category: "Verbo" },
    ],
  },
  {
    title: "Capitais do Mundo",
    author: "Seed Data",
    words: [
      { name: "Portugal", meaning: "Lisboa", category: "Nome" },
      { name: "Espanha", meaning: "Madrid", category: "Nome" },
      { name: "França", meaning: "Paris", category: "Nome" },
      { name: "Itália", meaning: "Roma", category: "Nome" },
      { name: "Alemanha", meaning: "Berlim", category: "Nome" },
      { name: "Reino Unido", meaning: "Londres", category: "Nome" },
      { name: "Brasil", meaning: "Brasília", category: "Nome" },
      { name: "Japão", meaning: "Tóquio", category: "Nome" },
      { name: "Canadá", meaning: "Ottawa", category: "Nome" },
      { name: "Austrália", meaning: "Camberra", category: "Nome" },
      { name: "Rússia", meaning: "Moscovo", category: "Nome" },
      { name: "China", meaning: "Pequim", category: "Nome" },
      { name: "Argentina", meaning: "Buenos Aires", category: "Nome" },
      { name: "Egito", meaning: "Cairo", category: "Nome" },
      { name: "África do Sul", meaning: "Pretória", category: "Nome" },
    ],
  },
  {
    title: "Conceitos de Programação",
    author: "Seed Data",
    words: [
      {
        name: "API",
        meaning: "Application Programming Interface",
        category: "Nome",
      },
      { name: "SDK", meaning: "Software Development Kit", category: "Nome" },
      {
        name: "IDE",
        meaning: "Integrated Development Environment",
        category: "Nome",
      },
      { name: "OOP", meaning: "Object-Oriented Programming", category: "Nome" },
      {
        name: "REST",
        meaning: "Representational State Transfer",
        category: "Nome",
      },
      {
        name: "CRUD",
        meaning: "Create, Read, Update, Delete",
        category: "Nome",
      },
      { name: "CLI", meaning: "Command-Line Interface", category: "Nome" },
      {
        name: "Git",
        meaning: "Sistema de controlo de versões",
        category: "Nome",
      },
      {
        name: "React",
        meaning: "Biblioteca JavaScript para UIs",
        category: "Nome",
      },
      {
        name: "TypeScript",
        meaning: "Superset de JavaScript tipado",
        category: "Nome",
      },
    ],
  },
  {
    title: "Palavras Frequentes (Inglês - A1)",
    author: "Seed Data",
    words: [
      { name: "house", meaning: "casa", category: "Nome" },
      { name: "car", meaning: "carro", category: "Nome" },
      { name: "book", meaning: "livro", category: "Nome" },
      { name: "water", meaning: "água", category: "Nome" },
      { name: "food", meaning: "comida", category: "Nome" },
      { name: "dog", meaning: "cão", category: "Nome" },
      { name: "cat", meaning: "gato", category: "Nome" },
      { name: "school", meaning: "escola", category: "Nome" },
      { name: "sun", meaning: "sol", category: "Nome" },
      { name: "rain", meaning: "chuva", category: "Nome" },
      { name: "friend", meaning: "amigo", category: "Nome" },
      { name: "family", meaning: "família", category: "Nome" },
      { name: "phone", meaning: "telemóvel", category: "Nome" },
      { name: "music", meaning: "música", category: "Nome" },
      { name: "city", meaning: "cidade", category: "Nome" },
    ],
  },
  {
    title: "Cores em Inglês",
    author: "Seed Data",
    words: [
      { name: "red", meaning: "vermelho", category: "Adjetivo" },
      { name: "blue", meaning: "azul", category: "Adjetivo" },
      { name: "green", meaning: "verde", category: "Adjetivo" },
      { name: "yellow", meaning: "amarelo", category: "Adjetivo" },
      { name: "black", meaning: "preto", category: "Adjetivo" },
      { name: "white", meaning: "branco", category: "Adjetivo" },
      { name: "orange", meaning: "laranja", category: "Adjetivo" },
      { name: "purple", meaning: "roxo", category: "Adjetivo" },
      { name: "pink", meaning: "cor-de-rosa", category: "Adjetivo" },
      { name: "brown", meaning: "castanho", category: "Adjetivo" },
    ],
  },
  {
    title: "Animais em Inglês",
    author: "Seed Data",
    words: [
      { name: "lion", meaning: "leão", category: "Nome" },
      { name: "tiger", meaning: "tigre", category: "Nome" },
      { name: "elephant", meaning: "elefante", category: "Nome" },
      { name: "monkey", meaning: "macaco", category: "Nome" },
      { name: "bear", meaning: "urso", category: "Nome" },
      { name: "snake", meaning: "cobra", category: "Nome" },
      { name: "wolf", meaning: "lobo", category: "Nome" },
      { name: "fox", meaning: "raposa", category: "Nome" },
      { name: "giraffe", meaning: "girafa", category: "Nome" },
      { name: "zebra", meaning: "zebra", category: "Nome" },
    ],
  },
  {
    title: "Objetos do Dia-a-Dia",
    author: "Seed Data",
    words: [
      { name: "chair", meaning: "cadeira", category: "Nome" },
      { name: "table", meaning: "mesa", category: "Nome" },
      { name: "window", meaning: "janela", category: "Nome" },
      { name: "door", meaning: "porta", category: "Nome" },
      { name: "pen", meaning: "caneta", category: "Nome" },
      { name: "pencil", meaning: "lápis", category: "Nome" },
      { name: "notebook", meaning: "caderno", category: "Nome" },
      { name: "clock", meaning: "relógio", category: "Nome" },
      { name: "lamp", meaning: "candeeiro", category: "Nome" },
      { name: "backpack", meaning: "mochila", category: "Nome" },
    ],
  },
  {
    title: "Países e Continentes",
    author: "Seed Data",
    words: [
      { name: "Portugal", meaning: "Europa", category: "Nome" },
      { name: "Brasil", meaning: "América do Sul", category: "Nome" },
      { name: "Egito", meaning: "África", category: "Nome" },
      { name: "China", meaning: "Ásia", category: "Nome" },
      { name: "Austrália", meaning: "Oceania", category: "Nome" },
      { name: "Canadá", meaning: "América do Norte", category: "Nome" },
      { name: "Japão", meaning: "Ásia", category: "Nome" },
      { name: "Angola", meaning: "África", category: "Nome" },
      { name: "México", meaning: "América do Norte", category: "Nome" },
      { name: "Alemanha", meaning: "Europa", category: "Nome" },
    ],
  },
  {
    title: "Frutas em Inglês",
    author: "Seed Data",
    words: [
      { name: "apple", meaning: "maçã", category: "Nome" },
      { name: "banana", meaning: "banana", category: "Nome" },
      { name: "orange", meaning: "laranja", category: "Nome" },
      { name: "grape", meaning: "uva", category: "Nome" },
      { name: "pear", meaning: "pêra", category: "Nome" },
      { name: "watermelon", meaning: "melancia", category: "Nome" },
      { name: "strawberry", meaning: "morango", category: "Nome" },
      { name: "pineapple", meaning: "ananás", category: "Nome" },
      { name: "cherry", meaning: "cereja", category: "Nome" },
      { name: "peach", meaning: "pêssego", category: "Nome" },
    ],
  },
  {
    title: "Dias da Semana e Meses",
    author: "Seed Data",
    words: [
      { name: "Monday", meaning: "Segunda-feira", category: "Nome" },
      { name: "Tuesday", meaning: "Terça-feira", category: "Nome" },
      { name: "Wednesday", meaning: "Quarta-feira", category: "Nome" },
      { name: "Thursday", meaning: "Quinta-feira", category: "Nome" },
      { name: "Friday", meaning: "Sexta-feira", category: "Nome" },
      { name: "Saturday", meaning: "Sábado", category: "Nome" },
      { name: "Sunday", meaning: "Domingo", category: "Nome" },
      { name: "January", meaning: "Janeiro", category: "Nome" },
      { name: "February", meaning: "Fevereiro", category: "Nome" },
      { name: "March", meaning: "Março", category: "Nome" },
      { name: "April", meaning: "Abril", category: "Nome" },
      { name: "May", meaning: "Maio", category: "Nome" },
      { name: "June", meaning: "Junho", category: "Nome" },
      { name: "July", meaning: "Julho", category: "Nome" },
      { name: "August", meaning: "Agosto", category: "Nome" },
      { name: "September", meaning: "Setembro", category: "Nome" },
      { name: "October", meaning: "Outubro", category: "Nome" },
      { name: "November", meaning: "Novembro", category: "Nome" },
      { name: "December", meaning: "Dezembro", category: "Nome" },
    ],
  },
  {
    title: "Partes do Corpo (Inglês)",
    author: "Seed Data",
    words: [
      { name: "head", meaning: "cabeça", category: "Nome" },
      { name: "hand", meaning: "mão", category: "Nome" },
      { name: "foot", meaning: "pé", category: "Nome" },
      { name: "arm", meaning: "braço", category: "Nome" },
      { name: "leg", meaning: "perna", category: "Nome" },
      { name: "eye", meaning: "olho", category: "Nome" },
      { name: "ear", meaning: "orelha", category: "Nome" },
      { name: "nose", meaning: "nariz", category: "Nome" },
      { name: "mouth", meaning: "boca", category: "Nome" },
      { name: "shoulder", meaning: "ombro", category: "Nome" },
    ],
  },
  {
    title: "Profissões em Inglês",
    author: "Seed Data",
    words: [
      { name: "teacher", meaning: "professor", category: "Nome" },
      { name: "doctor", meaning: "médico", category: "Nome" },
      { name: "engineer", meaning: "engenheiro", category: "Nome" },
      { name: "lawyer", meaning: "advogado", category: "Nome" },
      { name: "nurse", meaning: "enfermeira", category: "Nome" },
      { name: "pilot", meaning: "piloto", category: "Nome" },
      { name: "chef", meaning: "cozinheiro", category: "Nome" },
      { name: "police officer", meaning: "polícia", category: "Nome" },
      { name: "firefighter", meaning: "bombeiro", category: "Nome" },
      { name: "farmer", meaning: "agricultor", category: "Nome" },
    ],
  },
  {
    title: "Palavras Avançadas (Inglês C1)",
    author: "Seed Data",
    words: [
      { name: "ubiquitous", meaning: "onipresente", category: "Adjetivo" },
      { name: "serendipity", meaning: "feliz acaso", category: "Nome" },
      { name: "ephemeral", meaning: "efémero", category: "Adjetivo" },
      { name: "eloquent", meaning: "eloquente", category: "Adjetivo" },
      { name: "resilient", meaning: "resiliente", category: "Adjetivo" },
      {
        name: "tenacious",
        meaning: "teimoso / persistente",
        category: "Adjetivo",
      },
      { name: "ambiguous", meaning: "ambíguo", category: "Adjetivo" },
      { name: "meticulous", meaning: "meticuloso", category: "Adjetivo" },
      { name: "benevolent", meaning: "benevolente", category: "Adjetivo" },
      { name: "candid", meaning: "franco / sincero", category: "Adjetivo" },
    ],
  },
];

export const seedDatabase = async (): Promise<void> => {
  const { addDeck, decks } = useDeckStore.getState();
  const { addWord } = useWordStore.getState();

  // Previne a adição de dados se já existirem decks
  if (decks.length > 0) {
    console.log("A base de dados já contém dados. Seeding cancelado.");
    return;
  }

  console.log("A iniciar o seeding da base de dados...");

  try {
    for (const deckData of seedData) {
      // Adiciona o deck e espera que a promise resolva para obter o ID
      await addDeck(deckData.title, deckData.author);
      // O novo deck é o primeiro da lista
      const newDeckId = useDeckStore.getState().decks[0].id;

      for (const wordData of deckData.words) {
        await addWord(
          newDeckId,
          wordData.name,
          wordData.meaning,
          wordData.category
        );
      }
    }
    console.log("Seeding da base de dados concluído com sucesso!");
  } catch (error) {
    console.error("Erro durante o seeding da base de dados:", error);
    throw error;
  }
};
