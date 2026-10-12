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

const PRESETS = {
  hall: { reverbMix: 0.7, reverbDecay: 3.5, reverbDamping: 0.4, echoMix: 0.1, echoTime: 0.25, echoFeedback: 0.2 },
  cave: { reverbMix: 0.9, reverbDecay: 6.5, reverbDamping: 0.7, echoMix: 0.4, echoTime: 0.6, echoFeedback: 0.5 },
  slap: { reverbMix: 0.05, reverbDecay: 0.6, reverbDamping: 0.3, echoMix: 0.6, echoTime: 0.12, echoFeedback: 0.25 },
  space: { reverbMix: 1.0, reverbDecay: 8, reverbDamping: 0.3, echoMix: 0.5, echoTime: 0.75, echoFeedback: 0.7 },
  bass: { bass: 10, bassFreq: 100 },
  daily: { dry: 1.0, reverbMix: 0.2, reverbDecay: 1.5, reverbDamping: 0.5, echoMix: 0, echoTime: 0.3, echoFeedback: 0.2, bass: 3, bassFreq: 120 },
  music: { dry: 1.0, reverbMix: 0.5, reverbDecay: 3, reverbDamping: 0.4, echoMix: 0.15, echoTime: 0.25, echoFeedback: 0.2, bass: 5, bassFreq: 100 },
  mosque: { dry: 1.0, reverbMix: 0.6, reverbDecay: 4, reverbDamping: 0.5, echoMix: 0.1, echoTime: 0.35, echoFeedback: 0.2, bass: 0, bassFreq: 120 },
  big: { dry: 0.9, reverbMix: 0.4, reverbDecay: 2.5, reverbDamping: 0.6, echoMix: 0.25, echoTime: 0.3, echoFeedback: 0.4, bass: 8, bassFreq: 80 },
  reset: DEFAULTS
};

const sliderKeys = Object.keys(DEFAULTS).filter((key) => key !== 'enabled');
const keysWithOneDecimal = new Set(['bass', 'bassFreq']);

function render(settings) {
  document.getElementById('enabled').checked = settings.enabled;
  sliderKeys.forEach((key) => {
    document.getElementById(key).value = settings[key];
    updateValue(key, settings[key]);
  });
}

function updateValue(key, value) {
  const decimals = keysWithOneDecimal.has(key) ? 1 : 2;
  document.getElementById(`${key}-value`).textContent = Number(value).toFixed(decimals);
}

chrome.storage.sync.get(DEFAULTS, render);

document.getElementById('enabled').addEventListener('change', (event) => {
  chrome.storage.sync.set({ enabled: event.target.checked });
});

sliderKeys.forEach((key) => {
  document.getElementById(key).addEventListener('input', (event) => {
    const value = Number(event.target.value);
    updateValue(key, value);
    chrome.storage.sync.set({ [key]: value });
  });
});

document.querySelectorAll('[data-preset]').forEach((button) => {
  button.addEventListener('click', () => {
    chrome.storage.sync.set(PRESETS[button.dataset.preset], () => {
      chrome.storage.sync.get(DEFAULTS, render);
    });
  });
});
