import OffCanvasNav from './components/off-canvas/index.js'
import Toggles from './components/toggles/index.js'
import { validator, DirtyInput } from './components/field/index.js'

/* eslint-disable-next-line */
const app = {
  nav: new OffCanvasNav()
}

// Initialize Toggles.
Toggles.init()

// Initialize form validation.
app.validator = validator()
DirtyInput.init()
