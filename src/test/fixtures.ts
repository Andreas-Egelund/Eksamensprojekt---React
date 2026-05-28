export const races = [
  {
    season: '2026',
    round: '1',
    raceName: 'Australian Grand Prix',
    Circuit: {
      circuitId: 'albert_park',
      circuitName: 'Albert Park Grand Prix Circuit',
      Location: {
        locality: 'Melbourne',
        country: 'Australia',
        lat: '-37.8497',
        long: '144.968',
      },
    },
    date: '2026-03-08',
    time: '04:00:00Z',
  },
  {
    season: '2026',
    round: '2',
    raceName: 'Monaco Grand Prix',
    Circuit: {
      circuitId: 'monaco',
      circuitName: 'Circuit de Monaco',
      Location: {
        locality: 'Monte Carlo',
        country: 'Monaco',
        lat: '43.7347',
        long: '7.42056',
      },
    },
    date: '2026-05-24',
    time: '13:00:00Z',
  },
];

export const driverStandings = [
  {
    position: '1',
    positionText: '1',
    points: '141',
    wins: '4',
    Driver: {
      driverId: 'max_verstappen',
      code: 'VER',
      givenName: 'Max',
      familyName: 'Verstappen',
      nationality: 'Dutch',
    },
    Constructors: [
      {
        constructorId: 'red_bull',
        name: 'Red Bull Racing',
        nationality: 'Austrian',
      },
    ],
  },
  {
    position: '2',
    positionText: '2',
    points: '131',
    wins: '2',
    Driver: {
      driverId: 'lando_norris',
      code: 'NOR',
      givenName: 'Lando',
      familyName: 'Norris',
      nationality: 'British',
    },
    Constructors: [
      {
        constructorId: 'mclaren',
        name: 'McLaren',
        nationality: 'British',
      },
    ],
  },
  {
    position: '3',
    positionText: '3',
    points: '109',
    wins: '1',
    Driver: {
      driverId: 'charles_leclerc',
      code: 'LEC',
      givenName: 'Charles',
      familyName: 'Leclerc',
      nationality: 'Monegasque',
    },
    Constructors: [
      {
        constructorId: 'ferrari',
        name: 'Ferrari',
        nationality: 'Italian',
      },
    ],
  },
];

export const constructorStandings = [
  {
    position: '1',
    positionText: '1',
    points: '248',
    wins: '3',
    Constructor: {
      constructorId: 'mclaren',
      name: 'McLaren',
      nationality: 'British',
    },
  },
  {
    position: '2',
    positionText: '2',
    points: '225',
    wins: '4',
    Constructor: {
      constructorId: 'red_bull',
      name: 'Red Bull Racing',
      nationality: 'Austrian',
    },
  },
];

export const australianResult = {
  ...races[0],
  Results: [
    {
      number: '4',
      position: '1',
      positionText: '1',
      points: '25',
      grid: '2',
      laps: '58',
      status: 'Finished',
      Time: { time: '1:30:42.123' },
      Driver: {
        driverId: 'lando_norris',
        code: 'NOR',
        givenName: 'Lando',
        familyName: 'Norris',
      },
      Constructor: {
        constructorId: 'mclaren',
        name: 'McLaren',
      },
    },
    {
      number: '81',
      position: '2',
      positionText: '2',
      points: '18',
      grid: '1',
      laps: '58',
      status: 'Finished',
      Time: { time: '+4.201' },
      Driver: {
        driverId: 'oscar_piastri',
        code: 'PIA',
        givenName: 'Oscar',
        familyName: 'Piastri',
      },
      Constructor: {
        constructorId: 'mclaren',
        name: 'McLaren',
      },
    },
    {
      number: '1',
      position: '3',
      positionText: '3',
      points: '15',
      grid: '3',
      laps: '58',
      status: 'Finished',
      Time: { time: '+8.913' },
      Driver: {
        driverId: 'max_verstappen',
        code: 'VER',
        givenName: 'Max',
        familyName: 'Verstappen',
      },
      Constructor: {
        constructorId: 'red_bull',
        name: 'Red Bull Racing',
      },
    },
  ],
};
