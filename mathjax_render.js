window.MathJax = {
  'fast-preview': {
    disabled: true,
  },
  AuthorInit: () => {
    MathJax.Hub.Register.StartupHook('End', () => {
      MathJax.Hub.processSectionDelay = 0;
      const demoSource = document.getElementById('math-input');
      const demoRendering = document.getElementById('render-output');
      const math = MathJax.Hub.getAllJax('render-output')[0];
      demoSource.addEventListener('input', () => {
        MathJax.Hub.Queue(['Text', math, demoSource.value]);
      });
    });
  },
};
