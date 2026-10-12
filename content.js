(() => {
  const DEFAULTS = {
    enabled: true,
    dry: 1.0,
    reverbMix: 0.35,
    reverbDecay: 2.5,
    reverbDamping: 0.5,
    echoMix: 0.35,
    echoTime: 0.3,
    echoFeedback: 0.4,
    bass: 0,
    bassFreq: 120
  };

  let settings = { ...DEFAULTS };
  const graphs = new WeakMap();
  let irTimer = null;

  function makeImpulse(ctx, seconds, damping) {
    const rate = ctx.sampleRate;
    const length = Math.max(1, Math.floor(rate * seconds));
    const buffer = ctx.createBuffer(2, length, rate);
    for (let channel = 0; channel < 2; channel += 1) {
      const data = buffer.getChannelData(channel);
      let last = 0;
      const lowPassAmount = 1 - damping * 0.9;
      for (let i = 0; i < length; i += 1) {
        const noise = Math.random() * 2 - 1;
        last += lowPassAmount * (noise - last);
        data[i] = last * Math.pow(1 - i / length, 3);
      }
    }
    return buffer;
  }

  function buildGraph(video) {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const source = ctx.createMediaElementSource(video);
    const dry = ctx.createGain();
    const master = ctx.createGain();
    const delay = ctx.createDelay(5.0);
    const feedback = ctx.createGain();
    const echoWet = ctx.createGain();
    const convolver = ctx.createConvolver();
    const reverbWet = ctx.createGain();
    const bass = ctx.createBiquadFilter();

    source.connect(dry).connect(master);
    source.connect(delay);
    delay.connect(feedback).connect(delay);
    delay.connect(echoWet).connect(master);
    source.connect(convolver);
    convolver.connect(reverbWet).connect(master);

    bass.type = 'lowshelf';
    master.connect(bass).connect(ctx.destination);

    const graph = { ctx, bass, dry, delay, feedback, echoWet, convolver, reverbWet, irKey: '' };
    graphs.set(video, graph);

    const resume = () => {
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    };
    video.addEventListener('play', resume);
    document.addEventListener('click', resume, { once: true });
    return graph;
  }

  function apply(video) {
    const graph = graphs.get(video) || buildGraph(video);
    const now = graph.ctx.currentTime;
    const enabled = settings.enabled;
    const setGain = (node, value) => node.gain.setTargetAtTime(value, now, 0.03);

    setGain(graph.dry, enabled ? settings.dry : 1);
    setGain(graph.echoWet, enabled ? settings.echoMix : 0);
    setGain(graph.reverbWet, enabled ? settings.reverbMix : 0);
    graph.delay.delayTime.setTargetAtTime(settings.echoTime, now, 0.03);
    graph.feedback.gain.setTargetAtTime(Math.min(settings.echoFeedback, 0.9), now, 0.03);
    graph.bass.gain.setTargetAtTime(enabled ? settings.bass : 0, now, 0.03);
    graph.bass.frequency.setTargetAtTime(settings.bassFreq, now, 0.03);

    const impulseKey = `${settings.reverbDecay}|${settings.reverbDamping}`;
    if (impulseKey !== graph.irKey) {
      graph.irKey = impulseKey;
      clearTimeout(irTimer);
      irTimer = setTimeout(() => {
        graph.convolver.buffer = makeImpulse(graph.ctx, settings.reverbDecay, settings.reverbDamping);
      }, 150);
    }
  }

  function applyAll() {
    document.querySelectorAll('video').forEach((video) => {
      try { apply(video); } catch (error) { console.warn('[Equalizer Extension]', error); }
    });
  }

  chrome.storage.sync.get(DEFAULTS, (stored) => {
    settings = { ...DEFAULTS, ...stored };
    applyAll();
  });

  chrome.storage.onChanged.addListener((changes) => {
    Object.keys(changes).forEach((key) => { settings[key] = changes[key].newValue; });
    applyAll();
  });

  // YouTube is a single-page application: videos can appear without a reload.
  new MutationObserver(applyAll).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
