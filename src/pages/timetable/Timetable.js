
const timetable = [
    {
        day: 'ПН',
        lessons:[
            {name: 'ЧиО', time: '08:00 - 08:45', room: '102', color: 'humanitarian'},
            {name: 'Английский язык', time: '08:55 - 09:40', room: '', color: 'language'},
            {name: 'История', time: '09:50 - 10:35', room: '404', color: 'humanitarian'},
            {name: 'Физкультура', time: '10:45 - 11:30', room: '', color: 'humanitarian'},
            {name: 'Кыргызский язык', time: '11:35 - 12:20', room: '', color: 'language'},
            {name: 'Алгебра', time: '12:25 - 13:05', room: '402', color: 'math'},
            {name: 'Геометрия', time: '13:10 - 13:55', room: '402', color: 'math'},
        ],
    },
    {
        day: 'ВТ',
        lessons:[
            {name: '', time: '08:00 - 08:45', room: '', color: 'humanitarian'},
            {name: 'Кыргызский язык', time: '08:55 - 09:40', room: '', color: 'green'},
            {name: 'Физика', time: '09:50 - 10:35', room: '402', color: 'math'},
            {name: 'Физика', time: '10:45 - 11:30', room: '402', color: 'math'},
            {name: 'Английский язык', time: '11:35 - 12:20', room: '', color: 'language'},
            {name: 'Английский язык', time: '12:25 - 13:05', room: '', color: 'language'},
            {name: 'Литература', time: '13:10 - 13:55', room: '203', color: 'language'},
        ],
    },
    {
        day: 'СР',
        lessons:[
            {name: 'Адабият', time: '08:00 - 08:40', room: '14', color: 'language'},
            {name: 'Химия', time: '08:45 - 09:40', room: '206', color: 'math'},
            {name: 'Классный час', time: '09:50 - 10:35', room: '', color: 'humanitarian'},
            {name: 'География', time: '10:45 - 11:30', room: '204', color: 'humanitarian'},
            {name: 'Биология', time: '11:35 - 12:20', room: '407', color: 'humanitarian'},
            {name: 'Русский язык', time: '12:25 - 13:05', room: '203', color: 'language'},
            {name: 'Литература', time: '13:10 - 13:55', room: '203', color: 'language'},
            {name: 'Английский язык', time: '13:10 - 13:55', room: '', color: 'language'},
        ],
    },
    {
        day: 'ЧТ',
        lessons:[
            {name: 'Английский язык', time: '08:00 - 08:45', room: '', color: 'language'},
            {name: 'Кыргызский язык', time: '08:55 - 09:40', room: '', color: 'language'},
            {name: 'Алгебра', time: '09:50 - 10:35', room: '402', color: 'math'},
            {name: 'Физика', time: '10:45 - 11:30', room: '404', color: 'math'},
            {name: 'Физкультура', time: '11:35 - 12:20', room: '', color: 'language'},
            {name: 'ДП', time: '12:25 - 13:05', room: '', color: 'humanitarian'},
            {name: 'ДП', time: '13:10 - 13:55', room: '', color: 'humanitarian'},
        ],
    },
    {
        day: 'ПТ',
        lessons:[
            {name: 'Английский язык', time: '08:00 - 08:45', room: '', color: 'language'},
            {name: 'История', time: '08:55 - 09:40', room: '404', color: 'humanitarian'},
            {name: 'Алгебра', time: '09:50 - 10:35', room: '402', color: 'math'},
            {name: 'Кыргызский язык', time: '10:45 - 11:30', room: '', color: 'language'},
            {name: 'Химия', time: '11:35 - 12:20', room: '205', color: 'math'},
            {name: 'Русский язык', time: '12:25 - 13:05', room: '203', color: 'language'},
            {name: 'Литература', time: '13:10 - 13:55', room: '203', color: 'language'},
        ],
    },
    
];


export default timetable;
