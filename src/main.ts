import { DungeonApp } from './app/DungeonApp';
import './styles/raytracer.css';

document.addEventListener('DOMContentLoaded', () => {
  const app = new DungeonApp();
  app.init();
});