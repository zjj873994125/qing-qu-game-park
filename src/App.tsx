import { type ChangeEvent, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  type GenderVersion,
  type ContentCard,
  type ImportedGameContent,
  type Level,
  type GameState,
  type PositionList,
  type PokerCard,
  type Suit,
  drawRandomCard,
  drawRandomPokerFace,
  filterCardsByLevel,
  getSuitColor,
  genderVersionLabels,
  levels,
  levelLabels,
  parseImportedGameContent,
  suitLabels,
} from './cardData';

const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`;
const cardBackUrl = assetUrl('assets/card-back.png');
const flipDurationMs = 760;
const drawDurationMs = 820;
const contentStorageKey = 'desire-poker-imported-content-v1';
type AppView = 'cards' | 'list';

const emptyContent: ImportedGameContent = {
  maleCards: [],
  femaleCards: [],
  positionList: null,
};

const suitImageBySuit: Record<Suit, string> = {
  hearts: assetUrl('assets/suit-hearts.png'),
  diamonds: assetUrl('assets/suit-diamonds.png'),
  clubs: assetUrl('assets/suit-clubs.png'),
  spades: assetUrl('assets/suit-spades.png'),
};

const levelCopy: Record<Level, string> = {
  light: '轻度',
  stimulating: '升温',
  intense: '强烈',
};

function getNextLevel(level: Level): Level {
  const index = levels.indexOf(level);
  return levels[(index + 1) % levels.length];
}

function readStoredContent(): ImportedGameContent {
  try {
    const stored = window.localStorage.getItem(contentStorageKey);
    if (!stored) {
      return emptyContent;
    }

    return parseImportedGameContent(JSON.parse(stored)) ?? emptyContent;
  } catch {
    return emptyContent;
  }
}

function CornerMark({ card, inverted = false }: { card: PokerCard; inverted?: boolean }) {
  return (
    <div
      className={`corner-mark corner-mark--${getSuitColor(card.suit)}${
        inverted ? ' corner-mark--inverted' : ''
      }`}
    >
      <span className="corner-rank">{card.rank}</span>
      <img className="suit-icon" src={suitImageBySuit[card.suit]} alt={suitLabels[card.suit]} />
    </div>
  );
}

function MaskedText() {
  return (
    <div className="masked-content" aria-label="文案已打码">
      <span />
      <span />
      <span />
    </div>
  );
}

function CardFace({
  card,
  isContentVisible,
  onRevealContent,
}: {
  card: PokerCard;
  isContentVisible: boolean;
  onRevealContent: () => void;
}) {
  return (
    <article className={`card-surface card-front card-front--${card.level}`}>
      <div className="card-paper-texture" />
      <CornerMark card={card} />
      <div className="card-content">
        <p className="level-label">{levelLabels[card.level]}</p>
        {isContentVisible ? (
          <p className="desire-text">{card.content}</p>
        ) : (
          <>
            <MaskedText />
            <button type="button" className="reveal-content-button" onClick={onRevealContent}>
              赢家揭晓文案
            </button>
          </>
        )}
      </div>
      <CornerMark card={card} inverted />
    </article>
  );
}

function CardBack({
  children,
  isInteractive = false,
}: {
  children?: ReactNode;
  isInteractive?: boolean;
}) {
  return (
    <div className="card-surface card-back" aria-hidden={!isInteractive}>
      <img src={cardBackUrl} alt="" />
      {children}
    </div>
  );
}

function PositionListPanel({
  categories,
  selectedCategory,
  items,
  onSelectCategory,
}: {
  categories: Record<string, string>;
  selectedCategory: string;
  items: string[];
  onSelectCategory: (category: string) => void;
}) {
  const categoryKeys = Object.keys(categories);

  if (categoryKeys.length === 0) {
    return (
      <section className="empty-panel" aria-label="列表为空">
        <p>还没有列表数据</p>
        <span>导入 JSON 后会显示分类和文案。</span>
      </section>
    );
  }

  return (
    <section className="position-panel" aria-label="体位列表">
      <div className="position-tabs" role="tablist" aria-label="体位分类">
        {categoryKeys.map((category) => (
          <button
            key={category}
            type="button"
            className={`position-tab${category === selectedCategory ? ' position-tab--active' : ''}`}
            onClick={() => onSelectCategory(category)}
            aria-selected={category === selectedCategory}
            role="tab"
          >
            {categories[category]}
          </button>
        ))}
      </div>
      <div className="position-list" role="tabpanel" aria-label={`${categories[selectedCategory]} 文案`}>
        {items.map((item, index) => (
          <p key={`${selectedCategory}-${item}-${index}`} className="position-list-item">
            <span>{String(index + 1).padStart(2, '0')}</span>
            {item}
          </p>
        ))}
      </div>
    </section>
  );
}

function ImportPanel({
  importStatus,
  onImportClick,
}: {
  importStatus: string;
  onImportClick: () => void;
}) {
  return (
    <section className="import-panel" aria-label="导入 JSON">
      <p>还没有导入数据</p>
      <span>选择本地 JSON 文件后，牌组和列表会保存在这台设备的浏览器里。</span>
      <button type="button" className="import-button" onClick={onImportClick}>
        导入 JSON
      </button>
      {importStatus ? <small>{importStatus}</small> : null}
    </section>
  );
}

function App() {
  const [importedContent, setImportedContent] = useState<ImportedGameContent>(readStoredContent);
  const [importStatus, setImportStatus] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<Level>('light');
  const [selectedVersion, setSelectedVersion] = useState<GenderVersion>('male');
  const [appView, setAppView] = useState<AppView>('cards');
  const [selectedPositionCategory, setSelectedPositionCategory] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const positionCategories = useMemo(() => importedContent.positionList?.categories ?? {}, [importedContent]);
  const decks = useMemo<Record<GenderVersion, ContentCard[]>>(() => ({
    male: importedContent.maleCards,
    female: importedContent.femaleCards,
  }), [importedContent]);
  const positionList = importedContent.positionList;
  const firstPositionCategory = Object.keys(positionCategories)[0] ?? '';
  const hasAnyCards = importedContent.maleCards.length > 0 || importedContent.femaleCards.length > 0;
  const hasActiveDeck = decks[selectedVersion].length > 0;
  const hasPositionList = !!positionList && Object.keys(positionCategories).length > 0;
  const activeDeck = useMemo(() => {
    const deck = decks[selectedVersion];
    return filterCardsByLevel(deck, selectedLevel);
  }, [decks, selectedLevel, selectedVersion]);
  const activePositionItems = useMemo(() => (
    positionList && selectedPositionCategory ? positionList[selectedPositionCategory] as string[] : []
  ), [positionList, selectedPositionCategory]);
  const [currentCard, setCurrentCard] = useState<PokerCard | null>(null);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [drawCount, setDrawCount] = useState(0);
  const drawTimerRef = useRef<number | null>(null);
  const revealTimerRef = useRef<number | null>(null);

  const pickNextCard = useCallback(() => {
    if (activeDeck.length === 0) {
      return;
    }

    setCurrentCard((previous) => {
      let nextContent = drawRandomCard(activeDeck);
      let guard = 0;
      while (previous && nextContent.content === previous.content && activeDeck.length > 1 && guard < 8) {
        nextContent = drawRandomCard(activeDeck);
        guard += 1;
      }

      return {
        ...drawRandomPokerFace(),
        level: nextContent.level,
        content: nextContent.content,
      };
    });
  }, [activeDeck]);

  const drawCard = useCallback(() => {
    if (activeDeck.length === 0 || gameState === 'drawing' || gameState === 'flipping') {
      if (activeDeck.length === 0) {
        setImportStatus('当前版本和程度没有可抽取的文案，请先导入、切换版本或切换程度。');
      }
      return;
    }

    pickNextCard();
    setGameState('drawing');

    if (navigator.vibrate) {
      navigator.vibrate(35);
    }

    window.clearTimeout(drawTimerRef.current ?? undefined);
    window.clearTimeout(revealTimerRef.current ?? undefined);
    drawTimerRef.current = window.setTimeout(() => {
      setDrawCount((count) => count + 1);
      setGameState('cardBack');
    }, drawDurationMs);
  }, [activeDeck.length, gameState, pickNextCard]);

  const openCard = useCallback(() => {
    if (gameState !== 'cardBack') {
      return;
    }

    setGameState('flipping');
    window.clearTimeout(revealTimerRef.current ?? undefined);
    revealTimerRef.current = window.setTimeout(() => {
      setGameState('masked');
    }, flipDurationMs);
  }, [gameState]);

  const revealContent = useCallback(() => {
    if (gameState === 'masked') {
      setGameState('revealed');
    }
  }, [gameState]);

  const changeLevel = useCallback(() => {
    if (gameState === 'drawing' || gameState === 'flipping') {
      return;
    }

    setSelectedLevel((level) => {
      const nextLevel = getNextLevel(level);
      setCurrentCard(null);
      return nextLevel;
    });
    setDrawCount(0);
    setGameState('idle');
  }, [gameState]);

  const changeVersion = useCallback(() => {
    if (gameState === 'drawing' || gameState === 'flipping') {
      return;
    }

    setSelectedVersion((version) => (version === 'male' ? 'female' : 'male'));
    setCurrentCard(null);
    setDrawCount(0);
    setGameState('idle');
  }, [gameState]);

  const toggleView = useCallback(() => {
    if (gameState === 'drawing' || gameState === 'flipping') {
      return;
    }

    setAppView((view) => (view === 'cards' ? 'list' : 'cards'));
  }, [gameState]);

  const openImportPicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const importJsonFile = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }

    try {
      const content = parseImportedGameContent(JSON.parse(await file.text()));
      if (!content) {
        setImportStatus('JSON 格式不正确，请检查 maleCards、femaleCards 和 positionList。');
        return;
      }

      window.localStorage.setItem(contentStorageKey, JSON.stringify(content));
      setImportedContent(content);
      setSelectedPositionCategory(Object.keys(content.positionList?.categories ?? {})[0] ?? '');
      setAppView((view) => (
        content.positionList && Object.keys(content.positionList.categories).length > 0 ? view : 'cards'
      ));
      setCurrentCard(null);
      setDrawCount(0);
      setGameState('idle');
      setImportStatus('导入成功，数据已保存在本机浏览器。');
    } catch {
      setImportStatus('导入失败，请确认文件是合法 JSON。');
    }
  }, []);

  const clearImportedContent = useCallback(() => {
    window.localStorage.removeItem(contentStorageKey);
    setImportedContent(emptyContent);
    setSelectedPositionCategory('');
    setAppView('cards');
    setCurrentCard(null);
    setDrawCount(0);
    setGameState('idle');
    setImportStatus('已清空本机导入数据。');
  }, []);

  useEffect(() => {
    if (selectedPositionCategory && positionCategories[selectedPositionCategory]) {
      return;
    }

    setSelectedPositionCategory(firstPositionCategory);
  }, [firstPositionCategory, positionCategories, selectedPositionCategory]);

  useEffect(() => {
    return () => {
      window.clearTimeout(drawTimerRef.current ?? undefined);
      window.clearTimeout(revealTimerRef.current ?? undefined);
    };
  }, []);

  const levelClass = `app-shell--${selectedLevel}`;
  const shouldRenderFace = currentCard && gameState !== 'idle' && gameState !== 'cardBack';

  return (
    <main className={`app-shell ${levelClass}`}>
      <input
        ref={fileInputRef}
        className="file-input"
        type="file"
        accept="application/json,.json"
        onChange={importJsonFile}
      />
      <section className="top-bar" aria-label="游戏状态">
        <div>
          <h1>Desire Poker</h1>
          <p>
            {!hasAnyCards
              ? '先导入本地 JSON'
              : '点击按钮抽牌'}
          </p>
        </div>
        <div className="round-counter">
          <span>第</span>
          <strong>{drawCount}</strong>
          <span>张</span>
        </div>
      </section>

      <section className={`stage${appView === 'list' ? ' stage--list' : ''}`} aria-live="polite">
        {appView === 'list' ? (
          <PositionListPanel
            categories={positionCategories}
            selectedCategory={selectedPositionCategory}
            items={activePositionItems}
            onSelectCategory={setSelectedPositionCategory}
          />
        ) : !hasActiveDeck ? (
          <ImportPanel
            importStatus={importStatus}
            onImportClick={openImportPicker}
          />
        ) : gameState === 'drawing' ? (
          <div className="draw-loader" role="status" aria-live="polite">
            <div className="draw-loader-ring" />
            <span>抽取中</span>
          </div>
        ) : (
          <div
            className={`card-shell card-shell--${
              gameState === 'idle' || gameState === 'cardBack'
                ? 'back'
                : gameState === 'flipping'
                  ? 'flipping'
                  : 'revealed'
            }`}
          >
            <div className="card-inner">
              <div className="card-side card-side--back">
                <CardBack isInteractive={gameState === 'cardBack'}>
                  {gameState === 'cardBack' ? (
                    <button type="button" className="open-card-button" onClick={openCard}>
                      点击开牌
                    </button>
                  ) : null}
                </CardBack>
              </div>
              <div className="card-side card-side--front">
                {shouldRenderFace ? (
                  <CardFace
                    card={currentCard}
                    isContentVisible={gameState === 'revealed'}
                    onRevealContent={revealContent}
                  />
                ) : (
                  <CardBack />
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="controls">
        <div className="mode-controls">
          <button
            type="button"
            className="level-chip"
            onClick={changeLevel}
            disabled={gameState === 'drawing' || gameState === 'flipping'}
            aria-label={`当前程度：${levelCopy[selectedLevel]}，点击切换`}
          >
            <span className={`level-dot level-dot--${selectedLevel}`} />
            {levelCopy[selectedLevel]}
          </button>
          <button
            type="button"
            className="version-chip"
            onClick={changeVersion}
            disabled={gameState === 'drawing' || gameState === 'flipping'}
            aria-label={`当前版本：${genderVersionLabels[selectedVersion]}，点击切换`}
          >
            {genderVersionLabels[selectedVersion]}
          </button>
          <button
            type="button"
            className="view-chip"
            onClick={toggleView}
            disabled={gameState === 'drawing' || gameState === 'flipping' || !hasPositionList}
            aria-label={`当前视图：${appView === 'cards' ? '牌局' : '列表'}，点击切换`}
          >
            {appView === 'cards' ? '列表' : '牌局'}
          </button>
        </div>
        <button
          type="button"
          className="draw-button"
          onClick={drawCard}
          disabled={appView === 'list' || !hasActiveDeck || gameState === 'drawing' || gameState === 'flipping'}
        >
          再抽一张
        </button>
        <div className="import-actions">
          <button type="button" className="import-link" onClick={openImportPicker}>
            导入 JSON
          </button>
          {hasAnyCards || hasPositionList ? (
            <button type="button" className="import-link import-link--muted" onClick={clearImportedContent}>
              清空数据
            </button>
          ) : null}
        </div>
      </section>
    </main>
  );
}

export default App;
