const items = [  
    {
        category: 'genery',
        img: '/genery/src/pages/shop/images/genery/cover.png',
        textImg: '/genery/src/pages/shop/images/genery/text-img.png',
        items: [
            {   
                id: "genery",
                img: '/genery/src/pages/shop/images/genery/img-1.png',
                name: 'Стандарт',
                label: 'лето',
                labelTextColor: 'var(--text-first-color)',
                labelColor: 'green',
                isFree: false,
                price: 3000,
            },
            {
                id:'summer',
                img: '',
                name: 'Стандарт',
                label: '1 год вместе',
                labelTextColor: 'var(--text-first-color)',
                labelColor: 'linear-gradient(90deg, #2400FF 1%, #00C2FF 100%)',
                isFree: true,
                price: 0,
            },
        ]
    },
];


export default items;
