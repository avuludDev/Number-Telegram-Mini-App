import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Buffer } from 'buffer';
import './i18'; 
// @ts-ignore
window.Buffer = Buffer;

createRoot(document.getElementById('root')).render(<App />)
