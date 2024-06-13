const timetable = [
    {
        day: 'ПН',
        lessons:[
            {name: 'ЧиО', time: '08:00 - 08:45', room: '102', category: 'humanitarian'},
            {name: 'Английский язык', time: '08:55 - 09:40', room: '', category: 'language'},
            {name: 'История', time: '09:50 - 10:35', room: '404', category: 'humanitarian'},
            {name: 'Физкультура', time: '10:45 - 11:30', room: '', category: 'humanitarian'},
            {name: 'Кыргызский язык', time: '11:35 - 12:20', room: '', category: 'language'},
            {name: 'Алгебра', time: '12:25 - 13:05', room: '402', category: 'math'},
            {name: 'Геометрия', time: '13:10 - 13:55', room: '402', category: 'math'},
        ],
    },
    {
        day: 'ВТ',
        lessons:[
            {name: '', time: '08:00 - 08:45', room: '', category: 'humanitarian'},
            {name: 'Кыргызский язык', time: '08:55 - 09:40', room: '', category: 'language'},
            {name: 'Физика', time: '09:50 - 10:35', room: '402', category: 'math'},
            {name: 'Физика', time: '10:45 - 11:30', room: '402', category: 'math'},
            {name: 'Английский язык', time: '11:35 - 12:20', room: '', category: 'language'},
            {name: 'Английский язык', time: '12:25 - 13:05', room: '', category: 'language'},
            {name: 'Литература', time: '13:10 - 13:55', room: '203', category: 'language'},
        ],
    },
    {
        day: 'СР',
        lessons:[
            {name: 'Адабият', time: '08:00 - 08:40', room: '14', category: 'language'},
            {name: 'Химия', time: '08:45 - 09:40', room: '206', category: 'math'},
            {name: 'Классный час', time: '09:50 - 10:35', room: '', category: 'humanitarian'},
            {name: 'География', time: '10:45 - 11:30', room: '204', category: 'humanitarian'},
            {name: 'Биология', time: '11:35 - 12:20', room: '407', category: 'humanitarian'},
            {name: 'Русский язык', time: '12:25 - 13:05', room: '203', category: 'language'},
            {name: 'Литература', time: '13:10 - 13:55', room: '203', category: 'language'},
            {name: 'Английский язык', time: '13:10 - 13:55', room: '', category: 'language'},
        ],
    },
    {
        day: 'ЧТ',
        lessons:[
            {name: 'Английский язык', time: '08:00 - 08:45', room: '', category: 'language'},
            {name: 'Кыргызский язык', time: '08:55 - 09:40', room: '', category: 'language'},
            {name: 'Алгебра', time: '09:50 - 10:35', room: '402', category: 'math'},
            {name: 'Физика', time: '10:45 - 11:30', room: '404', category: 'math'},
            {name: 'Физкультура', time: '11:35 - 12:20', room: '', category: 'language'},
            {name: 'ДП', time: '12:25 - 13:05', room: '', category: 'humanitarian'},
            {name: 'ДП', time: '13:10 - 13:55', room: '', category: 'humanitarian'},
        ],
    },
    {
        day: 'ПТ',
        lessons:[
            {name: 'Английский язык', time: '08:00 - 08:45', room: '', category: 'language'},
            {name: 'История', time: '08:55 - 09:40', room: '404', category: 'humanitarian'},
            {name: 'Алгебра', time: '09:50 - 10:35', room: '402', category: 'math'},
            {name: 'Кыргызский язык', time: '10:45 - 11:30', room: '', category: 'language'},
            {name: 'Химия', time: '11:35 - 12:20', room: '205', category: 'math'},
            {name: 'Русский язык', time: '12:25 - 13:05', room: '203', category: 'language'},
            {name: 'Литература', time: '13:10 - 13:55', room: '203', category: 'language'},
        ],
    },
    
];


export default timetable;
