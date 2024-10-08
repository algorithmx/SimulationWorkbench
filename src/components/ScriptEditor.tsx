import Editor from "@monaco-editor/react";
import {useState, useEffect} from "react";

interface ScriptEditorProps {
    tool: string;
    script: string;
    language: string;
    onSave: (toolName: string, newScript: string, newLanguage: string) => void;
    onClose: () => void;
}

export function ScriptEditor({
    tool, 
    script, 
    language, 
    onSave,
    onClose
}: ScriptEditorProps) {
    const [currentScript, setCurrentScript] = useState(script);

    const handleEditorChange = (value: string | undefined) => {
        if (value !== undefined) {
            setCurrentScript(value);
        }
    };

    const handleSave = () => {
        onSave(tool, currentScript, language);
    };

    const handleClose = () => {
        onSave(tool, currentScript, language);
        onClose();
    };

    const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        onSave(tool, currentScript, event.target.value);
    };

    return (
        <div className="script-editor-overlay">
            <div className="script-editor-content">
                <h2>Edit Script for {tool}</h2>
                <select value={language} onChange={handleLanguageChange}>
                    <option value="python">Python</option>
                    <option value="tcl">Tcl</option>
                </select>
                <Editor
                    height="60vh"
                    defaultLanguage={language}
                    value={currentScript}
                    theme="vs-dark"
                    onChange={handleEditorChange}
                    options={{
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontSize: 14,
                    }}
                />
                <button onClick={handleSave}>Save</button>
                <button onClick={handleClose}>Close</button>
            </div>
        </div>
    );
}