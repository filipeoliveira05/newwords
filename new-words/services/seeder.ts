import { useDeckStore } from "@/stores/deckStore";
import { useWordStore } from "@/stores/wordStore";

const seedData = [
  {
    title: "Verbos Irregulares (Inglês)",
    author: "Seed Data",
    words: [
      { name: "go", meaning: "ir" },
      { name: "see", meaning: "ver" },
      { name: "eat", meaning: "comer" },
      { name: "take", meaning: "pegar / levar" },
      { name: "give", meaning: "dar" },
      { name: "come", meaning: "vir" },
      { name: "drink", meaning: "beber" },
      { name: "write", meaning: "escrever" },
      { name: "read", meaning: "ler" },
      { name: "speak", meaning: "falar" },
      { name: "run", meaning: "correr" },
      { name: "drive", meaning: "conduzir" },
      { name: "buy", meaning: "comprar" },
      { name: "fly", meaning: "voar" },
      { name: "sing", meaning: "cantar" },
    ],
  },
  {
    title: "Capitais do Mundo",
    author: "Seed Data",
    words: [
      { name: "Portugal", meaning: "Lisboa" },
      { name: "Espanha", meaning: "Madrid" },
      { name: "França", meaning: "Paris" },
      { name: "Itália", meaning: "Roma" },
      { name: "Alemanha", meaning: "Berlim" },
      { name: "Reino Unido", meaning: "Londres" },
      { name: "Brasil", meaning: "Brasília" },
      { name: "Japão", meaning: "Tóquio" },
      { name: "Canadá", meaning: "Ottawa" },
      { name: "Austrália", meaning: "Camberra" },
      { name: "Rússia", meaning: "Moscovo" },
      { name: "China", meaning: "Pequim" },
      { name: "Argentina", meaning: "Buenos Aires" },
      { name: "Egito", meaning: "Cairo" },
      { name: "África do Sul", meaning: "Pretória" },
    ],
  },
  {
    title: "Conceitos de Programação",
    author: "Seed Data",
    words: [
      { name: "API", meaning: "Application Programming Interface" },
      { name: "SDK", meaning: "Software Development Kit" },
      { name: "IDE", meaning: "Integrated Development Environment" },
      { name: "OOP", meaning: "Object-Oriented Programming" },
      { name: "REST", meaning: "Representational State Transfer" },
      { name: "CRUD", meaning: "Create, Read, Update, Delete" },
      { name: "CLI", meaning: "Command-Line Interface" },
      { name: "Git", meaning: "Sistema de controlo de versões" },
      { name: "React", meaning: "Biblioteca JavaScript para UIs" },
      { name: "TypeScript", meaning: "Superset de JavaScript tipado" },
    ],
  },
  {
    title: "Palavras Frequentes (Inglês - A1)",
    author: "Seed Data",
    words: [
      { name: "house", meaning: "casa" },
      { name: "car", meaning: "carro" },
      { name: "book", meaning: "livro" },
      { name: "water", meaning: "água" },
      { name: "food", meaning: "comida" },
      { name: "dog", meaning: "cão" },
      { name: "cat", meaning: "gato" },
      { name: "school", meaning: "escola" },
      { name: "sun", meaning: "sol" },
      { name: "rain", meaning: "chuva" },
      { name: "friend", meaning: "amigo" },
      { name: "family", meaning: "família" },
      { name: "phone", meaning: "telemóvel" },
      { name: "music", meaning: "música" },
      { name: "city", meaning: "cidade" },
    ],
  },
  {
    title: "Cores em Inglês",
    author: "Seed Data",
    words: [
      { name: "red", meaning: "vermelho" },
      { name: "blue", meaning: "azul" },
      { name: "green", meaning: "verde" },
      { name: "yellow", meaning: "amarelo" },
      { name: "black", meaning: "preto" },
      { name: "white", meaning: "branco" },
      { name: "orange", meaning: "laranja" },
      { name: "purple", meaning: "roxo" },
      { name: "pink", meaning: "cor-de-rosa" },
      { name: "brown", meaning: "castanho" },
    ],
  },
  {
    title: "Animais em Inglês",
    author: "Seed Data",
    words: [
      { name: "lion", meaning: "leão" },
      { name: "tiger", meaning: "tigre" },
      { name: "elephant", meaning: "elefante" },
      { name: "monkey", meaning: "macaco" },
      { name: "bear", meaning: "urso" },
      { name: "snake", meaning: "cobra" },
      { name: "wolf", meaning: "lobo" },
      { name: "fox", meaning: "raposa" },
      { name: "giraffe", meaning: "girafa" },
      { name: "zebra", meaning: "zebra" },
    ],
  },
  {
    title: "Objetos do Dia-a-Dia",
    author: "Seed Data",
    words: [
      { name: "chair", meaning: "cadeira" },
      { name: "table", meaning: "mesa" },
      { name: "window", meaning: "janela" },
      { name: "door", meaning: "porta" },
      { name: "pen", meaning: "caneta" },
      { name: "pencil", meaning: "lápis" },
      { name: "notebook", meaning: "caderno" },
      { name: "clock", meaning: "relógio" },
      { name: "lamp", meaning: "candeeiro" },
      { name: "backpack", meaning: "mochila" },
    ],
  },
  {
    title: "Países e Continentes",
    author: "Seed Data",
    words: [
      { name: "Portugal", meaning: "Europa" },
      { name: "Brasil", meaning: "América do Sul" },
      { name: "Egito", meaning: "África" },
      { name: "China", meaning: "Ásia" },
      { name: "Austrália", meaning: "Oceania" },
      { name: "Canadá", meaning: "América do Norte" },
      { name: "Japão", meaning: "Ásia" },
      { name: "Angola", meaning: "África" },
      { name: "México", meaning: "América do Norte" },
      { name: "Alemanha", meaning: "Europa" },
    ],
  },
  {
    title: "Frutas em Inglês",
    author: "Seed Data",
    words: [
      { name: "apple", meaning: "maçã" },
      { name: "banana", meaning: "banana" },
      { name: "orange", meaning: "laranja" },
      { name: "grape", meaning: "uva" },
      { name: "pear", meaning: "pêra" },
      { name: "watermelon", meaning: "melancia" },
      { name: "strawberry", meaning: "morango" },
      { name: "pineapple", meaning: "ananás" },
      { name: "cherry", meaning: "cereja" },
      { name: "peach", meaning: "pêssego" },
    ],
  },
  {
    title: "Dias da Semana e Meses",
    author: "Seed Data",
    words: [
      { name: "Monday", meaning: "Segunda-feira" },
      { name: "Tuesday", meaning: "Terça-feira" },
      { name: "Wednesday", meaning: "Quarta-feira" },
      { name: "Thursday", meaning: "Quinta-feira" },
      { name: "Friday", meaning: "Sexta-feira" },
      { name: "Saturday", meaning: "Sábado" },
      { name: "Sunday", meaning: "Domingo" },
      { name: "January", meaning: "Janeiro" },
      { name: "February", meaning: "Fevereiro" },
      { name: "March", meaning: "Março" },
      { name: "April", meaning: "Abril" },
      { name: "May", meaning: "Maio" },
      { name: "June", meaning: "Junho" },
      { name: "July", meaning: "Julho" },
      { name: "August", meaning: "Agosto" },
      { name: "September", meaning: "Setembro" },
      { name: "October", meaning: "Outubro" },
      { name: "November", meaning: "Novembro" },
      { name: "December", meaning: "Dezembro" },
    ],
  },
  {
    title: "Partes do Corpo (Inglês)",
    author: "Seed Data",
    words: [
      { name: "head", meaning: "cabeça" },
      { name: "hand", meaning: "mão" },
      { name: "foot", meaning: "pé" },
      { name: "arm", meaning: "braço" },
      { name: "leg", meaning: "perna" },
      { name: "eye", meaning: "olho" },
      { name: "ear", meaning: "orelha" },
      { name: "nose", meaning: "nariz" },
      { name: "mouth", meaning: "boca" },
      { name: "shoulder", meaning: "ombro" },
    ],
  },
  {
    title: "Profissões em Inglês",
    author: "Seed Data",
    words: [
      { name: "teacher", meaning: "professor" },
      { name: "doctor", meaning: "médico" },
      { name: "engineer", meaning: "engenheiro" },
      { name: "lawyer", meaning: "advogado" },
      { name: "nurse", meaning: "enfermeira" },
      { name: "pilot", meaning: "piloto" },
      { name: "chef", meaning: "cozinheiro" },
      { name: "police officer", meaning: "polícia" },
      { name: "firefighter", meaning: "bombeiro" },
      { name: "farmer", meaning: "agricultor" },
    ],
  },
  {
    title: "Palavras Avançadas (Inglês C1)",
    author: "Seed Data",
    words: [
      { name: "ubiquitous", meaning: "onipresente" },
      { name: "serendipity", meaning: "feliz acaso" },
      { name: "ephemeral", meaning: "efémero" },
      { name: "eloquent", meaning: "eloquente" },
      { name: "resilient", meaning: "resiliente" },
      { name: "tenacious", meaning: "teimoso / persistente" },
      { name: "ambiguous", meaning: "ambíguo" },
      { name: "meticulous", meaning: "meticuloso" },
      { name: "benevolent", meaning: "benevolente" },
      { name: "candid", meaning: "franco / sincero" },
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
        await addWord(newDeckId, wordData.name, wordData.meaning);
      }
    }
    console.log("Seeding da base de dados concluído com sucesso!");
  } catch (error) {
    console.error("Erro durante o seeding da base de dados:", error);
    throw error;
  }
};
