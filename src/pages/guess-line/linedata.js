// [
//     {
//       "id": 1,
//       "name": "Горизонтально проецирующая линия",
//       "frontalProjection": [
//         { "x": 2, "y": 2 },
//         { "x": 8, "y": 2 }
//       ],
//       "horizontalProjection": [
//         { "x": 2, "y": 5 },
//         { "x": 8, "y": 7 }
//       ]
//     },
//     {
//       "id": 2,
//       "name": "Фронтально проецирующая линия",
//       "frontalProjection": [
//         { "x": 3, "y": 1 },
//         { "x": 3, "y": 7 }
//       ],
//       "horizontalProjection": [
//         { "x": 1, "y": 4 },
//         { "x": 5, "y": 4 }
//       ]
//     },
//     {
//       "id": 3,
//       "name": "Линия общего положения",
//       "frontalProjection": [
//         { "x": 1, "y": 1 },
//         { "x": 9, "y": 7 }
//       ],
//       "horizontalProjection": [
//         { "x": 1, "y": 3 },
//         { "x": 9, "y": 6 }
//       ]
//     },
//     {
//       "id": 4,
//       "name": "Горизонтальная линия уровня",
//       "frontalProjection": [
//         { "x": 2, "y": 4 },
//         { "x": 8, "y": 4 }
//       ],
//       "horizontalProjection": [
//         { "x": 2, "y": 3 },
//         { "x": 8, "y": 3 }
//       ]
//     },
//     {
//       "id": 5,
//       "name": "Фронтальная линия уровня",
//       "frontalProjection": [
//         { "x": 3, "y": 2 },
//         { "x": 3, "y": 8 }
//       ],
//       "horizontalProjection": [
//         { "x": 3, "y": 4 },
//         { "x": 3, "y": 4 }
//       ]
//     }
//   ]
const shapesData = [

    // ЛИНИИ

    {
      id: 1,
      name: "Горизонтальная линия уровня", // - | \
      frontalProjection: [
        { x: 2, y: 5 },
        { x: 8, y: 5 }
      ],
      horizontalProjection: [
        { x: 2, y: 3 },
        { x: 8, y: 6 }
      ]
    },
    {
      id: 2,
      name: "Фронтально проецирующая линия",   // * | \
      frontalProjection: [
        { x: 5, y: 5 },
      ],
      horizontalProjection: [
        { x: 5, y: 2 },
        { x: 5, y: 6 }
      ]
    },
    {
      id: 3,
      name: "Линия общего положения", // / | \
      frontalProjection: [
        { x: 1, y: 3 },
        { x: 9, y: 7 }
      ],
      horizontalProjection: [
        { x: 1, y: 7 },
        { x: 9, y: 3 }
      ]
    },
    {
      id: 4,
      name: "Фронтальная линия уровня",  //  ^ | -
      frontalProjection: [
        { x: 3, y: 5 },
        { x: 4, y: 4 },
        { x: 5, y: 3.5 },
        { x: 6, y: 3.2 },
        { x: 7, y: 3.5 },
        { x: 8, y: 4 },
        { x: 9, y: 5},
      ],
      horizontalProjection: [
        { x: 3, y: 5 },
        { x: 9, y: 5 }
      ]
    },
    {
      id: 5,
      name: "Горизонтально проецирующая линия", // | || *
      frontalProjection: [
        { x: 5, y: 3 },
        { x: 5, y: 7 }
      ],
      horizontalProjection: [
        { x: 5, y: 4 },
      ]
    },
    {
        id: 6,
        name: "Профильная линия уровня", // | || | 
        frontalProjection: [
          { x: 5, y: 3 },
          { x: 5, y: 7 }
        ],
        horizontalProjection: [
          { x: 5, y: 3 },
          { x: 5, y: 7 }
        ]
    },
    {
        id: 7,
        name: "Профильно проецирующая линия", // - || -
        frontalProjection: [
          { x: 4, y: 5 },
          { x: 9, y: 5 }
        ],
        horizontalProjection: [
          { x: 4, y: 5 },
          { x: 9, y: 5 }
        ]
    },


    // ПЛОСКОСТИ

    {
        id: 8,
        name: "Фронтально проецирующая плоскость", // \ || x
        frontalProjection: [
          { x: 4, y: 3 },
          { x: 9, y: 5 }
        ],
        horizontalProjection: [
          { x: 4, y: 3 },
          { x: 9, y: 5 },
          null,
          { x: 9, y: 3 },
          { x: 4, y: 5 },
        ]
    },
    {
        id: 9,
        name: "Фронтальная плоскость уровня", // = || -
        frontalProjection: [
          { x: 4, y: 3 },
          { x: 9, y: 3 },
          null,
          { x: 4, y: 6 },
          { x: 9, y: 6 },
        ],
        horizontalProjection: [
            { x: 4, y: 5 },
            { x: 9, y: 5 },

        ]
    },
    {
        id: 10,
        name: "Фронтальная плоскость уровня", // ELDAN || - - - - -
        frontalProjection: [
            // E
            { x: 2.5, y: 3 },
            { x: 1, y: 3 },
            { x: 1, y: 6 },
            { x: 2.5, y: 6 },
            null,
            { x: 1, y: 4.5 },
            { x: 2.5, y: 4.5 },
            null,

            // L
            { x: 3.5, y: 3 },
            { x: 3.5, y: 6 },
            { x: 5, y: 6 },
            null,

            // D
            { x: 6.3, y: 3 },
            { x: 6, y: 3 },
            { x: 6, y: 6 },
            { x: 6.3, y: 6 },
            { x: 7, y: 5.7 },
            { x: 7.5, y: 5 },
            { x: 7.5, y: 4 },
            { x: 7, y: 3.3 },
            { x: 6.3, y: 3 },
            null,

            // A
            { x: 8.5, y: 6 },
            { x: 9.25, y: 3 },
            { x: 10, y: 6 },
            null,
            { x: 8.75, y: 5 },
            { x: 9.75, y: 5 },
            null,

            //  N
            { x: 11, y: 6 },
            { x: 11, y: 3 },
            { x: 12.5, y: 6 },
            { x: 12.5, y: 3 },

        ],
        horizontalProjection: [
            // E
            { x: 1, y: 5 },
            { x: 2.5, y: 5 },
            null,

            // L
            { x: 3.5, y: 5 },
            { x: 5, y: 5 },
            null,

            // D
            { x: 6, y: 5 },
            { x: 7.5, y: 5 },
            null,

            // A
            { x: 8.5, y: 5 },
            { x: 10, y: 5 },
            null,

            // N
            { x: 11, y: 5 },
            { x: 12.5, y: 5 },
            null,

        ]
    },
    {
        id: 11,
        name: "Фронтально проецирующая плоскость", // = || -
        frontalProjection: [
          { x: 4, y: 3 },
          { x: 9, y: 5 },
        ],
        horizontalProjection: [
            { x: 4, y: 3 },
            { x: 9, y: 3 },
            null,
            { x: 4, y: 6 },
            { x: 9, y: 6 },

        ]
    },
    {
        id: 12,
        name: "Zа наших!", // = || -
        frontalProjection: [
          { x: 4, y: 3 },
          { x: 9, y: 3 },
          { x: 4, y: 6 },
          { x: 9, y: 6 },
        ],
        horizontalProjection: [
            { x: 4, y: 3 },
            { x: 6.5, y: 6 },
            { x: 9, y: 3 },

        ]
    },
    {
        id: 13,
        name: "Горизонтально проецирующая плоскость", // = || -
        frontalProjection: [
          { x: 4, y: 6 },
          { x: 6.5, y: 3 },
          { x: 9, y: 6 },
          { x: 4, y: 6 },
        ],
        horizontalProjection: [
            { x: 4, y: 3 },
            { x: 9, y: 5 },

        ]
    },
    {
        id: 14,
        name: "Горизонтальная плоскость уровня", // - || ^
        frontalProjection: [
          { x: 4, y: 5 },
          { x: 9, y: 5 },
        ],
        horizontalProjection: [
            { x: 4, y: 6 },
            { x: 4.5, y: 5 },
            { x: 5.5, y: 4.2 },

            { x: 6.5, y: 4 },

            { x: 7.5, y: 4.2 },
            { x: 8.5, y: 5 },
            { x: 9, y: 6 },

        ]
    },
    {
        id: 15,
        name: "Плоскость общего положения", // \ || \\
        frontalProjection: [
          { x: 4, y: 3 },
          { x: 9, y: 6 },
        ],
        horizontalProjection: [
            { x: 4, y: 2 },
            { x: 9, y: 5 },
            null,

            { x: 4, y: 4 },
            { x: 9, y: 7 },
        ]
    },
    {
        id: 16,
        name: "Плоскость общего положения", // \ || \\
        frontalProjection: [
          { x: 6, y: 7 },
          { x: 8, y: 7 },
          { x: 9.5, y: 5 },
          { x: 8, y: 3 },
          { x: 6, y: 3 },
          { x: 4.5, y: 5 },
          { x: 6, y: 7 },
        ],
        horizontalProjection: [
            { x: 6, y: 7 },
            { x: 8, y: 7 },
            { x: 9.5, y: 5 },
            { x: 8, y: 3 },
            { x: 6, y: 3 },
            { x: 4.5, y: 5 },
            { x: 6, y: 7 },
        ]
    },
  ];
export default shapesData