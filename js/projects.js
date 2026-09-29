/*
  PROJECT CONTENT
  Edit this list when you want to add or update a project.
  Keep the slug unique because it is used in the project URL hash.
*/

const projects = [
  {
    title: 'Earrings Project', slug: 'earrings-project', category: 'personal',
    type: 'Personal Website', image: 'earrings', previewImage: 'assets/earrings-project-preview.png', featured: true,
    description: 'A personal visual website for an earrings project, combining product presentation with a simple interactive experience.',
    liveUrl: 'https://heaven0318.github.io/earrings-project-2/',
    technologies: ['HTML', 'CSS', 'JavaScript', 'MP3 asset'],
    features: ['Visual product presentation', 'Custom styling', 'JavaScript interactions', 'Audio asset'],
    idea: 'I wanted to turn an earrings concept into a complete website using a focused visual style and interactive details.',
    process: 'I built the page structure with HTML, styled the visual presentation with CSS, and used JavaScript for the interactive behavior. The project also includes an MP3 file as a media asset.',
    challenges: 'Balancing the visual presentation with a clear and usable layout.',
    result: 'A working personal website that presents the earrings project as an interactive digital experience.',
    reflection: 'This project helped me practice combining structure, styling, behavior, and media in one website.'
  },
  {
    title: 'WebSteps', slug: 'websteps', category: 'school web development',
    type: 'School Project', image: 'websteps', previewImage: 'assets/websteps-preview.png',
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
