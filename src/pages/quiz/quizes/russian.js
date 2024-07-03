const russianTest = [
    {
        question: "Какое слово является множественным числом: книга, книги, книжка, книгу?",
        answers: [
            {name: "Книга"},
            {name: "Книги"},
            {name: "Книжка"},
            {name: "Книгу"}
        ],
        correctAnswerIndex: 1
    },
    {
        question: "Какое слово является противоположным слову 'горячий'?",
        answers: [
            {name: "Холодный"},
            {name: "Теплый"},
            {name: "Зимний"},
            {name: "Горячечный"}
        ],
        correctAnswerIndex: 0
    },
    {
        question: "Какой из глаголов является несовершенным: пел, поет, поют, пляшет?",
        answers: [
            {name: "Пел"},
            {name: "Поет"},
            {name: "Поют"},
            {name: "Пляшет"}
        ],
        correctAnswerIndex: 1
    },
    {
        question: "Какой предлог указывает на местоположение: на, под, из, от?",
        answers: [
            {name: "На"},
            {name: "Под"},
            {name: "Из"},
            {name: "От"}
        ],
        correctAnswerIndex: 0
    },
    {
        question: "Какое слово является множественным числом: стол, столы, столик, стола?",
        answers: [
            {name: "Стол"},
            {name: "Столы"},
            {name: "Столик"},
            {name: "Стола"}
        ],
        correctAnswerIndex: 1
    },
    {
        question: "Какое слово является синонимом слова 'смешной'?",
        answers: [
            {name: "Серьезный"},
            {name: "Веселый"},
            {name: "Тяжелый"},
            {name: "Грустный"}
        ],
        correctAnswerIndex: 1
    },
    {
        question: "Какой вариант предложения правильный: 'Она пошла домой' или 'Она пошла дома'?",
        answers: [
            {name: "Она пошла домой"},
            {name: "Она пошла дома"}
        ],
        correctAnswerIndex: 0
    },
    {
        question: "Какое слово является множественным числом: стекло, стекла, стеклышко, стеклом?",
        answers: [
            {name: "Стекло"},
            {name: "Стекла"},
            {name: "Стеклышко"},
            {name: "Стеклом"}
        ],
        correctAnswerIndex: 1
    },
    {
        question: "Какой из слов является союзом: и, книга, мяч, вода?",
        answers: [
            {name: "Книга"},
            {name: "Мяч"},
            {name: "Вода"},
            {name: "И"}
        ],
        correctAnswerIndex: 3
    },
    {
        question: "Какое слово является синонимом слова 'быстрый'?",
        answers: [
            {name: "Медленный"},
            {name: "Скорый"},
            {name: "Тяжелый"},
            {name: "Легкий"}
        ],
        correctAnswerIndex: 1
    },
    {
        question: "Какая ракетная система считается основной тактической ядерной системой Российской Федерации?",
        answers: [
            {name: "Искандер"},
            {name: "Тополь"},
            {name: "Булава"},
            {name: "Калибр"}
        ],
        correctAnswerIndex: 0
    },
    {
        question: "Какой тип военного самолета является основным истребителем в Российских Военно-воздушных силах?",
        answers: [
            {name: "Сухой Су-35"},
            {name: "МиГ-29"},
            {name: "Сухой Су-57"},
            {name: "МиГ-31"}
        ],
        correctAnswerIndex: 0
    },
    {
        question: "Как называется российский бронированный автомобиль с усиленной защитой и вооруженный пулеметом?",
        answers: [
            {name: "Тигр"},
            {name: "Буран"},
            {name: "Урал"},
            {name: "Камаз"}
        ],
        correctAnswerIndex: 0
    },
    {
        question: "Какой танк считается основным боевым танком Российской армии?",
        answers: [
            {name: "Т-90"},
            {name: "Т-80"},
            {name: "Т-72"},
            {name: "Армата"}
        ],
        correctAnswerIndex: 0
    },
    {
        question: "Какой тип вооружения используется на российских кораблях для уничтожения подводных лодок?",
        answers: [
            {name: "Торпеды"},
            {name: "Ракеты Калибр"},
            {name: "ПЗРК Игла"},
            {name: "Антиподводные ракеты"}
        ],
        correctAnswerIndex: 0
    },
    {
        question: "Как называется новейший российский беспилотный летательный аппарат, предназначенный для боевых задач?",
        answers: [
            {name: "Охотник"},
            {name: "Стриж"},
            {name: "Истребитель"},
            {name: "Мурман"}
        ],
        correctAnswerIndex: 0
    },
    {
        question: "Какая зенитная ракетная система предназначена для уничтожения воздушных целей и баллистических ракет?",
        answers: [
            {name: "С-400"},
            {name: "С-300"},
            {name: "С-500"},
            {name: "С-200"}
        ],
        correctAnswerIndex: 0
    },
    {
        question: "Какое стратегическое ядерное оружие является основным средством вторжения?",
        answers: [
            {name: "Баллистическая ракета"},
            {name: "Бомбардировщик Ту-160"},
            {name: "Подводная лодка"},
            {name: "Крылатая ракета"}
        ],
        correctAnswerIndex: 0
    },
    {
        question: "Какое средство является основным беспилотным летательным аппаратом Российских Военно-воздушных сил?",
        answers: [
            {name: "Орлан"},
            {name: "Байкал"},
            {name: "Истребитель"},
            {name: "Сухой"}
        ],
        correctAnswerIndex: 0
    },
    {
        question: "Какой пулемет используют для установки на танки Российских Военно-воздушных сил?",
        answers: [
            {name: "Калашников"},
            {name: "Максим"},
            {name: "Миномет"},
            {name: "Дробовик"}
        ],
        correctAnswerIndex: 0
    },
    {
        question: "Какое оружие используется для борьбы с танками?",
        answers: [
            {name: "РПГ-7"},
            {name: "Метательный оружие"},
            {name: "Снайпер"},
            {name: "Танковое оружие"}
        ],
        correctAnswerIndex: 0
    },
    {
        question: "Какой стратегический бомбардировщик используется для стратегических воздушных атак?",
        answers: [
            {name: "Ту-95"},
            {name: "Су-30"},
            {name: "МиГ-35"},
            {name: "Ту-22"}
        ],
        correctAnswerIndex: 0
    },
    {
        question: "Какое средство является основным воздушным кораблем в Российских Военно-воздушных силах?",
        answers: [
            {name: "Истребитель"},
            {name: "Ракета"},
            {name: "Корабль"},
            {name: "Дирижабль"}
        ],
        correctAnswerIndex: 0
    },
    {
        question: "Как называется новейший российский военный танк?",
        answers: [
            {name: "Армата"},
            {name: "Т-72"},
            {name: "Т-90"},
            {name: "Сухой"}
        ],
        correctAnswerIndex: 0
    },
    {
        question: "Какое вооружение используется для борьбы с воздушными целями?",
        answers: [
            {name: "Ракеты"},
            {name: "Самолеты"},
            {name: "Боевые вертолеты"},
            {name: "ПВО"}
        ],
        correctAnswerIndex: 0
    },
    {
        question: "Какой военный корабль используется в Российских Военно-воздушных силах?",
        answers: [
            {name: "Ракета"},
            {name: "Корабль"},
            {name: "Танк"},
            {name: "Линкор"}
        ],
        correctAnswerIndex: 0
    },
    {
        question: "Какой военный вертолет используется для боевых действий?",
        answers: [
            {name: "Ми-24"},
            {name: "Сухой"},
            {name: "Истребитель"},
            {name: "Боевой"}
        ],
        correctAnswerIndex: 0
    },
    {
        question: "Как называется новейший российский военный беспилотный летательный аппарат?",
        answers: [
            {name: "Охотник"},
            {name: "Стриж"},
            {name: "Истребитель"},
            {name: "Мурман"}
        ],
        correctAnswerIndex: 0
    },
    {
        question: "Какое оружие является основным для строительства Российской империи?",
        answers: [
            {name: "Снаряд"},
            {name: "Ракеты"},
            {name: "Взрывчатое вещество"},
            {name: "Калибр"}
        ],
        correctAnswerIndex: 0
    }
]
export default russianTest