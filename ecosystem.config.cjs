module.exports = {
  apps: [
    {
      name: 'bblbp-creation-rework',
      script: 'npm',
      args: 'start',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
