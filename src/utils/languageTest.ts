// Teste para o filtro de idioma português
export const testLanguageFilter = () => {
  // Questões em português (devem retornar true)
  const portugueseQuestions = [
    'Qual é a capital do Brasil?',
    'Quanto é 2 + 2?',
    'Quem descobriu o Brasil?',
    'Onde fica a Torre Eiffel?',
    'Como se chama o presidente?'
  ];
  
  // Questões em inglês (devem retornar false)
  const englishQuestions = [
    'What is the capital of Brazil?',
    'How much is 2 + 2?',
    'Who discovered Brazil?',
    'Where is the Eiffel Tower?',
    'What is the president\'s name?'
  ];
  
  // Questões mistas (devem ser analisadas pelo algoritmo)
  const mixedQuestions = [
    'Qual é o resultado de 5 x 5?',
    'What is the meaning of life?',
    'Como se diz "hello" em inglês?',
    'The capital of France is...'
  ];
  
  console.log('=== Teste do Filtro de Idioma ===');
  
  console.log('\nQuestões em Português (devem retornar true):');
  portugueseQuestions.forEach(q => {
    console.log(`"${q}" -> ${isPortugueseQuestion(q)}`);
  });
  
  console.log('\nQuestões em Inglês (devem retornar false):');
  englishQuestions.forEach(q => {
    console.log(`"${q}" -> ${isPortugueseQuestion(q)}`);
  });
  
  console.log('\nQuestões Mistas:');
  mixedQuestions.forEach(q => {
    console.log(`"${q}" -> ${isPortugueseQuestion(q)}`);
  });
};

// Função de teste do filtro de idioma (cópia da implementação no serviço)
function isPortugueseQuestion(text: string): boolean {
  // Palavras comuns em inglês que indicam que a questão não está em português
  const englishWords = [
    'what', 'when', 'where', 'who', 'which', 'how', 'why',
    'is', 'are', 'was', 'were', 'has', 'have', 'had',
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at',
    'to', 'for', 'of', 'with', 'by', 'from', 'about', 'into',
    'through', 'during', 'before', 'after', 'above', 'below',
    'between', 'among', 'inside', 'outside', 'up', 'down',
    'left', 'right', 'north', 'south', 'east', 'west'
  ];
  
  // Palavras comuns em português que indicam que a questão está em português
  const portugueseWords = [
    'qual', 'quem', 'quando', 'onde', 'como', 'por que', 'porque',
    'é', 'são', 'era', 'eram', 'tem', 'têm', 'tinha', 'tinham',
    'o', 'a', 'os', 'as', 'um', 'uma', 'e', 'ou', 'mas', 'em', 'no', 'na',
    'para', 'por', 'de', 'com', 'sem', 'sobre', 'entre', 'dentro', 'fora',
    'cima', 'baixo', 'esquerda', 'direita', 'norte', 'sul', 'leste', 'oeste'
  ];
  
  const lowerText = text.toLowerCase();
  
  // Contar palavras em inglês vs português
  let englishCount = 0;
  let portugueseCount = 0;
  
  englishWords.forEach(word => {
    if (lowerText.includes(word.toLowerCase())) {
      englishCount++;
    }
  });
  
  portugueseWords.forEach(word => {
    if (lowerText.includes(word.toLowerCase())) {
      portugueseCount++;
    }
  });
  
  // Se há mais palavras em português ou se não há palavras em inglês, considerar português
  // Também verificar se há caracteres específicos do português
  const hasPortugueseChars = /[áàâãéèêíìîóòôõúùûç]/i.test(text);
  
  return (portugueseCount >= englishCount || englishCount === 0) || hasPortugueseChars;
}
