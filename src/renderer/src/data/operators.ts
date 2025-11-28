export type OperatorTheme = 'Rhodes Island' | 'Rhine Lab' | 'Victoria' | 'Penguin Logistics' | 'Abyssal' | 'Kjerag' | 'Kazimierz' | 'Yan';

export interface Operator {
  name: string;
  theme: OperatorTheme;
}

export const OPERATORS: Operator[] = [
  // Rhine Lab
  { name: 'Muelsyse', theme: 'Rhine Lab' },
  { name: 'Saria', theme: 'Rhine Lab' },
  { name: 'Ifrit', theme: 'Rhine Lab' },
  { name: 'Silence', theme: 'Rhine Lab' },
  { name: 'Magallan', theme: 'Rhine Lab' },
  { name: 'Dorothy', theme: 'Rhine Lab' },

  // Victoria
  { name: 'Saileach', theme: 'Victoria' },
  { name: 'Bagpipe', theme: 'Victoria' },
  { name: 'Horn', theme: 'Victoria' },
  { name: 'Reed', theme: 'Victoria' },
  { name: 'Goldenglow', theme: 'Victoria' },

  // Penguin Logistics
  { name: 'Exusiai', theme: 'Penguin Logistics' },
  { name: 'Texas', theme: 'Penguin Logistics' },
  { name: 'Mostima', theme: 'Penguin Logistics' },
  { name: 'Sora', theme: 'Penguin Logistics' },
  { name: 'Croissant', theme: 'Penguin Logistics' },

  // Abyssal Hunters
  { name: 'Skadi', theme: 'Abyssal' },
  { name: 'Specter', theme: 'Abyssal' },
  { name: 'Gladiia', theme: 'Abyssal' },
  { name: 'Ulpianus', theme: 'Abyssal' }, // Future-proofing

  // Kjerag
  { name: 'SilverAsh', theme: 'Kjerag' },
  { name: 'Pramanix', theme: 'Kjerag' },
  { name: 'Gnosis', theme: 'Kjerag' },

  // Kazimierz
  { name: 'Nearl', theme: 'Kazimierz' },
  { name: 'Mlynar', theme: 'Kazimierz' },
  { name: 'Nightingale', theme: 'Kazimierz' }, // Technically associated
  { name: 'Shining', theme: 'Kazimierz' }, // Technically Confessarius but usually grouped

  // Yan / Sui
  { name: 'Ch\'en', theme: 'Yan' },
  { name: 'Ling', theme: 'Yan' },
  { name: 'Dusk', theme: 'Yan' },
  { name: 'Nian', theme: 'Yan' },

  // Rhodes Island / Core / Others (Defaulting to RI Theme if not specified elsewhere, but explicit here)
  { name: 'Amiya', theme: 'Rhodes Island' },
  { name: 'Kal\'tsit', theme: 'Rhodes Island' },
  { name: 'Blaze', theme: 'Rhodes Island' },
  { name: 'Rosmontis', theme: 'Rhodes Island' },
  { name: 'Surtr', theme: 'Rhodes Island' }, // Mercenary
  { name: 'Thorns', theme: 'Rhodes Island' }, // Iberian
  { name: 'Mudrock', theme: 'Rhodes Island' },
  { name: 'W', theme: 'Rhodes Island' },
  { name: 'Phantom', theme: 'Rhodes Island' },
  { name: 'Mountain', theme: 'Rhodes Island' },
];

export const getRandomOperator = (): Operator => {
  const randomIndex = Math.floor(Math.random() * OPERATORS.length);
  return OPERATORS[randomIndex];
};
