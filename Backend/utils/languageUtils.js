import Sentiment from 'sentiment';
import { translate } from '@vitalets/google-translate-api';
import langdetect from 'langdetect';

const sentiment = new Sentiment();

// Common transliteration patterns by language - only keeping Tanglish and Hinglish
const transliterationPatterns = {
  'ta-en': { // Tamil in English letters (Tanglish)
    patterns: [
      /\b(amma|appa|akka|anna|thambi|kanna|inge|enge|epdi|enaku|unaku|vanakkam|sollu|vaanga|ponga)\b/i,
      /\b(illa|illai|seri|theriyum|puriyala|panni|kudukka|vaanga|ponga|saptiya|paaru|paar|azhaga|sariya|marubadiyum)\b/i,
      /\b(enku|odum|irukku|iruku|vendam|venam|romba|konjam|nalla|kettadu|paavam|azhaga|aappu|otha|kavalai|kovam)\b/i,
      /\b(maari|mathiri|pola|azhutha|kadaisi|kalyanam|saptiya|sapteengala|paar|paaru|sandhosham|kashtam|yenge|intha|intha)\b/i,
      /\b(ponnu|pasanga|payyan|machi|machan|nanba|da|di|ji|thalaiva|annachi|kaalai|neram|iravu|nalam|siripu|sogam|inniku)\b/i,
      /\b(kaathu|thanni|saapadu|vazhakku|pazhaya|pudhu|kanavu|kolai|kavala|aacharyam|vetti|veli|veedu|thunai|sugam|kidaikkum)\b/i,
      /\b(thani|urai|pothum|intha|anbu|magizhchi|thunai|seyal|vilai|kaasu|porum|selavu|thodangu|mudivu|mudhal|mudiyum)\b/i,
      // Tamil verb endings and grammar markers
      /\b(\w+)(inga|unga|enga|anga)\b/i, // respect markers
      /\b(\w+)(kudu|podu|edu|vidu|paru|solu)\b/i, // common verb forms
      /\b(\w+)(la|le|laya|leya)\b/i, // location/question markers
      /\b(\w+)(kaga|thaan|dhaan|um)\b/i // additional suffixes
    ],
    code: 'ta-en', // Custom code for Tamil transliterated to English
    // Common Tamil-English expressions with translations
    examples: [
      "Epdi irukka? (How are you?)",
      "Nalla iruken (I'm good)",
      "Enaku romba kashtama iruku (I'm feeling very difficult)",
      "Seri, paarkalaam (Okay, let's see)",
      "Enaku puriyala (I don't understand)",
      "Romba thanks! (Thanks a lot!)",
      "Sollungo, kekaren (Tell me, I'm listening)",
      "Pazhaiya saapadu iruka? (Is there any leftover food?)",
      "Kavalai vendaam (Don't worry)",
      "Sandhoshama irunga (Stay happy)",
      "Enka ooru Madurai (My hometown is Madurai)",
      "Vanga sapidalam (Come, let's eat)",
      "Thambi, enakku oru help (Brother, I need some help)",
      "Inniku evalo velai? (How much work today?)"
    ]
  },
  'hi-en': { // Hindi in English letters (Hinglish)
    patterns: [
      /\b(kaise|tabiyet|theek|nahi|hai|hain|kya|accha|thik|nahin|matlab|samajh)\b/i,
      /\b(meri|tumhari|aap|tum|main|hum|karenge|kariye|karo|namaste|dhanyavaad)\b/i,
      /\b(bahut|jyada|kam|zyada|bilkul|haan|bas|lekin|phir|kab|kuch|koi|kaisa)\b/i,
      /\b(yaar|bhai|didi|beta|beti|uncle|aunty|ji|haan|kyun|kyunki|zaroor)\b/i,
      // Add more Hinglish patterns
      /\b(raha|rahe|rahi|gaya|gaye|gayi|karna|karke|karenge)\b/i, // verb forms
      /\b(wala|wale|wali|ka|ke|ki|ko|se|me|par)\b/i, // postpositions
      /\b(bohot|kitna|kaun|kahan|kab|kaise|kyun)\b/i // question words
    ],
    code: 'hi-en', // Custom code for Hindi transliterated to English
    examples: [
      "Kaise ho? (How are you?)",
      "Main theek hoon (I'm fine)",
      "Aap kya kar rahe hain? (What are you doing?)",
      "Mujhe samajh nahi aaya (I didn't understand)",
      "Bahut shukriya (Thank you very much)",
      "Aaj mausam acha hai (Today the weather is nice)",
      "Kya aap meri madad kar sakte hain? (Can you help me?)"
    ]
  }
};

