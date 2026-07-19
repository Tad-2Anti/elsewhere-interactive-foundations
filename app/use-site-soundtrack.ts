"use client";

import { useEffect, useRef, useState } from "react";

const BPM = 118;
const STEP_DURATION = 60 / BPM / 4;
const LOOK_AHEAD_SECONDS = 0.12;

type Soundtrack = {
  context: AudioContext;
  master: GainNode;
  nextStepAt: number;
  step: number;
  scheduler: number;
  noise: AudioBuffer;
};

const arp = [
  261.63, 329.63, 392, 523.25,
  220, 261.63, 329.63, 440,
  196, 246.94, 293.66, 392,
  233.08, 293.66, 349.23, 466.16,
];

const bass = [130.81, 110, 98, 116.54];

function createNoiseBuffer(context: AudioContext) {
  const buffer = context.createBuffer(1, Math.floor(context.sampleRate * 0.16), context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < data.length; index += 1) data[index] = Math.random() * 2 - 1;
  return buffer;
}

function scheduleKick(soundtrack: Soundtrack, time: number) {
  const oscillator = soundtrack.context.createOscillator();
  const gain = soundtrack.context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(132, time);
  oscillator.frequency.exponentialRampToValueAtTime(48, time + 0.13);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(0.24, time + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.2);
  oscillator.connect(gain).connect(soundtrack.master);
  oscillator.start(time);
  oscillator.stop(time + 0.21);
}

function scheduleHat(soundtrack: Soundtrack, time: number, open: boolean) {
  const source = soundtrack.context.createBufferSource();
  const filter = soundtrack.context.createBiquadFilter();
  const gain = soundtrack.context.createGain();
  source.buffer = soundtrack.noise;
  filter.type = "highpass";
  filter.frequency.value = open ? 5600 : 7200;
  gain.gain.setValueAtTime(open ? 0.035 : 0.022, time);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + (open ? 0.13 : 0.045));
  source.connect(filter).connect(gain).connect(soundtrack.master);
  source.start(time);
  source.stop(time + (open ? 0.14 : 0.05));
}

function scheduleClap(soundtrack: Soundtrack, time: number) {
  [0, 0.012, 0.026].forEach((offset, index) => {
    const source = soundtrack.context.createBufferSource();
    const filter = soundtrack.context.createBiquadFilter();
    const gain = soundtrack.context.createGain();
    source.buffer = soundtrack.noise;
    filter.type = "bandpass";
    filter.frequency.value = 1450 + index * 180;
    filter.Q.value = 0.7;
    gain.gain.setValueAtTime(0.036 - index * 0.007, time + offset);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + offset + 0.075);
    source.connect(filter).connect(gain).connect(soundtrack.master);
    source.start(time + offset);
    source.stop(time + offset + 0.08);
  });
}

function schedulePluck(soundtrack: Soundtrack, frequency: number, time: number, accent: boolean) {
  const oscillator = soundtrack.context.createOscillator();
  const filter = soundtrack.context.createBiquadFilter();
  const gain = soundtrack.context.createGain();
  const panner = soundtrack.context.createStereoPanner();
  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(frequency, time);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(accent ? 3100 : 2400, time);
  filter.frequency.exponentialRampToValueAtTime(720, time + 0.18);
  panner.pan.value = ((soundtrack.step % 5) - 2) * 0.12;
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(accent ? 0.075 : 0.052, time + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.24);
  oscillator.connect(filter).connect(gain).connect(panner).connect(soundtrack.master);
  oscillator.start(time);
  oscillator.stop(time + 0.25);
}

function scheduleBass(soundtrack: Soundtrack, frequency: number, time: number) {
  const oscillator = soundtrack.context.createOscillator();
  const filter = soundtrack.context.createBiquadFilter();
  const gain = soundtrack.context.createGain();
  oscillator.type = "sawtooth";
  oscillator.frequency.setValueAtTime(frequency, time);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(620, time);
  filter.Q.value = 1.2;
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(0.055, time + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + STEP_DURATION * 3.3);
  oscillator.connect(filter).connect(gain).connect(soundtrack.master);
  oscillator.start(time);
  oscillator.stop(time + STEP_DURATION * 3.4);
}

function scheduleStep(soundtrack: Soundtrack) {
  const step = soundtrack.step % 16;
  const time = soundtrack.nextStepAt;
  const quarter = step % 4 === 0;
  if (quarter) {
    scheduleKick(soundtrack, time);
    scheduleBass(soundtrack, bass[Math.floor(step / 4)], time);
  }
  if (step === 4 || step === 12) scheduleClap(soundtrack, time);
  if (step % 2 === 0) scheduleHat(soundtrack, time, step === 14);
  if (![3, 7, 11, 15].includes(step)) schedulePluck(soundtrack, arp[step], time, quarter);
  soundtrack.step += 1;
  soundtrack.nextStepAt += STEP_DURATION;
}

function createSoundtrack() {
  const context = new AudioContext();
  const master = context.createGain();
  const compressor = context.createDynamicsCompressor();
  const color = context.createBiquadFilter();
  master.gain.value = 0.34;
  color.type = "lowpass";
  color.frequency.value = 8800;
  compressor.threshold.value = -18;
  compressor.knee.value = 18;
  compressor.ratio.value = 4;
  compressor.attack.value = 0.008;
  compressor.release.value = 0.16;
  master.connect(color).connect(compressor).connect(context.destination);

  const soundtrack: Soundtrack = {
    context,
    master,
    nextStepAt: context.currentTime + 0.06,
    step: 0,
    scheduler: 0,
    noise: createNoiseBuffer(context),
  };

  soundtrack.scheduler = window.setInterval(() => {
    while (soundtrack.nextStepAt < soundtrack.context.currentTime + LOOK_AHEAD_SECONDS) scheduleStep(soundtrack);
  }, 25);
  return soundtrack;
}

export function useSiteSoundtrack() {
  const soundtrackRef = useRef<Soundtrack | null>(null);
  const [enabled, setEnabled] = useState(false);

  async function enable() {
    if (!soundtrackRef.current) soundtrackRef.current = createSoundtrack();
    await soundtrackRef.current.context.resume();
    setEnabled(true);
  }

  async function disable() {
    await soundtrackRef.current?.context.suspend();
    setEnabled(false);
  }

  useEffect(() => () => {
    const soundtrack = soundtrackRef.current;
    if (!soundtrack) return;
    window.clearInterval(soundtrack.scheduler);
    void soundtrack.context.close();
  }, []);

  return { enabled, enable, disable };
}
