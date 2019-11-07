import * as core from '@actions/core';
import {init, deploy} from './git';

/** Initializes and runs the action. */
(async function() {
  try {
    // Initializes the action.
    await init();
    await deploy();
  } catch (error) {
    core.setFailed(error.message);
  } finally {
    console.log('Completed Deployment');
  }
})();
