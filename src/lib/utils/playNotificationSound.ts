/** Brauzer ogohlantirish toni — yangi buyurtma dialogi uchun */

export function playNotificationSound(): void {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;

    const ctx = new AC();

    const playTone = () => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.frequency.value = 880;
      oscillator.type = "sine";
      const t = ctx.currentTime;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
      oscillator.start(t);
      oscillator.stop(t + 0.36);
    };

    if (ctx.state === "suspended") {
      void ctx.resume().then(playTone);
    } else {
      playTone();
    }
  } catch {
    /* brauzer ovozni bloklasa — jim */
  }
}
