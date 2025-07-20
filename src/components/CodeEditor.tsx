import { useState, useEffect, useRef } from 'react';
import { Play, Download, RotateCcw, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EditorProps {
  initialHtml?: string;
  initialCss?: string;
  initialJs?: string;
}

const CodeEditor = ({ 
  initialHtml = '<h1>Hello World!</h1>\n<p>Welcome to the code editor</p>',
  initialCss = 'body {\n  font-family: Arial, sans-serif;\n  margin: 20px;\n  background: #f5f5f5;\n}\n\nh1 {\n  color: #333;\n  text-align: center;\n}',
  initialJs = '// Add your JavaScript here\nconsole.log("Hello from JavaScript!");'
}: EditorProps) => {
  const [html, setHtml] = useState(initialHtml);
  const [css, setCss] = useState(initialCss);
  const [js, setJs] = useState(initialJs);
  const [output, setOutput] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const runCode = () => {
    const combinedCode = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Output</title>
        <style>
          ${css}
        </style>
      </head>
      <body>
        ${html}
        <script>
          // Capture console.log
          const originalLog = console.log;
          console.log = function(...args) {
            originalLog.apply(console, args);
            window.parent.postMessage({
              type: 'console',
              data: args.join(' ')
            }, '*');
          };

          try {
            ${js}
          } catch (error) {
            window.parent.postMessage({
              type: 'error',
              data: error.message
            }, '*');
          }
        </script>
      </body>
      </html>
    `;
    
    setOutput(combinedCode);
  };

  const resetCode = () => {
    setHtml(initialHtml);
    setCss(initialCss);
    setJs(initialJs);
  };

  const downloadCode = () => {
    const combinedCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Project</title>
  <style>
    ${css}
  </style>
</head>
<body>
  ${html}
  <script>
    ${js}
  </script>
</body>
</html>`;

    const blob = new Blob([combinedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    runCode();
  }, [html, css, js]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'console') {
        console.log('Output:', event.data.data);
      } else if (event.data.type === 'error') {
        console.error('Error:', event.data.data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Github className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Code Editor</h1>
              <p className="text-sm text-muted-foreground">Write HTML, CSS, and JavaScript code with live preview</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={runCode} className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Run
            </Button>
            <Button onClick={resetCode} variant="outline" className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button onClick={downloadCode} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-120px)]">
        {/* Code Editors */}
        <div className="w-1/2 border-r border-border">
          <Tabs defaultValue="html" className="h-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-muted/30">
              <TabsTrigger value="html" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                HTML
              </TabsTrigger>
              <TabsTrigger value="css" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                CSS
              </TabsTrigger>
              <TabsTrigger value="js" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                JavaScript
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="html" className="h-[calc(100%-48px)] m-0">
              <textarea
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                className="w-full h-full p-4 bg-editor-bg text-editor-text font-mono text-sm resize-none border-0 outline-0"
                placeholder="Enter your HTML code here..."
                style={{ fontFamily: 'Monaco, "Cascadia Code", "Segoe UI Mono", "Roboto Mono", Consolas, "Courier New", monospace' }}
              />
            </TabsContent>
            
            <TabsContent value="css" className="h-[calc(100%-48px)] m-0">
              <textarea
                value={css}
                onChange={(e) => setCss(e.target.value)}
                className="w-full h-full p-4 bg-editor-bg text-editor-text font-mono text-sm resize-none border-0 outline-0"
                placeholder="Enter your CSS code here..."
                style={{ fontFamily: 'Monaco, "Cascadia Code", "Segoe UI Mono", "Roboto Mono", Consolas, "Courier New", monospace' }}
              />
            </TabsContent>
            
            <TabsContent value="js" className="h-[calc(100%-48px)] m-0">
              <textarea
                value={js}
                onChange={(e) => setJs(e.target.value)}
                className="w-full h-full p-4 bg-editor-bg text-editor-text font-mono text-sm resize-none border-0 outline-0"
                placeholder="Enter your JavaScript code here..."
                style={{ fontFamily: 'Monaco, "Cascadia Code", "Segoe UI Mono", "Roboto Mono", Consolas, "Courier New", monospace' }}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Output Preview */}
        <div className="w-1/2 flex flex-col">
          <div className="bg-muted/30 px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold">Output</h3>
          </div>
          <div className="flex-1 bg-output-bg">
            <iframe
              ref={iframeRef}
              srcDoc={output}
              className="w-full h-full border-0"
              title="Output Preview"
              sandbox="allow-scripts"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;