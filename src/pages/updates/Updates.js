const updates = [
    {
        data: '25.05.2025',
        update: 'Добавлено 2 новых набора для покупки в магазине',
    },
    {
        data: '07.05.2025',
        corrections: 'Исправлен выход в меню из игр. Исправлено баг со стилем текста в игровом меню',
    },
    {
        data: '24.04.2025',
        update: 'Возвращен легендарный генератор цитат. Добавлено отображение всех цитат',
    },
    {
        data: '01.04.2025',
        update: 'Добавлена система чатов. Чат можно начать с любым человеком или создать групповой чат через настройки сообшества',
    },
    {
        data: '27.03.2025',
        update: 'Добавлена возможность сброса и восстановления пароля по email. Добавлена возможность скачать приложение. Добавлена возможность удалять комментарии',
        corrections: 'Изменен размер отображения картинок в режиме показа картинки. Изменено отображение комментариев. Изменено отображение тэга в ответе на комментарий'
    },
    {
        data: '25.03.2025',
        update: 'Добавлена возможность оставлять комментарии и делиться публикациями'
    },
    {
        data: '23.03.2025',
        update: 'Добавлена игра "Угадай линию"'
    },
    {
        data: '19.01.2025',
        corrections: 'Исправлен цвет иконок на светлых цветах'
    },
    {
        data: '16.01.2025',
        update: 'Добавлена возможность просмотра профилей пользователей. Добавлена возможность подписки на пользователей. Добавлено отображение подписчиков. Добавлено отображение дат в расписании. Добавлено отображение количество лайков в постах.',
        corrections: 'Цвет иконок на карточке урока теперь зависит от фонового цвета.'
    },
    {
        data: '31.08.2024',
        update: 'Добавлена новая категория товаров: "Родина"',
    },
    {
        data: '29.08.2024',
        update: 'Добавлен отображение повестки в военкомат после игры в тест',
    },
    {
        data: '19.08.2024',
        update: 'Добавлена возможность скачивать картинки в окне просмотра фотографии. Добавлена возможность создавать группы. Добавлена возможность загружать файлы, создавать расписание и делать публикации в своей группе. Добавлен раздел основной группы в меню навигации.',
        corrections: 'Изменен внешний вид публикаций.'
    },
    {
        data: '03.07.2024',
        update: 'Добавлена новая игра - тест минутка.',
    },
    {
        data: '29.06.2024',
        update: 'Добавлена система промокодов.',
        corrections: 'Исправлена возможность случайного клика на текст "Баланс"'
    },
    {
        data: '27.06.2024',
        update: 'Добавлена новая игра: GCOIN TAP.\nДобавлена новая игра: Ракетка.',
        corrections: 'Изменена высота расположения панели смайлов при загруженных изображения.'
    },
    {
        data: '25.06.2024',
        update: 'Добавлена стартовая страница.\nДобавлена система входа и регистрации.\nОбновлены все меню.\nДобавлена возможность отправлять фотографии и смайлы в чат.\nДобавлена система цензуры(по умолчанию включена).\nДобавлена система публикаций.\nДобавлена возможность публиковать до 5 фотографий и сколько угодно текста.\nДобавлена система монет(несгораемая сумма состовляет 1000 монет).\nДобавлена возможность заработать монеты в казино.\nДобавлена система магазина.\nДобавлена возможность покупки тем, цветов для обложки профиля, смайлов\nДобавлена возможность смены темы.\nДобавлена страница профиля.\nДобавлена система аватаров(по умполчанию выбирается рандомно)\nПоявилась возмножность изменить имя, описание, аватар и цвет обложки\nДобавлена возможность посмотреть фотографии в исходном размере(для этого необходими кликнуть на неё).\nДобавлена система эмодзи(по умолчанию доступны стандартные, но дополнительные можно купить в магазине.\nВ обновления добавлен раздел "Исправления".',
        corrections: 'Сумма выигрыша теперь зависит от коэффициента.\nИзменилась система подсчета выигрыша в казино(если вы точно угадали число, то +400 монет, если угадали один из параметров числа: odd/even, red/black, 1-18/19-36 - то за каждое совпадание +100 монет.'
    },
    {
        data: '14.02.2024',
        update: 'Добавлено 2 новые игры.\nДобавлено 5 новых цитат.\nДобавлено 5 новых причин.\nДобавлены новые функции в публикации.\nДобавлена сортировка по датам в запросы.',
        corrections: 'Обновлено расписание уроков.\nЗаменена иконка выхода в меню в играх.'
    },
    {
        data: '21.01.2024',
        update: 'Добавлена новая стартовая страница.\nДобавлено новое меню навигации.',
        corrections: 'Исправлен выход меню из игры.\nЗаменена иконка выхода в меню в играх.'
    },
    {
        data: '19.12.2023',
        update: 'Новая игра - пианино.\nДобавлены звуки: при проирыше, при победе.\nДобавлен сезонный приз - зеленая змея.\nДобавлен новогодний стартовый экран.',
    },
    {
        data: '11.12.2023',
        update: 'Новая игра - 2048',
    },
    {
        data: '04.12.2023',
        update: 'Новая игра - тетрис',
    },
    {
        data: '03.12.2023',
        update: 'Добавлена генерация полезных цитат для Вашего развития',
    },
    {
        data: '02.12.2023',
        update: 'Добавлена новая страница с фотографиями.\nДобавлены интерактивные элементы.',
    },
    {
        data: '11.11.2023',
        update: 'Добавлено 2 новые игры.',
        corrections: 'Внесены правки в игру змейка.'
    },
    {
        data: '28.10.2023',
        update: 'Обновлен дизайн сайта.\nИзменена система генерации причин и цитат.\nДобавлено 20 новых цитат.\nДобавлено 10 новых причин.',
        corrections: 'Удалена генерация оскорблений.\nНазвание сайта изменено на GENERY.\nИзменена механика игр.\nИзменена система подбора культурных слов.\nИзменена система отображения расписания.\nИзменено меню выбора игр.\nИзменена система подсчета кешбэка.\nОбновлена система уведломений.\nИзменена система загрузки файлов.'
    },
    {
        data: '29.09.2023',
        update: 'Добавлено две новых цитаты.\nИсправлены ошибки в тексте.',
        corrections: 'Правки кода.'
    },
    {
        data: '04.09.2023',
        update: 'Добавлено актуальное расписание уроков.\nДобавлено 5 новых причин.\nДобавлено 100 новых профессий.\nДобавлена версия для ПК.\nДобавлена новая игра.',
        corrections: 'Изменена система отображения обновлений.'
    },
    {
        data: '01.08.2023',
        update: 'Добавлено 2 игры.\nДобавлен раздел с играми.',
        corrections: 'Правки кода.'
    },
    {
        data: '19.07.2023',
        update: 'Полностью обновлен дизайн.\nДобавлен раздел связи с разработчиком.\nДобавлена динамическая загрузка расписания.\nДобавлен стартовый экран.',
    },
    {
        data: '15.07.2023',
        update: 'Добавлены новые культурные версии для матов.\nДобавлен раздел с загрузками.',
        corrections: 'Заменена иконка раздела оскорблений.'
    },
    {
        data: '30.06.2023',
        update: 'Добавлен раздел подбора культурных слов к матам.\nДобавлен раздел генерации профессий.',
        corrections: 'Название сайта изменено на "Мега генератор"'
    },
    {
        data: '11.06.2023',
        update: 'Добавлен раздел генерации оскорблений.\nЧисло пацанских цитат составляет 70.',
    },
    {
        data: '02.06.2023',
        update: 'Сайт снова работает.\nДобавлено 100 новых пацанских цитат.',
    },
    {
        data: '05.05.2023',
        update: 'Удален раздел с анекдотами.\nДобавлен раздел регистрации и входа в аккаунт.\nДобавлено 5 новых цитат.',
    },
    {
        data: '03.05.2023',
        corrections: 'Сайт перенес на другой хостинг\nСмена темы больше не доступна.\nПричины идти на урок больше не доступны.'
    },
    {
        data: '01.05.2023',
        update: 'Добавлено 5 новых причин не идти на урок.\nДобавлен раздел подсчета выигрыша на ставках',
    },
    {
        data: '30.04.2023',
        update: 'Добавлен функционал к разделу с расписанием.',
    },
    {
        data: '30.04.2023',
        update: 'Добавлено новое меню.\nДобавлен раздел с расписанием уроков.',
        corrections: 'Раздел обновлений перенесен в новое меню.'
    },
    {
        data: '28.04.2023',
        update: 'Добавлен раздел великих цитат.\nДобавлено более 30 самых крутых цитат и случаев.',
        corrections: 'Цитаты разделены на две группы: с матами, и без них.'
    },
    {
        data: '28.04.2023',
        update: 'Ведется разработка новых разделов.',
        corrections: 'Кнопка смены темы теперь закреплена при прокрутке.'
    },
    {
        data: '28.04.2023',
        update: 'Ведется разработка новых разделов.',
        corrections: 'Кнопка смены темы теперь закреплена при прокрутке.'
    },
    {
        data: '28.04.2023',
        update: 'Добавлено меню для переключения страниц в нижней части экрана.\nДобавлены разделы: обновлений, анекдотов, причин.\nУвеличино разрешение иконок.',
    },
    {
        data: '26.04.2023',
        update: 'Добавлена возможность изменить цветовую тему сайта.\nДобавлено изменение генерации причин при смене темы.',
    },
    {
        data: '26.04.2023',
        update: 'Добавлена страница генерации причин\nУвеличено количество причин идти/не идти на урок.',
    },
    {
        data: '26.04.2023',
        update: 'Запущен сайт для генерации причин не идти на урок.\nДобавлено 36 причин не идти на урок.',
    },
]
export default updates