// New function to verify if text is properly in Hinglish
export function isHinglish(text) {
  if (!text) return false;
  
  // Common Hinglish markers
  const hinglishMarkers = [
    /\b(hai|hain|tha|the|thi|hoga|ho|kar|karo|kiya)\b/i, // Forms of "to be" and "to do"
    /\b(main|tum|aap|mera|meri|tera|teri|hamara|uska|unka)\b/i, // Pronouns
    /\b(ka|ke|ki|ko|se|me|par|tak|wala|wali)\b/i, // Postpositions
    /\b(acha|theek|bahut|jyada|kam|ekdum|bilkul|sahi)\b/i, // Adverbs/qualifiers
    /\b(bhai|yaar|dost|ji|beta|beti|aunty|uncle)\b/i, // Terms of address
    /\b(kya|kaise|kahan|kab|kaun|kyun)\b/i, // Question words
    /\bho (raha|rahe|rahi|gaya|gaye|gayi) (hai|hain)\b/i // Progressive/perfect tenses
  ];
  
  // At least 2 Hinglish markers should be present
  let matchCount = 0;
  for (const pattern of hinglishMarkers) {
    const matches = text.match(pattern);
    matchCount += matches ? matches.length : 0;
    if (matchCount >= 2) return true;
  }
  
  // Check for Hindi sentence structure (verb at end)
  const sentenceEndVerbs = /[.!?]\s*\b(hai|hain|tha|hoga|karo|karenge|jaenge)\b\s*[.!?]/i;
  if (sentenceEndVerbs.test(text)) return true;
  
  // Check for English content with Hindi grammar
  const englishWithHindiGrammar = /\b(health|food|exercise|sleep|water|yoga|stress)\s+\b(ke|ka|ki|karo|kare|hai)\b/i;
  if (englishWithHindiGrammar.test(text)) return true;
  
  return false;
}

// Function to verify if text is properly in Tanglish
export function isTanglish(text) {
  if (!text) return false;
  
  // Common Tanglish markers
  const tanglishMarkers = [
    /\b(irukk|irukka|iruken|irukanga|irukeenga)\b/i, // Forms of "to be"
    /\b(pann|pannu|pannunga|pannalaam)\b/i, // Forms of "to do"
    /\b(seri|enna|epdi|nalla|romba|konjam)\b/i, // Common words
    /\b(inga|unga|enga|anga)\b/i, // Respect markers
    /\b(la|le|ku|kku|oda|ala|illa)\b/i, // Grammatical markers
    /\b(kanna|di|da|ji|mama|amma|appa)\b/i, // Terms of address
    /\b(thaan|dhaan|um|aa|ah)\b/i, // Emphatic/question markers
    /nga\b/i, // Words ending with 'nga' (respect)
    /\b(enaku|unaku|avanga|ivanga|neenga)\b/i // Pronouns
  ];
  
  // At least 2 Tanglish markers should be present
  let matchCount = 0;
  for (const pattern of tanglishMarkers) {
    const matches = text.match(pattern);
    matchCount += matches ? matches.length : 0;
    if (matchCount >= 2) return true;
  }
  
  // Check for Tamil sentence structure (verb at end)
  const sentenceEndVerbs = /[.!?]\s*\b(irukku|iruken|irukanga|panren|pannunga|sollunga|vaanga|ponga)\b\s*[.!?]/i;
  if (sentenceEndVerbs.test(text)) return true;
  
  // Check for English content with Tamil grammar
  const englishWithTamilGrammar = /\b(English|health|food|exercise|sleep|water|yoga|stress)\s+\b(pathi|kurichu|panna|solla)\b/i;
  if (englishWithTamilGrammar.test(text)) return true;
  
  return false;
}

