import { DesktopOS } from './components/desktop/DesktopOS';
import { ThemeProvider } from './components/theme-provider';
import './App.css';

// Initialize Firebase
import './firebase-init';

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <DesktopOS />
    </ThemeProvider>
  );
}

export default App;
