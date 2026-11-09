/**
 * Progress for each onboarding step, in segments (0..5). Stages: Goals, Routine, Preferences,
 * Personalization, Done. Values read from the prototype markup (fill width per segment).
 */
export const STEP_PROGRESS = [0, 0.25, 0.5, 0.75, 1, 1.33, 1.66, 2, 2.33, 2.66, 3, 3.33, 3.66, 4, 4.33, 4.66, 5, 5];
export const LAST_STEP = 17;
export const HIDE_BACK = new Set([15, 16]);