// Detect language including transliteration - simplified to only handle English, Tanglish and Hinglish
export async function detectLanguage(text) {
  try {
    // First check for native Tamil or Hindi scripts
    if (/[\u0B80-\u0BFF]/.test(text)) {
      return 'ta'; // Tamil
    } else if (/[\u0900-\u097F]/.test(text)) {
      return 'hi'; // Hindi
    }
    
    // Check for transliterated text
    // First check for Tanglish (often higher priority as it has more distinct patterns)
    if (isTanglish(text)) {
      console.log("Detected Tanglish");
      return 'ta-en';
    }
    
    // Then check for Hinglish
    if (isHinglish(text)) {
      console.log("Detected Hinglish");
      return 'hi-en';
    }
    
    // Check against pattern collections for more matches
    for (const [key, langData] of Object.entries(transliterationPatterns)) {
      const matchCount = langData.patterns.reduce((count, pattern) => {
        const matches = text.match(pattern);
        return count + (matches ? matches.length : 0);
      }, 0);
      
      // If we have 2 or more matches, it's likely this transliterated language
      if (matchCount >= 2) {
        console.log(`Detected transliterated language: ${key}`);
        return langData.code;
      }
    }
    
    // If no transliteration detected, assume English
    return 'en';
  } catch (error) {
    console.error("Error detecting language:", error);
    return 'en'; // Default to English on error
  }
}

// Analyze sentiment of text
export function analyzeSentiment(text) {
  try {
    const result = sentiment.analyze(text);
    
    if (result.score < -2) {
      return 'very negative';
    } else if (result.score < 0) {
      return 'negative';
    } else if (result.score === 0) {
      return 'neutral';
    } else if (result.score <= 2) {
      return 'positive';
    } else {
      return 'very positive';
    }
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return 'neutral'; // Default sentiment on error
  }
}

// Translate text from source language to target language - simplified for our three languages
export async function translateText(text, targetLang = 'en', sourceLang = null) {
  try {
    // Handle transliterated languages
    if (sourceLang === 'ta-en') sourceLang = 'ta';
    if (sourceLang === 'hi-en') sourceLang = 'hi';
    
    const { text: translatedText } = await translate(text, { 
      to: targetLang,
      from: sourceLang
    });
    return translatedText;
  } catch (error) {
    console.error("Translation error:", error);
    return text; // Return original text on error
  }
}

// Keep original language style when translating back
export async function translateWithStyle(text, detectedLanguage) {
  try {
    // If it's a transliterated language (like ta-en or hi-en)
    if (detectedLanguage.includes('-en')) {
      // Get the base language (ta from ta-en)
      const baseLanguage = detectedLanguage.split('-')[0];
      
      // First translate to the actual language (Tamil)
      const intermediateTranslation = await translateText(text, baseLanguage, 'en');
      
      // Then ask the LLM to transliterate back to English style but preserve
      // the original language patterns
      const system = `Translate the following ${getLanguageName(baseLanguage)} text back to 
                    English letters but keep the ${getLanguageName(baseLanguage)} language 
                    and speaking style. Match the casual conversational tone of the original input.`;
      
      // This part would require an LLM call to do the stylistic translation
      // For now, we'll return a special tag so the main app.js can handle it
      return {
        text: intermediateTranslation,
        needsTransliteration: true,
        originalText: text,
        baseLanguage
      };
    }
    
    // Regular translation case
    return { text: text, needsTransliteration: false };
  } catch (error) {
    console.error("Style translation error:", error);
    return { text: text, needsTransliteration: false };
  }
}

