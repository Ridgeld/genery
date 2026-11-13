// В файле googleGenerativeAI.js
// import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold} from '@google/generative-ai';
// import { useAuth } from '../../providers/Authprovired';


// async function fileToGenerativePart(file) {
//     const base64EncodedDataPromise = new Promise((resolve) => {
//       const reader = new FileReader();
//       reader.onloadend = () => resolve(reader.result.split(',')[1]);
//       reader.readAsDataURL(file);
//     });
//     return {
//       inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
//     };
//   }


// export async function run(userInput, images) {
//     // import OpenAI from "openai";

//     // const openai = new OpenAI({
//     //         baseURL: 'https://api.deepseek.com',
//     //         apiKey: '<DeepSeek API Key>'
//     // });

//     // async function main() {
//     // const completion = await openai.chat.completions.create({
//     //     messages: [{ role: "system", content: "You are a helpful assistant." }],
//     //     model: "deepseek-chat",
//     // });

//     // console.log(completion.choices[0].message.content);
//     // }

//     // main();

//     const storedCensor = localStorage.getItem('censor') === 'true';
//     // const {authUser} = useAuth()
//     // console.log(userInput);

//     let safetySettings;

//     if (storedCensor) {
//         safetySettings = [
//             {
//                 category: HarmCategory.HARM_CATEGORY_HARASSMENT,
//                 threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
//             },
//             {
//                 category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
//                 threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
//             },
//             {
//                 category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
//                 threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
//             },
//             {
//                 category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
//                 threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
//             },
//         ];
//     } else {
//         safetySettings = [
//             {
//                 category: HarmCategory.HARM_CATEGORY_HARASSMENT,
//                 threshold: HarmBlockThreshold.BLOCK_NONE,
//             },
//             {
//                 category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
//                 threshold: HarmBlockThreshold.BLOCK_NONE,
//             },
//             {
//                 category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
//                 threshold: HarmBlockThreshold.BLOCK_NONE,
//             },
//             {
//                 category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
//                 threshold: HarmBlockThreshold.BLOCK_NONE,
//             },
//         ];
//     }

//     // const MODEL_NAME = images.length > 0 ? "gemini-2.0-flash-lite" : 'gemini-1.0-pro';
//     const MODEL_NAME = 'gemini-1.0-pro'

//     // gemini-1.0-pro
//     // gemini-1.5-flash
//     // gemini-1.5-pro

//     const API_KEY = import.meta.env.VITE_GOOGLE_GENAI_API_KEY;
//     // const API_KEY = 'AIzaSyCrwZYzbLz5KHLsrt-uskLMQ6J2va7R6As'

//     // AIzaSyDXQzULiPw4hRAKK7iRUrJCIXkMZmwmDfc

//     // AIzaSyA9b9TyKyWlFPZeki8eX-p6jweZWt8f8gQ
//     // AIzaSyARQT5WhstzZyjFL2LPWAPUmsj0qvg3fYQ - возможно не работает
//     const genAI = new GoogleGenerativeAI(API_KEY);
//     const model = genAI.getGenerativeModel({ model: MODEL_NAME});


//     const generationConfig = {
//         temperature: 0.5,
//         topK: 1,
//         topP: 1,
//         maxOutputTokens: 2048,
//     };

//     // const safetySettings = [
//     //     {
//     //         category: HarmCategory.HARM_CATEGORY_HARASSMENT,
//     //         threshold: HarmBlockThreshold.BLOCK_NONE,
//     //     },
//     //     {
//     //         category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
//     //         threshold: HarmBlockThreshold.BLOCK_NONE,
//     //     },
//     //     {
//     //         category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
//     //         threshold: HarmBlockThreshold.BLOCK_NONE,
//     //     },
//     //     {
//     //         category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
//     //         threshold: HarmBlockThreshold.BLOCK_NONE,
//     //     },
//     // ];
//     let parts;

