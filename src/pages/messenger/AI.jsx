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

export async function run(userInput, images) {
  try {
    const imageParts = await Promise.all(images.map(fileToGenerativePart));

    const res = await fetch("https://genery-proxy-vercel.vercel.app/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userInput, images: imageParts }),
    });

    const data = await res.json();
    return [data.text, false];
  } catch (error) {
    console.error("Ошибка при запросе:", error);
    return ["Ошибка при генерации ответа", false];
  }
}


