export const suits = ['spades', 'hearts', 'diamonds', 'clubs'] as const;
export const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;
export const levels = ['light', 'stimulating', 'intense'] as const;
export const genderVersions = ['male', 'female'] as const;

export type Suit = (typeof suits)[number];
export type Rank = (typeof ranks)[number];
export type Level = (typeof levels)[number];
export type GenderVersion = (typeof genderVersions)[number];

export interface PokerCard {
  suit: Suit;
  rank: Rank;
  level: Level;
  content: string;
}

export interface CardDeck {
  cards: PokerCard[];
}

export interface PositionList {
  categories: Record<string, string>;
  [category: string]: Record<string, string> | string[];
}

export interface ImportedGameContent {
  maleCards: PokerCard[];
  femaleCards: PokerCard[];
  positionList: PositionList | null;
}

export const suitLabels: Record<Suit, string> = {
  spades: '黑桃',
  hearts: '红心',
  diamonds: '方块',
  clubs: '梅花',
};

export const levelLabels: Record<Level, string> = {
  light: '轻度',
  stimulating: '升温',
  intense: '强烈',
};

export const genderVersionLabels: Record<GenderVersion, string> = {
  male: '男生版',
  female: '女生版',
};

export type SuitColor = 'red' | 'black';

export function getSuitColor(suit: Suit): SuitColor {
  return suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black';
}

export function isCardDeck(value: unknown): value is CardDeck {
  if (!value || typeof value !== 'object' || !Array.isArray((value as CardDeck).cards)) {
    return false;
  }

  return (value as CardDeck).cards.every((card) => {
    return (
      card &&
      typeof card === 'object' &&
      suits.includes((card as PokerCard).suit) &&
      ranks.includes((card as PokerCard).rank) &&
      levels.includes((card as PokerCard).level) &&
      typeof (card as PokerCard).content === 'string' &&
      (card as PokerCard).content.trim().length > 0
    );
  });
}

export function isPositionList(value: unknown): value is PositionList {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const list = value as PositionList;
  if (
    !list.categories ||
    typeof list.categories !== 'object' ||
    Array.isArray(list.categories)
  ) {
    return false;
  }

  return Object.entries(list.categories).every(([category, label]) => (
    category.trim().length > 0 &&
    typeof label === 'string' &&
    label.trim().length > 0 &&
    Array.isArray(list[category]) &&
    (list[category] as string[]).every((item) => typeof item === 'string' && item.trim().length > 0)
  ));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function firstDefined(...values: unknown[]): unknown {
  return values.find((value) => value !== undefined);
}

function normalizeDeckValue(value: unknown): PokerCard[] | null {
  if (isCardDeck(value)) {
    return value.cards;
  }

  if (Array.isArray(value) && isCardDeck({ cards: value })) {
    return value;
  }

  return null;
}

export function parseImportedGameContent(value: unknown): ImportedGameContent | null {
  if (!isRecord(value)) {
    return null;
  }

  const cards = isRecord(value.cards) ? value.cards : undefined;
  const decks = isRecord(value.decks) ? value.decks : undefined;
  const maleRaw = firstDefined(value.maleCards, value.male, cards?.male, decks?.male);
  const femaleRaw = firstDefined(value.femaleCards, value.female, cards?.female, decks?.female);
  const positionRaw = firstDefined(value.positionList, value.positions, value.positionData);

  const maleCards = maleRaw === undefined ? [] : normalizeDeckValue(maleRaw);
  const femaleCards = femaleRaw === undefined ? [] : normalizeDeckValue(femaleRaw);
  const positionList = positionRaw === undefined ? null : isPositionList(positionRaw) ? positionRaw : null;

  if (
    maleCards === null ||
    femaleCards === null ||
    (positionRaw !== undefined && positionList === null)
  ) {
    return null;
  }

  if (maleRaw === undefined && femaleRaw === undefined && positionRaw === undefined) {
    return null;
  }

  return {
    maleCards,
    femaleCards,
    positionList,
  };
}

export function drawRandomCard<T extends PokerCard>(
  deck: readonly T[],
  random: () => number = Math.random,
): T {
  if (deck.length === 0) {
    throw new Error('Cannot draw from an empty deck.');
  }

  const index = Math.min(deck.length - 1, Math.floor(random() * deck.length));
  return deck[index];
}

export function filterCardsByLevel<T extends PokerCard>(deck: readonly T[], level: Level): T[] {
  return deck.filter((card) => card.level === level);
}

export type GameState = 'idle' | 'drawing' | 'cardBack' | 'flipping' | 'masked' | 'revealed';

export const actionLabels: Record<GameState, string> = {
  idle: '再抽一张',
  drawing: '再抽一张',
  cardBack: '再抽一张',
  flipping: '再抽一张',
  masked: '再抽一张',
  revealed: '再抽一张',
};

export function getActionLabel(state: GameState): string {
  return actionLabels[state];
}
