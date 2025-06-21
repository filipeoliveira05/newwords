# NewWords 📚

Bem-vindo ao NewWords, uma aplicação móvel construída com React Native e Expo, desenhada para ajudar os utilizadores a expandirem o seu vocabulário através da leitura. A aplicação permite criar conjuntos de palavras (flashcards) por livro, praticar de forma inteligente e acompanhar o progresso com estatísticas detalhadas.

## ✨ Visão Geral

O objetivo principal desta aplicação é ser mais do que um simples bloco de notas; é ser um **tutor de aprendizagem pessoal**. Através de um sistema de repetição espaçada e futuras integrações com IA, a aplicação visa otimizar o processo de memorização de novo vocabulário, tornando a aprendizagem mais eficaz e motivadora.

---

## 🚀 Funcionalidades Implementadas

A fundação da aplicação está completa, com uma arquitetura robusta e escalável. As seguintes funcionalidades estão 100% operacionais:

### 1. Gestão Completa de Decks (Conjuntos)
- **Criar Decks:** Adicionar novos conjuntos de palavras, associados a um livro ou tema, com título e autor.
- **Listar Decks:** Visualizar todos os decks existentes, com uma contagem em tempo real do número de palavras em cada um.
- **Editar Decks:** Modificar o título e o autor de um deck existente.
- **Apagar Decks:** Remover um deck e todas as suas palavras associadas de forma segura, com um diálogo de confirmação.

### 2. Gestão Completa de Palavras (Flashcards)
- **Adicionar Palavras:** Inserir novas palavras num deck específico, com o seu significado ou sinónimos.
- **Listar Palavras:** Visualizar todas as palavras de um deck com uma interface limpa.
- **Pesquisar Palavras:** Filtrar rapidamente as palavras dentro de um deck.
- **Editar Palavras:** Corrigir ou melhorar uma palavra ou o seu significado.
- **Apagar Palavras:** Remover uma palavra individualmente.

### 3. Arquitetura e Qualidade Técnica
- **Estado Centralizado (Zustand):** Toda a lógica de dados da aplicação é gerida por stores centrais (`deckStore`, `wordStore`), garantindo uma UI reativa e consistente, sem bugs de sincronização.
- **Base de Dados Robusta (Expo-SQLite):** Utiliza uma base de dados SQLite local, com uma camada de acesso a dados totalmente **assíncrona** e com gestão de erros explícita.
- **UI Polida e Responsiva:** A aplicação inclui indicadores de carregamento e gravação, proporcionando um feedback claro ao utilizador sobre o estado do sistema.

---

## 🗺️ Roadmap de Desenvolvimento

Com a fundação sólida já construída, o foco agora é desenvolver as funcionalidades que entregam o valor principal da aplicação ao utilizador.

### 🎯 Prioridades Atuais

1.  **Implementar o Core Loop de Aprendizagem (`PracticeScreen`)**
    - [ ] Desenvolver o algoritmo de seleção de palavras (priorizando as menos treinadas e mais antigas).
    - [ ] Construir a interface de treino, mostrando um flashcard de cada vez.
    - [ ] Implementar a lógica para os botões "Certo" e "Errado", atualizando as estatísticas de cada palavra na base de dados.

2.  **Implementar o Ecrã de Estatísticas (`StatsScreen`)**
    - [ ] Criar queries SQL para obter dados agregados (ex: palavras mais erradas, taxa de acerto global).
    - [ ] Desenvolver a UI para mostrar as estatísticas de forma clara e motivadora.
    - [ ] (Opcional) Integrar uma biblioteca de gráficos (`react-native-gifted-charts`) para visualizações de dados mais ricas.

3.  **Internacionalização (i18n)**
    - [ ] Integrar a biblioteca `i18next` e `react-i18next`.
    - [ ] Abstrair todos os textos da UI para ficheiros de tradução (começando com `pt` e `en`).
    - [ ] Implementar a deteção automática do idioma do dispositivo.

### 🔮 Funcionalidades Futuras (Próximos Níveis)

#### Nível 1: Melhorar o Core
- [ ] **Sistema de Repetição Espaçada (SRS):** Evoluir o algoritmo de treino para um verdadeiro SRS, que calcula o intervalo de revisão ótimo para cada palavra.
- [ ] **Modos de Treino Alternativos:** Adicionar mais formas de praticar (ex: escolha múltipla, escrever a palavra).

#### Nível 2: A Magia da IA
- [ ] **Gerador de Definições:** Usar uma API de LLM (como Gemini ou GPT) para preencher automaticamente o significado de uma palavra.
- [ ] **Gerador de Frases de Exemplo:** Para cada palavra, gerar uma frase que a use em contexto.
- [ ] **"Descobridor" de Palavras:** Permitir ao utilizador extrair vocabulário a partir de uma foto ou de um texto colado.

#### Nível 3: Polimento e Crescimento
- [ ] **Autenticação e Sincronização na Nuvem (Supabase ou Firebase):** Permitir que os utilizadores criem uma conta e façam backup dos seus dados.
- [ ] **Notificações Push:** Implementar lembretes diários/semanais para incentivar o treino.
- [ ] **Modo Escuro:** Oferecer uma alternativa visual para a interface.

---

## 🛠️ Stack Tecnológica Principal

- **Framework:** React Native (Expo)
- **Linguagem:** TypeScript
- **Gestão de Estado:** Zustand
- **Base de Dados:** Expo-SQLite (com API `next`)
- **Navegação:** React Navigation
- **UI:** Componentes nativos do React Native
