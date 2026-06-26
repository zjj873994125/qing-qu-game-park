import { describe, expect, it } from 'vitest';
import {
  drawRandomCard,
  filterCardsByLevel,
  getActionLabel,
  getSuitColor,
  isCardDeck,
  isPositionList,
  levelLabels,
  parseImportedGameContent,
  suitLabels,
} from './cardData';

describe('card data contract', () => {
  it('accepts the expected cards json shape', () => {
    expect(
      isCardDeck({
        cards: [
          { suit: 'spades', rank: 'A', level: 'light', content: 'placeholder' },
        ],
      }),
    ).toBe(true);
  });

  it('rejects unknown suits, ranks, levels, and empty content', () => {
    expect(
      isCardDeck({
        cards: [
          { suit: 'joker', rank: '1', level: 'hot', content: '' },
        ],
      }),
    ).toBe(false);
  });

  it('accepts position list json with categories mapped to arrays', () => {
    expect(
      isPositionList({
        categories: {
          blowjob: '口交',
          missionary: '传教士',
        },
        blowjob: ['one', 'two'],
        missionary: ['three'],
      }),
    ).toBe(true);
  });

  it('rejects position list json when a category has no matching text array', () => {
    expect(
      isPositionList({
        categories: {
          blowjob: '口交',
        },
        missionary: ['missing category key'],
      }),
    ).toBe(false);
  });

  it('rejects position list json when category labels are empty', () => {
    expect(
      isPositionList({
        categories: {
          blowjob: '',
        },
        blowjob: ['one'],
      }),
    ).toBe(false);
  });

  it('accepts an empty position list template', () => {
    expect(
      isPositionList({
        categories: {},
      }),
    ).toBe(true);
  });

  it('parses imported game content with card arrays and position list', () => {
    expect(
      parseImportedGameContent({
        maleCards: [
          { suit: 'spades', rank: 'A', level: 'light', content: 'male one' },
        ],
        femaleCards: [
          { suit: 'hearts', rank: 'K', level: 'intense', content: 'female one' },
        ],
        positionList: {
          categories: {
            blowjob: '口交',
          },
          blowjob: ['one'],
        },
      }),
    ).toEqual({
      maleCards: [
        { suit: 'spades', rank: 'A', level: 'light', content: 'male one' },
      ],
      femaleCards: [
        { suit: 'hearts', rank: 'K', level: 'intense', content: 'female one' },
      ],
      positionList: {
        categories: {
          blowjob: '口交',
        },
        blowjob: ['one'],
      },
    });
  });

  it('parses imported game content with nested card decks', () => {
    expect(
      parseImportedGameContent({
        cards: {
          male: {
            cards: [
              { suit: 'clubs', rank: 'Q', level: 'stimulating', content: 'nested male' },
            ],
          },
          female: [
            { suit: 'diamonds', rank: '2', level: 'light', content: 'nested female' },
          ],
        },
      }),
    ).toEqual({
      maleCards: [
        { suit: 'clubs', rank: 'Q', level: 'stimulating', content: 'nested male' },
      ],
      femaleCards: [
        { suit: 'diamonds', rank: '2', level: 'light', content: 'nested female' },
      ],
      positionList: null,
    });
  });

  it('rejects imported game content with invalid sections', () => {
    expect(parseImportedGameContent({ maleCards: [{ suit: 'joker' }] })).toBeNull();
    expect(
      parseImportedGameContent({
        positionList: {
          categories: { blowjob: '口交' },
          missionary: ['missing matching key'],
        },
      }),
    ).toBeNull();
    expect(parseImportedGameContent({ theme: 'only unrelated data' })).toBeNull();
  });

  it('draws a card from the provided deck with an injectable random source', () => {
    const deck = [
      { suit: 'spades', rank: 'A', level: 'light', content: 'one' },
      { suit: 'hearts', rank: 'K', level: 'intense', content: 'two' },
    ] as const;

    expect(drawRandomCard(deck, () => 0.99)).toEqual(deck[1]);
  });

  it('exposes labels for every supported suit and level', () => {
    expect(suitLabels.spades).toBe('黑桃');
    expect(levelLabels.stimulating).toBe('升温');
  });

  it('maps suit colors to real poker red and black groups', () => {
    expect(getSuitColor('spades')).toBe('black');
    expect(getSuitColor('clubs')).toBe('black');
    expect(getSuitColor('hearts')).toBe('red');
    expect(getSuitColor('diamonds')).toBe('red');
  });

  it('filters cards by selected level', () => {
    const deck = [
      { suit: 'spades', rank: 'A', level: 'light', content: 'one' },
      { suit: 'hearts', rank: 'K', level: 'intense', content: 'two' },
      { suit: 'clubs', rank: '8', level: 'light', content: 'three' },
    ] as const;

    expect(filterCardsByLevel(deck, 'light')).toEqual([deck[0], deck[2]]);
    expect(filterCardsByLevel(deck, 'stimulating')).toEqual([]);
  });

  it('maps game states to primary action labels', () => {
    expect(getActionLabel('idle')).toBe('再抽一张');
    expect(getActionLabel('drawing')).toBe('再抽一张');
    expect(getActionLabel('cardBack')).toBe('再抽一张');
    expect(getActionLabel('flipping')).toBe('再抽一张');
    expect(getActionLabel('masked')).toBe('再抽一张');
    expect(getActionLabel('revealed')).toBe('再抽一张');
  });
});