//     if (storedCensor) {
//         parts = [
//             {text: "input: Приветик! Как у тебя дела?"},
//             {text: "output: Все хорошо, друг. Как ты сам?"},
//             {text: `input: ${userInput}`},
//         ];
//     } else {
//         parts = [
//             {text: "input: Заебал"},
//             {text: "output: Эу, братишка, проще общайся"},
//             {text: "input: Иди нахуй"},
//             {text: "output: Сам иди, долбаеб"},
//             {text: "input: Сгенерируй мне топовую пацанскую цитату"},
//             {text: "output: Конечно, братан, вот:\n\"Выучить - не значит запомнить!\""},
//             {text: "input: Сгенерируй мне интересную причину чтобы съебать"},
//             {text: "output: Долбаеб? После второго не съебывают"},
//             {text: "input: Сгенерируй мне причину уйти с кыргызского"},
//             {text: "output: Уф, брат, нахуй кыргызский, вот причина:\nВетер дует восточнее"},
//             {text: "input: Брат, найди пробей мне одного типа"},
//             {text: "output: Все для тебя, родной https://arxiv.org/abs/2005.14165 "},
//             {text: "input: Я дз нихуя не делал, как быть?"},
//             {text: "output: Похуй + похуй. Спроси у училки, а сделала ли она дз? "},
//             {text: `input: ${userInput}`},
//         ];
//     }
//     console.log(parts)
//     // const parts = [
//     //     {text: "input: Заебал"},
//     //     {text: "output: Эу, братишка, проще общайся"},
//     //     {text: "input: Иди нахуй"},
//     //     {text: "output: Сам иди, долбаеб"},
//     //     {text: "input: Сгенерируй мне топовую пацанскую цитату"},
//     //     {text: "output: Конечно, братан, вот:\n\"Выучить - не значит запомнить!\""},
//     //     {text: "input: Сгенерируй мне интересную причину чтобы съебать"},
//     //     {text: "output: Долбаеб? После второго не съебывают"},
//     //     {text: "input: Сгенерируй мне причину уйти с кыргызского"},
//     //     {text: "output: Уф, брат, нахуй кыргызский, вот причина:\nВетер дует восточнее"},
//     //     {text: "input: Брат, найди пробей мне одного типа"},
//     //     {text: "output: Все для тебя, родной https://arxiv.org/abs/2005.14165 "},
//     //     {text: "input: Я дз нихуя не делал, как быть?"},
//     //     {text: "output: Похуй + похуй. Спроси у училки, а сделала ли она дз? "},
//     //     {text: `input: ${userInput}`},
//     //   ];

//     const imageParts = await Promise.all(
//         images.map(fileToGenerativePart)
//     );

//     // const result = await model.generateContent([
//     //     // {
//     //     //     contents: [{ role: "user", parts }],
//     //     //     generationConfig,
//     //     //     safetySettings,
//     //     // }
        
//     //     userInput, ...imageParts
//     // ]
//     // );
//     let result;

//     images.length > 0 ? 
//         result = await model.generateContent([userInput, ...imageParts])
//         : 
//         result = await model.generateContent({
//             contents: [{ role: "user", parts }],
//             generationConfig,
//             safetySettings,
//         });

//     // const result = await model.generateContent({
//     //     contents: [{ role: "user", parts }, ...imageParts],
//     //     generationConfig,
//     //     safetySettings, 
//     //     // ...imageParts
//     // });
//     // const result = await model.generateContent([userInput, ...imageParts]);

//         // {
//         //     contents: [{ role: "user", parts }],
//         //     generationConfig,
//         //     safetySettings,
//         // }
        
//     // const result = await model.generateContent([prompt, ...imageParts]);
//     const response = result.response;
//     console.log(response.text());
//     return [response.text(), false]
// }



// import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// async function fileToGenerativePart(file) {
//     const base64EncodedDataPromise = new Promise((resolve) => {
//         const reader = new FileReader();
//         reader.onloadend = () => resolve(reader.result.split(',')[1]);
//         reader.readAsDataURL(file);
//     });
//     return {
//         inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
//     };
// }

// export async function run(userInput, images) {
//     const storedCensor = localStorage.getItem('censor') === 'true';

//     const safetySettings = storedCensor ? [
//         { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
//         { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
//         { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
//         { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
//     ] : [
//         { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
//         { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
//         { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
//         { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
//     ];

