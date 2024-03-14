import { ThemeProvider } from "@/components/ThemeProvider";
import Page from "./Page";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Page />
    </ThemeProvider>
  );
}

export default App;
