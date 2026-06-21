import { AppShell } from './ui/AppShell';
import './styles/raytracer.css';

function revealApp(): void {
  document.documentElement.classList.add('app-ready');
}

document.addEventListener('DOMContentLoaded', () => {
  const shell = new AppShell();
  shell.init();

  requestAnimationFrame(() => {
    revealApp();
  });
});