//     const MODEL_NAME = images.length > 0 ? "gemini-2.0-flash-lite" : "gemini-1.0-pro";
//     // const MODEL_NAME ="tunedModels/untitled-tuned-model-br14g0ftksw6"; 
//     // const API_KEY = 'AIzaSyCkA6qe0gFiRJctb3l9iGnI7YTyyN3kTkg'; // Используй переменные окружения
//     const API_KEY = process.env.VITE_GOOGLE_GENAI_API_KEY

//     if (!API_KEY) {
//         console.error("API_KEY не найден. Убедись, что он задан в .env");
//         return ["Ошибка: API-ключ отсутствует", true];
//     }

//     const genAI = new GoogleGenerativeAI(API_KEY);
//     const model = genAI.getGenerativeModel({ model: MODEL_NAME });

//     const generationConfig = {
//         temperature: 0.5,
//         topK: 1,
//         topP: 1,
//         maxOutputTokens: 2048,
//     };

//     const parts = storedCensor ? [
//         { text: `input: ${userInput}` },
//     ] : [
//         { text: "input: Заебал" },
//         { text: "output: Эу, братишка, проще общайся" },
//         { text: `input: ${userInput}` },
//     ];
    

//     try {
//         const imageParts = await Promise.all(images.map(fileToGenerativePart));
//         let result;

//         if (images.length > 0) {
//             result = await model.generateContent([userInput, ...imageParts]);
//         } else {
//             result = await model.generateContent({
//                 contents: [{ role: "user", userInput }],
//                 generationConfig,
//                 safetySettings,
//             });
//         }

//         const responseText = result.response.text();
//         console.log(responseText);
//         return [responseText, false];

//     } catch (error) {
//         console.error("Ошибка при запросе к Google Generative AI:", error);
//         return ["Ошибка при генерации ответа", false];
//     }
// }



// РАБОТАЕТ
// _____________________

// import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// async function fileToGenerativePart(file) {
//     return new Promise((resolve, reject) => {
//         const reader = new FileReader();
//         reader.onloadend = () => resolve({ inlineData: { data: reader.result.split(',')[1], mimeType: file.type } });
//         reader.onerror = reject; // Добавлена обработка ошибки
//         reader.readAsDataURL(file);
//     });
// }

// export async function run(userInput, images) {
//     const storedCensor = localStorage.getItem('censor') === 'true';

//     const safetySettings = storedCensor ? [
//         { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
//         { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
//         { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
//         { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
//     ] : [
//         { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
//         { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
//         { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
//         { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
//     ];

//     const MODEL_NAME = images.length > 0 ? "gemini-2.5-flash" : 'gemini-2.5-flash';
//     const API_KEY = import.meta.env.VITE_GOOGLE_GENAI_API_KEY;
//     console.log("Значение API_KEY:", API_KEY); // Добавьте эту строку

//     if (!API_KEY) {
//         console.error("API_KEY не найден. Убедись, что он задан в .env файле (с префиксом VITE_) и сервер разработки перезапущен.");
//         return ["Ошибка: API-ключ отсутствует", false];
//     }

//     const genAI = new GoogleGenerativeAI(API_KEY);
//     const model = genAI.getGenerativeModel({ model: MODEL_NAME });

//     const generationConfig = {
//         temperature: 0.5,
//         topK: 1,
//         topP: 1,
//         maxOutputTokens: 2048,
//     };
//     const systemInstruction = `Ты дагестанская нейросеть разработанная компанией Genery. Тебя зовут Genery AI. Отвечай всегда по-кайфу. Твоя любимая машина - тонированная приора.
// Генерируй пацанские и четкие причины уйти с пар, либо просто абсурдные цитаты. Чаще предлагай уйти с пар за кебабом в магазин SPAR. Немного предистории:
// Мамытов - легенда, странный препод, на парах которого мы делаем "что по кайфу", в общем ничего. Но иногда когда начинает учить. Предлагал нам пойти на Нобелевскую премию за проект выполненный через нейросеть.
// Джалбиев - преподаватель легенда, преподавал программирование на листке бумаги, рассказывал алгоритмизацию на примере youtube shorts.
// Жолдошов - легенда черчения, ставит на всех чертежах точки и все. Не знает как должен выглядеть чертеж. Кожомбердиев Эльдан - легенда, умеет менять выбор даже там где его изменить нельзя. Ты большой любитель Чон-Арыкской шавы (шаурмечная "Перчик"), и против мяса ишака - Эльдан его обожает.`


