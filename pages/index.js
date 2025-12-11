import { useEffect, useMemo, useRef, useState } from 'react';
import styles from '@/styles/Home.module.css';

const REACTION_PHRASES = [
  'Wait for the banana to shout "GO!" 🍌',
  'Hold still. The neurons are stretching. 🧠',
  'Patience, padawan of giggles… 😌',
  'Shhh… comedy elves are loading punchlines. 🤫'
];

const MEMORY_PATTERNS = [
  ['🤡', '🥦', '🪴', '🦄'],
  ['🐙', '🍉', '🪩', '🧠'],
  ['🦖', '🍕', '🚀', '🧃'],
  ['🎈', '🛼', '🫧', '🛸'],
  ['🐼', '🍩', '🧠', '🧊']
];

const RIDDLE_BANK = [
  {
    prompt: 'Which brain buddy keeps calm under pressure?',
    answers: [
      { text: 'Zen the Alpaca doing yoga', correct: true },
      { text: 'Larry the latte after 5 shots', correct: false },
      { text: 'Captain Crunchy Snack on a sugar rush', correct: false }
    ],
    insight: 'Deep breaths calm the amygdala—stress shrinks when silliness meets mindfulness.'
  },
  {
    prompt: 'Pick the combo that supercharges memory the most:',
    answers: [
      { text: 'Sleep + laughter breaks', correct: true },
      { text: 'Doomscrolling + spicy chips', correct: false },
      { text: 'Three coffees + dramatic sighs', correct: false }
    ],
    insight: 'REM sleep consolidates learning, and laughter lowers cortisol. Science says giggle-nap!'
  },
  {
    prompt: 'What is the brain’s favorite playground warm-up?',
    answers: [
      { text: 'Juggling ideas & doodling plans', correct: true },
      { text: 'Reading the fridge magnets', correct: false },
      { text: 'Moodily staring at socks', correct: false }
    ],
    insight: 'Creativity exercises ignite the prefrontal cortex and make problem-solving smoother.'
  }
];

const STAGES = [
  {
    id: 'spark',
    label: 'Brain Spark',
    difficulty: 'Basic',
    description:
      'Warm up with comedy-infused reflex training. Focus on the beat between anticipation and action.',
    component: ReactionGame,
    tags: ['Reflex', 'Focus', 'Energy Priming']
  },
  {
    id: 'memory',
    label: 'Memory Mash',
    difficulty: 'Intermediate',
    description:
      'Your hippocampus meets a parade of weird emojis. Spot the missing pal to boost working memory.',
    component: MemorySpotter,
    tags: ['Working Memory', 'Pattern Recognition']
  },
  {
    id: 'puzzle',
    label: 'Mindful Mischief',
    difficulty: 'Advanced',
    description:
      'Decode mindful riddles with punchlines. Walk away with science-backed brain boosts.',
    component: PunchlinePuzzles,
    tags: ['Reasoning', 'Psychoeducation', 'Mindfulness']
  }
];

