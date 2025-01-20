import { GemeenteNijmegenCdkApp } from '@gemeentenijmegen/projen-project-type';
const project = new GemeenteNijmegenCdkApp({
  cdkVersion: '2.1.0',
  defaultReleaseBranch: 'main',
  // depsUpgradeOptions: {
  //   workflowOptions: {
  //     branches: ['acceptance'],
  //     labels: ['auto-merge'],
  //   },
  // },
  deps: [
    '@gemeentenijmegen/utils',
  ],
  devDeps: [
    '@gemeentenijmegen/projen-project-type',
    'dotenv',
  ],
  name: 'verzoekservice-werk-en-inkomen',
  projenrcTs: true,
  gitignore: [
    '**/output', // will ignore all output folders and everything in them
  ],
  jestOptions: {
    jestConfig: {
      setupFiles: ['dotenv/config'],
      roots: ['test', 'src'],
    },
  },
});
project.synth();