import { create } from 'zustand';
import { useDay } from './nutrition';
import { commas } from '../logic/derive';

/**
 * AI Coach — fully mocked. Replies are scripted from the design (C2, C4, C5) and arrive after a
 * "thinking" delay (~2.2 s, like C3 → C4). Every message is local state; nothing leaves the device.
 */
export type Msg =
  | { id: string; role: 'time'; text: string }
  | { id: string; role: 'user'; text: string; failed?: boolean }
  | { id: string; role: 'ai'; kind: 'text'; text: string }
  | { id: string; role: 'ai'; kind: 'meal'; logged?: boolean }
  | { id: string; role: 'ai'; kind: 'swap'; state: 'open' | 'swapped' | 'kept' };

type Topic = 'dinner' | 'friday' | 'stretch' | 'progress' | 'sleep' | 'other';

type State = {
  messages: Msg[];
  status: 'idle' | 'thinking';
  online: boolean;
  quick: string[];
  timer: any;
  send: (text: string, ctx: Ctx) => void;
  stop: () => void;
  retry: (id: string, ctx: Ctx) => void;
  logMeal: (id: string) => void;
  swap: (id: string, keep?: boolean) => void;
  reset: () => void;
};

/** live numbers from the day, so the coach quotes the same values as N1 / Today */
export type Ctx = { left: number; proteinToGo: number };

let n = 0;
const uid = () => `m${++n}`;

export const SUGGESTIONS = [
  { icon: 'fork-knife', text: 'What should I eat for dinner?' },
  { icon: 'barbell', text: "Make Friday's workout shorter" },
  { icon: 'chart-line-up', text: 'How am I doing this week?' },
  { icon: 'moon', text: 'Help me sleep better' },
] as const;

function topicOf(text: string): Topic {
  const t = text.toLowerCase();
  if (/stretch/.test(t)) return 'stretch';
  if (/friday|shorter|10 min/.test(t)) return 'friday';
  if (/dinner|eat|meal|food|protein|hungry/.test(t)) return 'dinner';
  if (/how am i doing|this week/.test(t)) return 'progress';
  if (/sleep/.test(t)) return 'sleep';
  return 'other';
}

/** suggestion chips are rewritten into the full question, as in the design */
function userText(text: string) {
  if (text === "Make Friday's workout shorter") return "Can you make Friday's workout shorter? I only have 10 minutes.";
  if (text === 'Add a stretch') return 'Can you also add a stretch on Friday?';
  return text;
}

const TIME: Record<Topic, string | null> = { dinner: 'Today 18:40', friday: 'Today 18:42', stretch: 'Today 18:45', progress: null, sleep: null, other: null };

export const useCoach = create<State>((set, get) => {
  const pushAll = (msgs: Msg[], quick: string[]) => {
    // replies land 260 ms apart (README → Chat)
    msgs.forEach((m, i) =>
      setTimeout(() => {
        set({ messages: [...get().messages, m] });
        if (i === msgs.length - 1) set({ status: 'idle', quick });
      }, i * 260)
    );
  };
  const reply = (topic: Topic, ctx: Ctx) => {
    if (topic === 'dinner')
      pushAll(
        [
          { id: uid(), role: 'ai', kind: 'text', text: `You have ${commas(ctx.left)} kcal left and you’re ${ctx.proteinToGo} g short on protein. This one covers most of it:` },
          { id: uid(), role: 'ai', kind: 'meal' },
          { id: uid(), role: 'ai', kind: 'text', text: 'Want something quicker? I can suggest a 10-minute option.' },
        ],
        ['Something quicker', 'Vegetarian option', 'Log it for me']
      );
    else if (topic === 'friday')
      pushAll(
        [
          { id: uid(), role: 'ai', kind: 'text', text: 'Sure. Here is a 10-minute version that keeps the core and glute work:' },
          { id: uid(), role: 'ai', kind: 'swap', state: 'open' },
        ],
        ['Move it to the morning', 'Add a stretch']
      );
    else if (topic === 'progress')
      pushAll(
        [{ id: uid(), role: 'ai', kind: 'text', text: "Solid week, Sofia. You've done 2 of 3 workouts and averaged 1,620 kcal a day. Friday's Pilates gets you to 3 of 3." }],
        ['Show my progress', 'Plan next week']
      );
    else if (topic === 'sleep')
      pushAll(
        [{ id: uid(), role: 'ai', kind: 'text', text: 'Try a 10-minute Stretch & sleep session about an hour before bed, and finish dinner at least 2 hours before. Want me to add it to tonight?' }],
        ['Add it to tonight', 'Maybe later']
      );
    else pushAll([{ id: uid(), role: 'ai', kind: 'text', text: 'I can help with meals, workouts and your plan. Try asking what to eat for dinner, or to make a workout shorter.' }], []);
  };

  return {
    messages: [],
    status: 'idle',
    online: true,
    quick: [],
    timer: null,
    send: (raw, ctx) => {
      const text = raw.trim();
      if (!text || get().status === 'thinking' || !get().online) return;
      if (text === 'Log it for me') {
        const meal = [...get().messages].reverse().find((m) => m.role === 'ai' && m.kind === 'meal');
        if (meal) get().logMeal(meal.id);
      }
      const topic = topicOf(text);
      const time = TIME[topic];
      const msgs: Msg[] = [];
      const lastTime = [...get().messages].reverse().find((m) => m.role === 'time');
      if (time && (!lastTime || lastTime.text !== time)) msgs.push({ id: uid(), role: 'time', text: time });
      if (topic === 'stretch') {
        // C5 — the connection drops: the message stays in place, not delivered
        msgs.push({ id: uid(), role: 'user', text: userText(text), failed: true });
        set({ messages: [...get().messages, ...msgs], online: false, quick: [] });
        return;
      }
      msgs.push({ id: uid(), role: 'user', text: userText(text) });
      set({ messages: [...get().messages, ...msgs], status: 'thinking', quick: [] });
      const timer = setTimeout(() => reply(topic, ctx), 2200);
      set({ timer });
    },
    stop: () => {
      clearTimeout(get().timer);
      set({ status: 'idle', timer: null });
    },
    retry: (id) => {
      // back online; the failed message is withdrawn and the conversation returns to the action reply (C5 → C4)
      set({ online: true, messages: get().messages.filter((m) => m.id !== id), quick: ['Move it to the morning', 'Add a stretch'] });
    },
    logMeal: (id) =>
      set({ messages: get().messages.map((m) => (m.id === id && m.role === 'ai' && m.kind === 'meal' ? { ...m, logged: true } : m)) }),
    swap: (id, keep) => {
      set({ messages: get().messages.map((m) => (m.id === id && m.role === 'ai' && m.kind === 'swap' ? { ...m, state: keep ? 'kept' : 'swapped' } : m)) });
      if (!keep) {
        const t = TIME.stretch!;
        setTimeout(() => {
          set({
            messages: [...get().messages, { id: uid(), role: 'time', text: t }, { id: uid(), role: 'ai', kind: 'text', text: 'Done. Friday is now Express Pilates, 10 minutes.' }],
          });
        }, 700);
      }
    },
    reset: () => {
      clearTimeout(get().timer);
      set({ messages: [], status: 'idle', online: true, quick: [] });
    },
  };
});

/** Context for replies (calories left, protein to go) from the nutrition store. */
export function useCoachCtx(): Ctx {
  const d = useDay();
  return { left: d.left, proteinToGo: Math.max(0, d.pGoal - d.p) };
}
