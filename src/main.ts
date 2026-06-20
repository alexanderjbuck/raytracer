import { RayTracerApp } from './app/RayTracerApp';
import './styles/raytracer.css';

document.addEventListener('DOMContentLoaded', () => {
  const app = new RayTracerApp({ containerId: 'screen' });
  app.start();
});