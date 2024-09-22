The Workbench Project
===

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)


## Author
Yunlong Lian


## Introduction

This project is a work in progress. The purpose is to create a web application front-end to manage a simulation project. The basic idea and functionality follows the Sentaurus Workbench, but the architecture is different in significant ways.

The Workbench Project is intended to be a more general purpose, cloud native simulation project management tool. Here are the main goals for the web application front-end:

+ maintain the flow of simulation stages

+ maintain the table of parameter configurations in each stage

+ display the status of the simulations

+ import and export the simulation configuration data

+ communicate with the simulation server

## Current Status (screenshots)

![](./images/p1.jpeg)

![](./images/p2.jpeg)

![](./images/p3.jpeg)

![](./images/p4.jpeg)


## Feature wishlist

- [ ] Code editor and execution
  - [ ] (!!!) Compose and execute a unit simulation entirely within front-end
  - [x] Integrate [monaco-editor](https://github.com/react-monaco-editor/react-monaco-editor)
  - [x] UI as a calculator for immediate verification (python console at bottom)

- [ ] Core data structure
  - [ ]  (!!!) Tool dependency and flow
    - [ ] DAG
    - [ ] Parallel execution of simulation tasks
  - [ ] Tree of parameters (to fold the table)
  - [x] Project manager: `SimulationProject`

- [ ] UI component style
  - [x] Use [ReactGrid](https://reactgrid.com/)
  - [ ] Consistency
  - [ ] Intelligence

- [ ] Logging
  - [ ] (!!!) Roll-back / undo
  - [ ] Display log for every action from user in system message window
  - [ ] Exporting log
  - [ ] Workspace reconstruction from log
  - [ ] Log as script

- [ ] Folder content explorer
  - [ ] Interact with the simulation server
  - [ ] Investigate file content in an elementary simulation project
  - [ ] Integrate Box-UI [Content Explorer](https://developer.box.com/guides/embed/ui-elements/explorer/)
  - [ ] Integrate [react-file-tree](https://github.com/jossmac/react-file-tree)

- [ ] Control
  - [ ] Strategy for task execution priority

## Demands are welcome

If you have any idea or specific demand, please let me know by opening an issue. 

Urgent demands are prioritized only after you become a patron of the project, or fuck the repo on your own. 
Contact me at yunlong.lian@proton.me for details.