// Convert English text to Tanglish
export function convertToTanglish(englishText) {
  if (!englishText) return englishText;
  
  // Common English to Tanglish word replacements
  const replacements = {
    'i am': 'naan',
    'you are': 'neenga',
    'is': 'irukku',
    'are': 'irukkanga',
    'was': 'irundhadu',
    'will': 'poven',
    'can': 'mudiyum',
    'cannot': 'mudiyaadhu',
    "can't": 'mudiyaadhu',
    'good': 'nalla',
    'bad': 'mosama',
    'yes': 'aama',
    'no': 'illa',
    'ok': 'seri',
    'okay': 'seri',
    'sorry': 'mannikanum',
    'please': 'thayavu seidhu',
    'thank you': 'nandri',
    'thanks': 'romba nandri',
    'welcome': 'varuga varuga',
    'hello': 'vanakkam',
    'what': 'enna',
    'why': 'yean',
    'how': 'eppadi',
    'when': 'eppo',
    'where': 'enga',
    'who': 'yaaru',
    'very': 'romba',
    'too much': 'adhigama',
    'little': 'konjam',
    'here': 'inga',
    'there': 'anga',
    'this': 'idhu',
    'that': 'adhu',
    'these': 'idhugal',
    'those': 'adhugal',
    'do': 'pannunga',
    'did': 'panneengala',
    'doing': 'pannitu',
    'done': 'pannitachu',
    'eat': 'saapidu',
    'drink': 'kudi',
    'sleep': 'thoonggu',
    'walk': 'nada',
    'run': 'odu',
    'work': 'velai'
  };
  
  // Simple tanglish transformation
  let tanglishText = englishText;
  
  // Replace words with Tanglish equivalents
  for (const [english, tamil] of Object.entries(replacements)) {
    // Use word boundary to prevent partial word replacements
    const regex = new RegExp(`\\b${english}\\b`, 'gi');
    tanglishText = tanglishText.replace(regex, tamil);
  }
  
  // Add common Tamil endings
  tanglishText = tanglishText
    // Add respect marker to verbs
    .replace(/\b(tell|ask|do|say|give|take|help|try)\b/gi, '$1unga')
    // Change question structure
    .replace(/\?/g, 'a?')
    // Add common Tamil sentence endings
    .replace(/\.\s*$/gm, ' thaan.')
    // Make imperative sentences more polite with "unga"
    .replace(/\b(please|kindly)?\s*(try|do|eat|drink|sleep|check|read)\b/gi, '$2unga');
  
  return tanglishText;
}

// Convert English text to Hinglish
export function convertToHinglish(englishText) {
  if (!englishText) return englishText;
  
  // Common English to Hinglish word replacements
  const replacements = {
    'i am': 'main hoon',
    'you are': 'aap hain',
    'is': 'hai',
    'are': 'hain',
    'was': 'tha',
    'will': 'karega',
    'can': 'kar sakta hai',
    'cannot': 'nahi kar sakta',
    "can't": 'nahi kar sakta',
    'good': 'acha',
    'bad': 'bura',
    'yes': 'haan',
    'no': 'nahi',
    'ok': 'theek hai',
    'okay': 'theek hai',
    'sorry': 'maaf kijiye',
    'please': 'kripya',
    'thank you': 'dhanyavaad',
    'thanks': 'shukriya',
    'welcome': 'swagat hai',
    'hello': 'namaste',
    'what': 'kya',
    'why': 'kyun',
    'how': 'kaise',
    'when': 'kab',
    'where': 'kahan',
    'who': 'kaun',
    'very': 'bahut',
    'too much': 'bahut zyada',
    'little': 'thoda',
    'here': 'yahan',
    'there': 'wahan',
    'this': 'yeh',
    'that': 'woh',
    'these': 'yeh sab',
    'those': 'woh sab',
    'do': 'karo',
    'did': 'kiya',
    'doing': 'kar raha hai',
    'done': 'ho gaya',
    'eat': 'khao',
    'drink': 'piyo',
    'sleep': 'so jao',
    'walk': 'chalo',
    'run': 'bhaago',
    'work': 'kaam'
  };
  
  // Simple hinglish transformation
  let hinglishText = englishText;
  
  // Replace words with Hinglish equivalents
  for (const [english, hindi] of Object.entries(replacements)) {
    // Use word boundary to prevent partial word replacements
    const regex = new RegExp(`\\b${english}\\b`, 'gi');
    hinglishText = hinglishText.replace(regex, hindi);
  }
  
  // Add common Hindi grammatical structures
  hinglishText = hinglishText
    // Add respect marker to verbs
    .replace(/\b(please|kindly)?\s*(try|do|eat|drink|sleep|check|read)\b/gi, '$2 kijiye')
    // Change common verb forms to Hindi style
    .replace(/\b(is|are) going to\b/gi, 'wala hai')
    // Make commands more polite
    .replace(/\b(must|should|need to)\b/gi, 'chahiye');
  
  return hinglishText;
}

// Helper function to get language name
function getLanguageName(code) {
  const languages = {
    'en': 'English',
    'ta': 'Tamil',
    'hi': 'Hindi'
  };
  return languages[code] || code;
}