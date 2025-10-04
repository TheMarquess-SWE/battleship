import './global.css';
import AppController from './controllers/AppController/AppController.js';
import ScreenController from './controllers/ScreenController.js';

const screenController = new ScreenController();
const app = new AppController(screenController);

app.init();
