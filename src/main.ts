import { action } from "./constants";
import run from "./lib";

// Runs the action within the GitHub actions environment.
run(action);
