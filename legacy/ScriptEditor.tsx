import { useEffect, useRef } from 'react';

interface ScriptEditorProps {
    tool: string;
    script: string;
    language: string;
    onSave: (tool: string, script: string, language: string) => void;
    onClose: () => void;
}

interface SaveScriptMessage {
    type: 'SAVE_SCRIPT';
    tool: string;
    script: string;
    language: string;
}

export function ScriptEditor({
    tool, 
    script, 
    language, 
    onSave, 
    onClose
}: ScriptEditorProps) {
    const editorRef = useRef<Window | null>(null);

    useEffect(() => {
        const editorWindow = window.open('', 'Script Editor', 'width=800,height=600');
        editorRef.current = editorWindow;

        if (editorWindow) {
            editorWindow.document.write(`
                <html>
                    <head>
                        <title>Edit Script for ${tool}</title>
                        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/atom-one-dark.min.css">
                        <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js"></script>
                        <style>
                            body { font-family: Arial, sans-serif; background-color: #1e1e1e; color: #d4d4d4; }
                            #scriptEditor { width: 100%; height: 60vh; background-color: #2d2d2d; color: #d4d4d4; border: 1px solid #3c3c3c; }
                            #highlightedCode { width: 100%; height: 60vh; overflow: auto; background-color: #282c34; }
                            select, button { margin: 10px 0; padding: 5px; background-color: #3c3c3c; color: #d4d4d4; border: none; }
                            button:hover { background-color: #4c4c4c; }
                        </style>
                    </head>
                    <body>
                        <h2>Edit Script for ${tool}</h2>
                        <select id="languageSelect" onchange="updateHighlight()">
                            <option value="python" ${language === 'python' ? 'selected' : ''}>Python</option>
                            <option value="julia" ${language === 'julia' ? 'selected' : ''}>Julia</option>
                            <option value="tcl" ${language === 'tcl' ? 'selected' : ''}>Tcl</option>
                            <option value="bash" ${language === 'bash' ? 'selected' : ''}>Bash</option>
                        </select>
                        <textarea id="scriptEditor" oninput="updateHighlight()">${script}</textarea>
                        <pre><code id="highlightedCode"></code></pre>
                        <button onclick="saveScript()">Save</button>
                        <button onclick="window.close()">Cancel</button>
                        <script>
                            function updateHighlight() {
                                const code = document.getElementById('scriptEditor').value;
                                const language = document.getElementById('languageSelect').value;
                                const highlightedCode = hljs.highlight(code, {language: language}).value;
                                document.getElementById('highlightedCode').innerHTML = highlightedCode;
                            }
                            function saveScript() {
                                const script = document.getElementById('scriptEditor').value;
                                const language = document.getElementById('languageSelect').value;
                                window.opener.postMessage({ type: 'SAVE_SCRIPT', tool: '${tool}', script: script, language: language }, '*');
                                window.close();
                            }
                            function handleTabKey(e) {
                                if (e.key === 'Tab') {
                                    e.preventDefault();
                                    const start = this.selectionStart;
                                    const end = this.selectionEnd;
                                    const spaces = '    ';
                                    this.value = this.value.substring(0, start) + spaces + this.value.substring(end);
                                    this.selectionStart = this.selectionEnd = start + spaces.length;
                                    updateHighlight();
                                }
                            }
                            const scriptEditor = document.getElementById('scriptEditor');
                            scriptEditor.addEventListener('keydown', handleTabKey);
                            hljs.highlightAll();
                            updateHighlight();
                        </script>
                    </body>
                </html>
            `);
        }

        const handleMessage = (event: MessageEvent) => {
            const data = event.data as SaveScriptMessage;
            if (data.type === 'SAVE_SCRIPT') {
                onSave(data.tool, data.script, data.language);
            }
        };

        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
            if (editorRef.current) {
                editorRef.current.close();
            }
        };
    }, [tool, script, language, onSave]);

    return (
        <div className="script-editor-overlay">
            <div className="script-editor-content">
                {/* ... existing content ... */}
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
}