function ReactionGame({ onSuccess, onFailure, stats }) {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('Click start and wait for the punchline!');
  const [lastTime, setLastTime] = useState(null);
  const startTimeRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const handleStart = () => {
    clearTimeout(timeoutRef.current);
    const waitMs = 1400 + Math.random() * 2200;
    setStatus('waiting');
    setMessage(REACTION_PHRASES[Math.floor(Math.random() * REACTION_PHRASES.length)]);
    timeoutRef.current = setTimeout(() => {
      startTimeRef.current = performance.now();
      setStatus('ready');
      setMessage('SMASH THAT BIG BUTTON! 🫡');
    }, waitMs);
  };

  const handleClick = () => {
    if (status === 'idle') return;
    if (status === 'waiting') {
      clearTimeout(timeoutRef.current);
      setStatus('idle');
      setMessage('Too eager! Give the neurons a drum roll next time. 🥁');
      onFailure({ type: 'early' });
      return;
    }
    if (status === 'ready') {
      const reactionTime = Math.round(performance.now() - startTimeRef.current);
      setLastTime(reactionTime);
      setStatus('idle');
      setMessage(
        reactionTime < 220
          ? 'Lightning brain! ⚡️'
          : reactionTime < 350
          ? 'Spicy synapse speed! 🌶️'
          : 'Nice catch! Keep the giggles limber. 😎'
      );
      onSuccess({ score: reactionTime });
    }
  };

  return (
    <div className={styles.gameCard}>
      <div className={styles.layoutTwoCol}>
        <div className={styles.gameArea}>
          <div className={styles.gamePanel}>
            <strong>{message}</strong>
            {lastTime !== null && (
              <span>Last reaction: {lastTime} ms • Best: {stats.best ? `${stats.best} ms` : '—'}</span>
            )}
          </div>
          <button className={styles.ctaButton} onClick={handleStart}>
            Start the Drum Roll 🥁
          </button>
          <button className={styles.ctaButton} onClick={handleClick}>
            Tap When Ready 🎯
          </button>
        </div>
        <div className={styles.timeline}>
          <div className={styles.timelineStep}>
            <strong>How to win</strong>
            <p>Hit the button after the comedy cue. React under 280ms for Turbo Synapse bonus.</p>
          </div>
          <div className={styles.timelineStep}>
            <strong>Nerdy nugget</strong>
            <p>Reaction drills boost dopaminergic pathways and sharpen focus, especially with playful stressors.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MemorySpotter({ onSuccess, onFailure, stats }) {
  const [sequence, setSequence] = useState([]);
  const [missingItem, setMissingItem] = useState(null);
  const [mode, setMode] = useState('ready');
  const [hint, setHint] = useState('Peek at the weird squad. One will ghost you. 👻');
  const revealTimer = useRef(null);

  useEffect(() => () => clearTimeout(revealTimer.current), []);

  const startRound = () => {
    const pool = MEMORY_PATTERNS[Math.floor(Math.random() * MEMORY_PATTERNS.length)];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const missing = shuffled[Math.floor(Math.random() * shuffled.length)];
    const remain = shuffled.filter((item) => item !== missing);
    const display = [...remain];
    display.splice(Math.floor(Math.random() * (display.length + 1)), 0, missing);

    setSequence(display);
    setMissingItem(missing);
    setMode('memorize');
    setHint('Study the gang. Someone will sneak off in 3…2…1…');

    revealTimer.current = setTimeout(() => {
      setSequence(display.filter((item) => item !== missing));
      setMode('guess');
      setHint('Who dipped out? Tap the missing friend.');
    }, 3400);
  };

  const handleGuess = (item) => {
    if (mode !== 'guess') return;
    const correct = item === missingItem;
    if (correct) {
      setHint('Legendary memory flex! 🌈');
      onSuccess({ score: stats.streak + 1 });
    } else {
      setHint('Oops! Emojis demand justice. Try again. 🙈');
      onFailure({ type: 'wrong' });
    }
    setMode('ready');
  };

  return (
    <div className={styles.gameCard}>
      <div className={styles.layoutTwoCol}>
        <div className={styles.gameArea}>
          <div className={styles.gamePanel}>
            <strong>{hint}</strong>
            <div className={styles.grid}>
              {sequence.map((item, index) => (
                <button key={`${item}-${index}`} onClick={() => handleGuess(item)}>
                  {mode === 'memorize' ? item : '??'}
                </button>
              ))}
            </div>
            {mode === 'ready' && (
              <span>
                Streak: {stats.streak} • Top streak: {stats.topStreak}
              </span>
            )}
          </div>
          <button className={styles.ctaButton} onClick={startRound}>
            Summon Memory Chaos 💥
          </button>
        </div>
        <div className={styles.timeline}>
          <div className={styles.timelineStep}>
            <strong>Brain trick</strong>
            <p>Chunk the characters into pairs or invent silly stories. Humor + chunking = sticky memory.</p>
          </div>
          <div className={styles.timelineStep}>
            <strong>Science bit</strong>
            <p>Recalling patterns trains hippocampal pathways and reduces cognitive fatigue when gamified.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PunchlinePuzzles({ onSuccess, onFailure, stats }) {
  const [current, setCurrent] = useState(null);
  const [feedback, setFeedback] = useState('Pick the punchline that feeds your frontal lobe.');

  const loadPuzzle = () => {
    const next =
      RIDDLE_BANK.filter((r) => r !== current)[Math.floor(Math.random() * (RIDDLE_BANK.length - 1))] ||
      RIDDLE_BANK[Math.floor(Math.random() * RIDDLE_BANK.length)];
    setCurrent(next);
    setFeedback('Mindful mischief activated! Choose the brain-friendly punchline.');
  };

  useEffect(() => {
    loadPuzzle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnswer = (answer) => {
    if (!current) return;
    if (answer.correct) {
      setFeedback(`${answer.text} ✅ ${current.insight}`);
      onSuccess({ score: stats.streak + 1 });
      loadPuzzle();
    } else {
      setFeedback('Plot twist! That punchline wobbled. Take a mindful breath and try again.');
      onFailure({ type: 'incorrect' });
    }
  };

  return (
    <div className={styles.gameCard}>
      <div className={styles.timelineStep}>
        <strong>Insight meter</strong>
        <p>{feedback}</p>
        <span>
          Streak: {stats.streak} • Top streak: {stats.topStreak}
        </span>
      </div>
      <div className={styles.timeline}>
        {current && (
          <>
            <div className={styles.timelineStep}>
              <strong>{current.prompt}</strong>
            </div>
            {current.answers.map((answer) => (
              <button
                key={answer.text}
                className={styles.ctaButton}
                onClick={() => handleAnswer(answer)}
              >
                {answer.text}
              </button>
            ))}
          </>
        )}
      </div>
      <div className={`${styles.timelineStep} ${styles.cardAccent}`}>
        <strong>Mind Health Tip</strong>
        <p>
          Humor strengthens social bonds and reduces cortisol. Pair it with mindful choices for a double
          brain hug.
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const [activeStage, setActiveStage] = useState(STAGES[0].id);
  const [stats, setStats] = useState(() =>
    STAGES.reduce((acc, stage) => {
      acc[stage.id] = {
        plays: 0,
        best: null,
        streak: 0,
        topStreak: 0,
        completions: 0,
        lastResult: null
      };
      return acc;
    }, {})
  );

  const StageComponent = useMemo(() => {
    const stage = STAGES.find((item) => item.id === activeStage);
    return stage.component;
  }, [activeStage]);

  const handleStageSuccess = (stageId, payload) => {
    setStats((prev) => {
      const data = { ...prev[stageId] };
      data.plays += 1;
      data.lastResult = 'success';
      data.streak += 1;
      data.topStreak = Math.max(data.topStreak, data.streak);
      data.completions += 1;
      if (typeof payload?.score === 'number') {
        data.best = data.best === null ? payload.score : Math.min(data.best, payload.score);
      }
      return { ...prev, [stageId]: data };
    });
  };

  const handleStageFailure = (stageId) => {
    setStats((prev) => {
      const data = { ...prev[stageId] };
      data.plays += 1;
      data.lastResult = 'fail';
      data.streak = 0;
      return { ...prev, [stageId]: data };
    });
  };

  const completedStages = Object.values(stats).filter((item) => item.topStreak > 0).length;
  const progressPercent = Math.round((completedStages / STAGES.length) * 100);

  const activeStageData = STAGES.find((stage) => stage.id === activeStage);

  return (
    <main className={styles.container}>
      <header className={styles.headline}>
        <h1>Mind Circus: Laugh, Learn, Level Up 🧠🎪</h1>
        <p>
          A playful mental-fitness arcade packed with comedic brain teasers—from reflex warmups to mindful
          mastery. Sharpen your focus, memory, and mood with each silly stage.
        </p>
      </header>

      <section className={styles.board}>
        <div className={styles.stageHeader}>
          <h2>Choose Your Brainwave Journey</h2>
          <div className={styles.stageList}>
            {STAGES.map((stage) => (
              <button
                key={stage.id}
                className={`${styles.stagePill} ${activeStage === stage.id ? styles.stagePillActive : ''}`}
                onClick={() => setActiveStage(stage.id)}
              >
                {stage.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.stagePanel}>
          <div className={styles.stageDescription}>
            <strong>
              {activeStageData.label} · {activeStageData.difficulty} Mode
            </strong>
            <p>{activeStageData.description}</p>
            <div className={styles.chipShelf}>
              {activeStageData.tags.map((tag) => (
                <span key={tag} className={styles.chip}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <StageComponent
            stats={stats[activeStage]}
            onSuccess={(payload) => handleStageSuccess(activeStage, payload)}
            onFailure={(payload) => handleStageFailure(activeStage, payload)}
          />
        </div>

        <div className={styles.statsGrid}>
          {STAGES.map((stage) => (
            <div key={stage.id} className={styles.statCard}>
              <span>{stage.label}</span>
              <strong>{stats[stage.id].topStreak > 0 ? 'On Fire 🔥' : 'Warming Up'}</strong>
              <small>
                Plays: {stats[stage.id].plays} · Streak: {stats[stage.id].streak}
                {typeof stats[stage.id].best === 'number' && stage.id === 'spark'
                  ? ` · Best: ${stats[stage.id].best}ms`
                  : ''}
              </small>
            </div>
          ))}
        </div>

        <div>
          <div className={styles.progressBar}>
            <div className={styles.progressIndicator} style={{ width: `${progressPercent}%` }} />
          </div>
          <p>
            Progress: {completedStages}/{STAGES.length} stages conquered · Keep stacking mindful micro-wins!
          </p>
        </div>
      </section>

      <footer className={styles.footer}>
        Crafted for sharper minds, lighter moods, and unstoppable giggles. Hydrate, stretch, repeat. 💧🧘‍♀️
      </footer>
    </main>
  );
}
