// В файле googleGenerativeAI.js
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold} from '@google/generative-ai';
import { useAuth } from '../../providers/Authprovired';


async function fileToGenerativePart(file) {
    const base64EncodedDataPromise = new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
  }

export async function run(userInput, images) {


    const storedCensor = localStorage.getItem('censor') === 'true';
    // const {authUser} = useAuth()
    // console.log(userInput);

    let safetySettings;

    if (storedCensor) {
        safetySettings = [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
            },
        ];
    } else {
        safetySettings = [
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
    }

    const MODEL_NAME = images.length > 0 ? "gemini-1.0-pro-vision-latest" : 'gemini-1.5-flash';

    // gemini-1.0-pro
    // gemini-1.5-flash
    // gemini-1.5-pro

    const API_KEY = "AIzaSyA9b9TyKyWlFPZeki8eX-p6jweZWt8f8gQ";

    // AIzaSyA9b9TyKyWlFPZeki8eX-p6jweZWt8f8gQ
    // AIzaSyARQT5WhstzZyjFL2LPWAPUmsj0qvg3fYQ - возможно не работает
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME});


    const generationConfig = {
        temperature: 0.5,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
    };

    // const safetySettings = [
    //     {
    //         category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    //         threshold: HarmBlockThreshold.BLOCK_NONE,
    //     },
    //     {
    //         category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    //         threshold: HarmBlockThreshold.BLOCK_NONE,
    //     },
    //     {
    //         category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    //         threshold: HarmBlockThreshold.BLOCK_NONE,
    //     },
    //     {
    //         category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    //         threshold: HarmBlockThreshold.BLOCK_NONE,
    //     },
    // ];
    let parts;

    if (storedCensor) {
        parts = [
            {text: "input: Приветик! Как у тебя дела?"},
            {text: "output: Все хорошо, друг. Как ты сам?"},
            {text: `input: ${userInput}`},
        ];
    } else {
        parts = [
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
    }
    console.log(parts)
    // const parts = [
    //     {text: "input: Заебал"},
    //     {text: "output: Эу, братишка, проще общайся"},
    //     {text: "input: Иди нахуй"},
    //     {text: "output: Сам иди, долбаеб"},
    //     {text: "input: Сгенерируй мне топовую пацанскую цитату"},
    //     {text: "output: Конечно, братан, вот:\n\"Выучить - не значит запомнить!\""},
    //     {text: "input: Сгенерируй мне интересную причину чтобы съебать"},
    //     {text: "output: Долбаеб? После второго не съебывают"},
    //     {text: "input: Сгенерируй мне причину уйти с кыргызского"},
    //     {text: "output: Уф, брат, нахуй кыргызский, вот причина:\nВетер дует восточнее"},
    //     {text: "input: Брат, найди пробей мне одного типа"},
    //     {text: "output: Все для тебя, родной https://arxiv.org/abs/2005.14165 "},
    //     {text: "input: Я дз нихуя не делал, как быть?"},
    //     {text: "output: Похуй + похуй. Спроси у училки, а сделала ли она дз? "},
    //     {text: `input: ${userInput}`},
    //   ];

    const imageParts = await Promise.all(
        images.map(fileToGenerativePart)
    );

    // const result = await model.generateContent([
    //     // {
    //     //     contents: [{ role: "user", parts }],
    //     //     generationConfig,
    //     //     safetySettings,
    //     // }
        
    //     userInput, ...imageParts
    // ]
    // );
    let result;

    images.length > 0 ? 
        result = await model.generateContent([userInput, ...imageParts])
        : 
        result = await model.generateContent({
            contents: [{ role: "user", parts }],
            generationConfig,
            safetySettings,
        });

    // const result = await model.generateContent({
    //     contents: [{ role: "user", parts }, ...imageParts],
    //     generationConfig,
    //     safetySettings, 
    //     // ...imageParts
    // });
    // const result = await model.generateContent([userInput, ...imageParts]);

        // {
        //     contents: [{ role: "user", parts }],
        //     generationConfig,
        //     safetySettings,
        // }
        
    // const result = await model.generateContent([prompt, ...imageParts]);
    const response = result.response;
    console.log(response.text());
    return [response.text(), false]
}
