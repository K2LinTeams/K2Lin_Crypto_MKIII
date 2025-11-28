export type OperatorTheme = 'Rhodes Island' | 'Rhine Lab' | 'Victoria' | 'Penguin Logistics' | 'Abyssal' | 'Kjerag' | 'Kazimierz' | 'Yan';

export interface Operator {
  name: string;
  theme: OperatorTheme;
  icon: string;
}

export const OPERATORS: Operator[] = [
  // Rhine Lab
  { name: 'Muelsyse', theme: 'Rhine Lab', icon: 'Droplets' },
  { name: 'Saria', theme: 'Rhine Lab', icon: 'SquareActivity' },
  { name: 'Ifrit', theme: 'Rhine Lab', icon: 'Flame' },
  { name: 'Silence', theme: 'Rhine Lab', icon: 'Feather' },
  { name: 'Magallan', theme: 'Rhine Lab', icon: 'Rocket' },
  { name: 'Dorothy', theme: 'Rhine Lab', icon: 'Atom' },

  // Victoria
  { name: 'Saileach', theme: 'Victoria', icon: 'Flag' },
  { name: 'Bagpipe', theme: 'Victoria', icon: 'Hammer' },
  { name: 'Horn', theme: 'Victoria', icon: 'Target' },
  { name: 'Reed', theme: 'Victoria', icon: 'Flame' },
  { name: 'Goldenglow', theme: 'Victoria', icon: 'Zap' },

  // Penguin Logistics
  { name: 'Exusiai', theme: 'Penguin Logistics', icon: 'Crosshair' },
  { name: 'Texas', theme: 'Penguin Logistics', icon: 'Swords' },
  { name: 'Mostima', theme: 'Penguin Logistics', icon: 'Clock' },
  { name: 'Sora', theme: 'Penguin Logistics', icon: 'Mic' },
  { name: 'Croissant', theme: 'Penguin Logistics', icon: 'CircleDollarSign' },

  // Abyssal Hunters
  { name: 'Skadi', theme: 'Abyssal', icon: 'Anchor' },
  { name: 'Specter', theme: 'Abyssal', icon: 'Scissors' },
  { name: 'Gladiia', theme: 'Abyssal', icon: 'Anchor' },
  { name: 'Ulpianus', theme: 'Abyssal', icon: 'Anchor' },

  // Kjerag
  { name: 'SilverAsh', theme: 'Kjerag', icon: 'Snowflake' },
  { name: 'Pramanix', theme: 'Kjerag', icon: 'Bell' },
  { name: 'Gnosis', theme: 'Kjerag', icon: 'Snowflake' },

  // Kazimierz
  { name: 'Nearl', theme: 'Kazimierz', icon: 'Sun' },
  { name: 'Mlynar', theme: 'Kazimierz', icon: 'Newspaper' },
  { name: 'Nightingale', theme: 'Kazimierz', icon: 'Bird' },
  { name: 'Shining', theme: 'Kazimierz', icon: 'Sparkles' },

  // Yan / Sui
  { name: 'Ch\'en', theme: 'Yan', icon: 'Sword' },
  { name: 'Ling', theme: 'Yan', icon: 'Wine' },
  { name: 'Dusk', theme: 'Yan', icon: 'Palette' },
  { name: 'Nian', theme: 'Yan', icon: 'Hammer' },

  // Rhodes Island / Core / Others
  { name: 'Amiya', theme: 'Rhodes Island', icon: 'Crown' },
  { name: 'Kal\'tsit', theme: 'Rhodes Island', icon: 'Syringe' },
  { name: 'Blaze', theme: 'Rhodes Island', icon: 'Flame' },
  { name: 'Rosmontis', theme: 'Rhodes Island', icon: 'Database' },
  { name: 'Surtr', theme: 'Rhodes Island', icon: 'Flame' },
  { name: 'Thorns', theme: 'Rhodes Island', icon: 'Sprout' },
  { name: 'Mudrock', theme: 'Rhodes Island', icon: 'Hammer' },
  { name: 'W', theme: 'Rhodes Island', icon: 'Bomb' },
  { name: 'Phantom', theme: 'Rhodes Island', icon: 'Ghost' },
  { name: 'Mountain', theme: 'Rhodes Island', icon: 'Shield' },
];

export const getRandomOperator = (): Operator => {
  const randomIndex = Math.floor(Math.random() * OPERATORS.length);
  return OPERATORS[randomIndex];
};
