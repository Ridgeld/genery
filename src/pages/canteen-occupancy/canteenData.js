export const DEFAULT_CANTEEN_DATA = {
  capacity: 120,
  occupied: 68,
  quieterIn: '~25 мин',
  days: [
    {
      id: 'mon',
      name: 'Понедельник',
      short: 'Пн',
      peakTime: '13:00',
      peakPeople: 108,
      avgPeople: 57,
      bestHours: 'до 11:30, после 14:30',
      hourlyData: [
        { time: '08:00', people: 22 },
        { time: '09:00', people: 45 },
        { time: '10:00', people: 38 },
        { time: '11:00', people: 62 },
        { time: '12:00', people: 98 },
        { time: '13:00', people: 108 },
        { time: '14:00', people: 74 },
        { time: '15:00', people: 48 },
        { time: '16:00', people: 32 },
        { time: '17:00', people: 24 },
        { time: '18:00', people: 12 }
      ]
    },
    {
      id: 'tue',
      name: 'Вторник',
      short: 'Вт',
      peakTime: '13:00',
      peakPeople: 115,
      avgPeople: 62,
      bestHours: 'до 11:15, после 14:45',
      hourlyData: [
        { time: '08:00', people: 28 },
        { time: '09:00', people: 52 },
        { time: '10:00', people: 44 },
        { time: '11:00', people: 70 },
        { time: '12:00', people: 105 },
        { time: '13:00', people: 115 },
        { time: '14:00', people: 80 },
        { time: '15:00', people: 50 },
        { time: '16:00', people: 36 },
        { time: '17:00', people: 26 },
        { time: '18:00', people: 15 }
      ]
    },
    {
      id: 'wed',
      name: 'Среда',
      short: 'Ср',
      peakTime: '12:00',
      peakPeople: 112,
      avgPeople: 60,
      bestHours: 'до 11:30, после 14:30',
      hourlyData: [
        { time: '08:00', people: 30 },
        { time: '09:00', people: 50 },
        { time: '10:00', people: 46 },
        { time: '11:00', people: 75 },
        { time: '12:00', people: 112 },
        { time: '13:00', people: 102 },
        { time: '14:00', people: 78 },
        { time: '15:00', people: 45 },
        { time: '16:00', people: 30 },
        { time: '17:00', people: 22 },
        { time: '18:00', people: 10 }
      ]
    },
    {
      id: 'thu',
      name: 'Четверг',
      short: 'Чт',
      peakTime: '13:00',
      peakPeople: 110,
      avgPeople: 58,
      bestHours: 'до 11:30, после 14:30',
      hourlyData: [
        { time: '08:00', people: 25 },
        { time: '09:00', people: 48 },
        { time: '10:00', people: 42 },
        { time: '11:00', people: 68 },
        { time: '12:00', people: 100 },
        { time: '13:00', people: 110 },
        { time: '14:00', people: 76 },
        { time: '15:00', people: 46 },
        { time: '16:00', people: 34 },
        { time: '17:00', people: 25 },
        { time: '18:00', people: 14 }
      ]
    },
    {
      id: 'fri',
      name: 'Пятница',
      short: 'Пт',
      peakTime: '12:00',
      peakPeople: 104,
      avgPeople: 51,
      bestHours: 'до 11:30, после 14:00',
      hourlyData: [
        { time: '08:00', people: 20 },
        { time: '09:00', people: 42 },
        { time: '10:00', people: 36 },
        { time: '11:00', people: 65 },
        { time: '12:00', people: 104 },
        { time: '13:00', people: 95 },
        { time: '14:00', people: 60 },
        { time: '15:00', people: 35 },
        { time: '16:00', people: 22 },
        { time: '17:00', people: 15 },
        { time: '18:00', people: 8 }
      ]
    },
    {
      id: 'sat',
      name: 'Суббота',
      short: 'Сб',
      peakTime: '12:00',
      peakPeople: 58,
      avgPeople: 29,
      bestHours: 'в течение всего дня',
      hourlyData: [
        { time: '08:00', people: 10 },
        { time: '09:00', people: 18 },
        { time: '10:00', people: 25 },
        { time: '11:00', people: 42 },
        { time: '12:00', people: 58 },
        { time: '13:00', people: 52 },
        { time: '14:00', people: 38 },
        { time: '15:00', people: 22 },
        { time: '16:00', people: 14 },
        { time: '17:00', people: 8 },
        { time: '18:00', people: 4 }
      ]
    }
  ]
};
