window.config = {
  VERSION: '<%= pkg.version %>' || '',
  DEMO: Boolean('<%= process.env.DEMO %>') || true,
  DEMO_DELAY: Number('<%= process.env.DEMO_DELAY %>') || 0
};