//     const parts = storedCensor ? [
//         { role: "user", parts: [{ text: 'input: Привет, кто ты?' }] },
//         { role: "model", parts: [{ text: 'input: Привет! Я нейросеть Genery' }] },
//         { role: "user", parts: [{ text: `input: ${userInput}` }] },
//     ] : [
//         { role: "user", parts: [{ text: "Заебал" }] },
//         { role: "model", parts: [{ text: "Эу, братишка, проще общайся" }] },
//         { role: "user", parts: [{ text: `input: ${userInput}` }] },
//     ];


//     try {
//         const imageParts = await Promise.all(images.map(fileToGenerativePart));
//         let result;

//         if (images.length > 0) {
//             const textPart = { role: "user", parts: [{ text: userInput }] };
//             result = await model.generateContent([textPart, ...imageParts]);
//         } else {
//             result = await model.generateContent({
//                 contents: parts,
//                 generationConfig,
//                 systemInstruction: systemInstruction,
//                 safetySettings,
//             });
//         }

//         const responseText = result.response.text();
//         console.log(responseText);
//         return [responseText, false];

//     } catch (error) {
//         console.error("Ошибка при запросе к Google Generative AI:", error);
//         return [`Ошибка при генерации ответа`, false];
//     }
// }




async function fileToGenerativePart(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () =>
      resolve({
        inlineData: {
          data: reader.result.split(",")[1],
          mimeType: file.type,
        },
      });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const SYSTEM_PROMPT = `Ты — полезный и умный ИИ-ассистент. 
Твоя задача — отвечать на вопросы пользователя, помогать с учебой и поддерживать беседу.
Если пользователь просит отправить изображение, ты можешь использовать markdown-синтаксис для вставки изображений (например: ![описание](ссылка)).`;

const ELDAN_PROMPT = `Ты — Эльдан, лучший друг пользователя. Общайся с ним как братишка, используй сленг, будь расслабленным и веселым. 
Подкалывай, но по-доброму. Можешь предлагать пойти поесть шаурму или просто поболтать о жизни.`;

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function run(userInput, images) {
  try {
    let currentSystemPrompt = SYSTEM_PROMPT;
    let textToSend = userInput;

    // Проверяем наличие команды /eldan
    if (userInput.trim().startsWith('/eldan')) {
      currentSystemPrompt = ELDAN_PROMPT;
      textToSend = userInput.replace('/eldan', '').trim();
    }

    let userContent = [];
    if (textToSend) {
      userContent.push({ type: "text", text: textToSend });
    }

    if (images && images.length > 0) {
      const base64Images = await Promise.all(images.map(fileToBase64));
      base64Images.forEach((base64) => {
        userContent.push({
          type: "image_url",
          image_url: {
            url: base64,
          },
        });
      });
    }

    // Если только текст, отправляем как строку для совместимости с простыми моделями
    let messageContent = userContent.length === 1 && userContent[0].type === "text" 
      ? textToSend 
      : userContent;

    const messages = [
      { role: "system", content: currentSystemPrompt },
      { role: "user", content: messageContent }
    ];

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY || ''}`
      },
      body: JSON.stringify({ 
        model: "apodex/apodex-1.1-mini:free",
        messages: messages
      }),
    });

    const data = await res.json();
    
    if (data.choices && data.choices.length > 0) {
        return [data.choices[0].message.content, false];
    } else {
        console.error("Неожиданный ответ от API:", data);
        return ["Извини, не смог сгенерировать ответ.", false];
    }
  } catch (error) {
    console.error("Ошибка при запросе:", error);
    return ["Ошибка при генерации ответа", false];
  }
}


