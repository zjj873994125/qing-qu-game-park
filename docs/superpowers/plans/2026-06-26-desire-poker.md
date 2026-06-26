# Desire Poker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first single-player React card game that draws random desire-poker cards by shake or button, flips the card, and renders user-supplied JSON content.

**Architecture:** Use a small React + Vite app with pure card data helpers, a static `cards.json` contract, and CSS-driven card rendering. The generated bitmap asset is limited to the card back and suit symbols; the front face, rank, level styling, and text are code-rendered.

**Tech Stack:** React 18, TypeScript, Vite, Vitest, CSS.

---

### Task 1: Project Skeleton and Tests

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `src/cardData.test.ts`
- Create: `src/cardData.ts`

- [x] **Step 1: Write failing tests for card contract and random draw**

```ts
import { describe, expect, it } from 'vitest';
import { drawRandomCard, isCardDeck, levelLabels, suitLabels } from './cardData';

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
});
```

- [x] **Step 2: Implement minimal data helpers**

Create `src/cardData.ts` with the supported suit, rank, level unions, the JSON guard, and `drawRandomCard`.

- [x] **Step 3: Run tests**

Run: `npm test`

Expected: all tests pass.

### Task 2: Mobile Game UI

**Files:**
- Create: `src/App.tsx`
- Create: `src/main.tsx`
- Create: `src/styles.css`
- Create: `src/cards.json`
- Copy: `public/assets/desire-card-back-suits-sprite.png`

- [x] **Step 1: Build the page**

Create a single mobile-first screen with a large card, shake state, draw button, and previous-card count.

- [x] **Step 2: Render code-generated front**

Use CSS for the card face, rank, corner suit symbols, center content, and level-specific visual treatment.

- [x] **Step 3: Use the generated asset**

Use the transparent sprite as the back image and suit image source. Keep formal crop metadata in CSS variables.

- [x] **Step 4: Add shake detection and fallback button**

Listen to `devicemotion`, require a cooldown, and keep the button as the reliable path.

- [x] **Step 5: Run build**

Run: `npm run build`

Expected: TypeScript and Vite build succeed.

### Task 3: Browser Verification

**Files:**
- No production file changes expected unless QA finds an issue.

- [x] **Step 1: Start dev server**

Run: `npm run dev -- --host 127.0.0.1`

- [x] **Step 2: Verify mobile viewport**

Open the app at a mobile viewport, draw a card, confirm the flip animation reveals a code-rendered card face and that content does not overflow.

- [x] **Step 3: Verify desktop fallback**

Open desktop viewport and confirm the app remains centered, the button draw works, and the card stays large but bounded.
