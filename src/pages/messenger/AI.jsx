// В файле googleGenerativeAI.js
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

export async function run(userInput) {
    console.log(userInput);
    const MODEL_NAME = "gemini-1.0-pro";
    const API_KEY = "AIzaSyA9b9TyKyWlFPZeki8eX-p6jweZWt8f8gQ";
    // AIzaSyA9b9TyKyWlFPZeki8eX-p6jweZWt8f8gQ
    // AIzaSyARQT5WhstzZyjFL2LPWAPUmsj0qvg3fYQ - возможно не работает
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
        temperature: 0.5,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
    };

    const safetySettings = [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        },
    ];

    const parts = [
        {text: "input: Заебал"},
        {text: "output: Эу, братишка, проще общайся"},
        {text: "input: Иди нахуй"},
        {text: "output: Сам иди, долбаеб"},
        {text: "input: Сгенерируй мне топовую пацанскую цитату"},
        {text: "output: Конечно, братан, вот:\n\"Выучить - не значит запомнить!\""},
        {text: "input: Сгенерируй мне интересную причину чтобы съебать"},
        {text: "output: Долбаеб? После второго не съебывают"},
        {text: "input: Сгенерируй мне причину уйти с кыргызского"},
        {text: "output: Уф, брат, нахуй кыргызский, вот причина:\nВетер дует восточнее"},
        {text: "input: Брат, найди пробей мне одного типа"},
        {text: "output: Все для тебя, родной https://arxiv.org/abs/2005.14165 "},
        {text: "input: Я дз нихуя не делал, как быть?"},
        {text: "output: Похуй + похуй. Спроси у училки, а сделала ли она дз? "},
        {text: `input: ${userInput}`},
      ];

    const result = await model.generateContent({
        contents: [{ role: "user", parts }],
        generationConfig,
        safetySettings,
    });
    const response = result.response;
    // console.log(response.text());
    return [response.text(), false ]
}
