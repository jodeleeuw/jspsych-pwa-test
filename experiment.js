// Initialize jsPsych with offline storage
const jsPsych = jsPsychOfflineStorage.initJsPsychOffline({
  display_element: "jspsych-target",
});

// Preload any assets
const preloadTrial = {
  type: jsPsychPreload,
  images: [],
};

// Welcome screen
const welcome = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <h1>Welcome to the experiment!</h1>
    <p>This is an offline jsPsych experiment that saves data locally on your device.</p>
    <p>Press the button below to begin.</p>
  `,
  choices: ["Continue"],
};

// Instructions
const instructions = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <h2>Instructions</h2>
    <p>You will be presented with a series of stimuli.</p>
    <p>Press <strong>A</strong> if you see the letter A.</p>
    <p>Press <strong>B</strong> if you see the letter B.</p>
    <p>Try to respond as quickly and accurately as possible.</p>
  `,
  choices: ["Start"],
};

// Test trials
const testStimuli = [
  { stimulus: "A", correct_response: 0 },
  { stimulus: "B", correct_response: 1 },
  { stimulus: "A", correct_response: 0 },
  { stimulus: "B", correct_response: 1 },
];

const testTrial = {
  type: jsPsychHtmlButtonResponse,
  stimulus: () => {
    return `<div style="font-size: 60px;">${jsPsych.evaluateTimelineVariable("stimulus")}</div>`;
  },
  choices: ["A", "B"],
  data: {
    task: "response",
    correct_response: jsPsych.evaluateTimelineVariable("correct_response"),
  },
  on_finish: (data) => {
    data.correct = data.response === data.correct_response;
  },
};

const testProcedure = {
  timeline: [testTrial],
  timeline_variables: testStimuli,
  randomize_order: true,
};

// Debrief
const debrief = {
  type: jsPsychHtmlButtonResponse,
  stimulus: () => {
    const trials = jsPsych.data.get().filter({ task: "response" });
    const correct_trials = trials.filter({ correct: true });

    // Guard against zero-count
    const trialCount = trials.count();
    const accuracy = trialCount > 0 ? Math.round((correct_trials.count() / trialCount) * 100) : 0;
    const rt = correct_trials.count() > 0 ? Math.round(correct_trials.select("rt").mean()) : 0;

    return `
      <h2>You're done!</h2>
      <p>Your accuracy: <strong>${accuracy}%</strong></p>
      <p>Your average response time: <strong>${rt}ms</strong></p>
      <p>Press the button below to complete the experiment.</p>
    `;
  },
  choices: ["Finish"],
};

// Create timeline
const timeline = [preloadTrial, welcome, instructions, testProcedure, debrief];

// Run experiment
jsPsych.run(timeline);
