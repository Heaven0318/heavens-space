/*
  PROJECT CONTENT
  Edit this list when you want to add or update a project.
  Keep the slug unique because it is used in the project URL hash.
*/

const projects = [
  {
    title: 'Earrings Project', slug: 'earrings-project', category: 'personal',
    type: 'Personal Website', image: 'earrings', previewImage: 'assets/earrings-project-preview.png', previewWidth: 1919, previewHeight: 991, featured: true,
    description: 'A cinematic lyric player for Malcolm Todd’s “Earrings,” pairing an included audio track with timed lyrics and animated word reveals.',
    liveUrl: 'https://heaven0318.github.io/earrings-project-2/',
    technologies: ['HTML', 'CSS', 'Vanilla JavaScript', 'HTML Audio API', 'Canvas'],
    features: ['Approximate line-timed lyrics with progressive word reveals', 'Play, pause, restart, seek, volume, and mute controls', 'Click a lyric line or browse the full lyrics to jump through the track', 'Persistent light and dark themes', 'Canvas grain and subtle pointer parallax', 'Keyboard shortcuts and responsive playback controls'],
    idea: 'I wanted to make listening feel visual, with typography that follows the song and playback controls that stay close at hand.',
    process: 'I use the browser audio clock to find the active lyric line, then reveal its words progressively. Plain JavaScript also powers the player, lyric seeking, full-lyrics view, saved theme, and ambient canvas effects.',
    challenges: 'Keeping lyric timing and the active line consistent through pauses, restarts, and seeks. The hand-tuned lyric timestamps are estimates and can be refined against the recording.',
    result: 'A responsive, single-page music experience with an animated lyric stage, custom audio controls, and an atmospheric visual treatment.',
    reflection: 'This project let me bring timed media, animated typography, accessible controls, and responsive styling together without a framework.'
  },
  {
    title: 'WebSteps', slug: 'websteps', category: 'school web development',
    type: 'School Project', image: 'websteps', previewImage: 'assets/websteps-preview.png', previewWidth: 1919, previewHeight: 993,
    description: 'An interactive learning roadmap for HTML, CSS, and JavaScript, with guided lessons, hands-on projects, quizzes, and progress tracking.',
    liveUrl: 'https://heaven0318.github.io/WebSteps/',
    sourceUrl: 'https://github.com/Heaven0318/WebSteps',
    technologies: ['HTML', 'CSS', 'JavaScript', 'IndexedDB'],
    features: ['16 modules and 48 lessons', 'In-browser code playground and preview', 'Guided projects and quizzes', 'Local progress tracking and backup'],
    idea: 'Make learning web development feel like a clear, practical journey from the basics to building and publishing projects.',
    process: 'I organized the curriculum into a roadmap and built interactive lessons, a code playground, quizzes, and project checks so learners can practice as they progress.',
    challenges: 'Bringing lessons, editable code, feedback, and progress tracking together in one easy-to-follow experience.',
    result: 'A browser-based learning app that lets visitors work through web development lessons and build projects at their own pace.',
    reflection: 'WebSteps combines teaching and development by turning web concepts into exercises people can try directly in the browser.'
  }
];
