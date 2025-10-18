// Initialize jsPsych with offline storage (existing project provides jsPsychOfflineStorage)
const jsPsych = jsPsychOfflineStorage ? jsPsychOfflineStorage.initJsPsychOffline() : initJsPsych();

// --- Helper: shape HTML generators ---
const shapeSize = 80;
const circleHtml = `<div style="width:${shapeSize}px;height:${shapeSize}px;border-radius:50%;background:#333;margin:0 auto;"></div>`;
const squareHtml = `<div style="width:${shapeSize}px;height:${shapeSize}px;background:#333;margin:0 auto;"></div>`;
const triangleHtml = `<div style="width:0;height:0;border-left:${shapeSize/2}px solid transparent;border-right:${shapeSize/2}px solid transparent;border-bottom:${shapeSize}px solid #333;margin:0 auto;"></div>`;
const diamondHtml = `<div style="width:${shapeSize}px;height:${shapeSize}px;background:#333;transform:rotate(45deg);margin:0 auto;"></div>`;

const shapesMaster = [
  { id: 'circle', html: circleHtml },
  { id: 'square', html: squareHtml },
  { id: 'triangle', html: triangleHtml },
  { id: 'diamond', html: diamondHtml },
];

// Instructions (touch-friendly)
const welcome = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <h1>Find the circle</h1>
    <p>On each trial you'll see four shapes. One of them is a circle.</p>
    <p>Your task is to TAP the circle as quickly and accurately as possible.</p>
  `,
  choices: ['Start']
};

// Generate trials: shuffle positions each trial, keep exactly one circle
const numTrials = 6;
const trials = [];
for (let i = 0; i < numTrials; i++) {
  // create a shallow copy and shuffle
  const shuffled = jsPsych.randomization.shuffle(shapesMaster.slice());
  const choicesHtml = shuffled.map(s => s.html);
  const correctIndex = shuffled.findIndex(s => s.id === 'circle');

  const trial = {
    type: jsPsychHtmlButtonResponse,
    // note: stimulus is decorative here; buttons themselves are rendered by the plugin
    stimulus: '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;justify-items:center;align-items:center;padding:10px;"></div>',
    // jsPsychHtmlButtonResponse will insert each choice HTML into the button template
    choices: choicesHtml,
    // modern jsPsych accepts a function for button_html(choice) -> html
    button_html: function(choice) {
      return `<button class="jspsych-btn" style="width:140px;height:140px;border:none;background:transparent;padding:0">${choice}</button>`;
    },
    data: {
      task: 'shape_choice',
      correct_index: correctIndex,
    },
    trial_duration: 3000,
    on_finish: (data) => {
      // data.response is the button index (0-based) or null if timed out
      data.correct = data.response !== null && data.response === data.correct_index;
      // normalize response to -1 when no response for easier later analysis
      if (data.response === null) data.response = -1;
    }
  };

  trials.push(trial);

  // brief feedback after each trial
  trials.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function() {
      const last = jsPsych.data.get().last(1).values()[0];
      if (!last) return '';
      if (last.response === -1) return '<div style="font-size:24px;">No response recorded</div>';
      return last.correct ? '<div style="font-size:24px;color:green;">Correct</div>' : '<div style="font-size:24px;color:red;">Incorrect</div>';
    },
    choices: 'NO_KEYS',
    trial_duration: 600,
  });
}

// Debrief / summary
const debrief = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: () => {
    const trialsData = jsPsych.data.get().filter({ task: 'shape_choice' });
    const valid = trialsData.filter(trial => trial.response !== -1);
    const correct = trialsData.filter({ correct: true });
    const accuracy = trialsData.count() > 0 ? Math.round((correct.count() / trialsData.count()) * 100) : 0;
    const meanRt = valid.count() > 0 ? Math.round(valid.select('rt').mean()) : 'N/A';

    return `
      <h2>Finished</h2>
      <p>Accuracy: <strong>${accuracy}%</strong></p>
      <p>Average RT (for responded trials): <strong>${meanRt} ms</strong></p>
    `;
  },
  choices: ['End Experiment'],
  on_finish: () => {
    // Redirect back to index so the user can restart or manage data
    try {
      window.location.href = './';
    } catch (e) {
      // If running in a worker-less environment or unusual embed, ignore
      console.warn('Redirect to index failed', e);
    }
  },
};

// Assemble timeline and run
const timeline = [welcome].concat(trials, [debrief]);

jsPsych.run(timeline);
