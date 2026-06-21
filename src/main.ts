import { DungeonApp } from './app/DungeonApp';
import './styles/raytracer.css';

function revealApp(): void {
  document.documentElement.classList.add('app-ready');
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new DungeonApp();
  app.init();

  requestAnimationFrame(() => {
    revealApp();
  });
});