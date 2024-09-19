import React, { useEffect, useState, useRef } from 'react';
import { JSX } from 'react/jsx-runtime';


interface PythonConsoleProps {
    onMessage: (message: string) => void;
}

interface HistoryItem {
    input: string;
    output: string | null;
}

function PythonConsole({
    onMessage
} : PythonConsoleProps) : JSX.Element {
    const [history, setHistory] = useState<HistoryItem[]>([]);

    const [historyIndex, setHistoryIndex] = useState<number>(-1);
    const [currentInput, setCurrentInput] = useState('');
    const [isPyodideReady, setIsPyodideReady] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [history]);

    const loadPyodidePackages = async () => {
        const { pyodide } = window as any;
        await pyodide.loadPackage("micropip");
        await pyodide.runPythonAsync(`
            import micropip
            await micropip.install(['numpy', 'pandas', 'matplotlib']);
        `);
        onMessage("Packages loaded successfully");
    };

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js';
        script.async = true;
        script.onload = async () => {
            try {
                let pyodide = await (window as any).loadPyodide();
                (window as any).pyodide = pyodide;
                if (pyodide) {
                    onMessage("Pyodide loaded successfully");
                    setIsPyodideReady(true);
                }
                await loadPyodidePackages();
                const result = await pyodide.runPythonAsync("import sys; sys.version");
                if (result !== undefined) {
                    setHistory(prev => [...prev, { input: "Python version", output: result.toString() }]);
                }
            } catch (error) {
                onMessage(`Error loading Pyodide or packages: ${error}`);
                setIsPyodideReady(false);
            }
        };
        document.head.appendChild(script);
    
        return () => {
            document.head.removeChild(script);
        };
    }, []);
    

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentInput(event.target.value);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            executeCode(currentInput);
            setHistoryIndex(-1);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (historyIndex < history.length - 1) {
                const newIndex = historyIndex + 1;
                setHistoryIndex(newIndex);
                setCurrentInput(history[history.length - 1 - newIndex].input);
            }
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setCurrentInput(history[history.length - 1 - newIndex].input);
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                setCurrentInput('');
            }
        }
    };

    const executeCode = async (code: string) => {
        if (code.trim() === '') {
            return; // Handle empty inputs
        }
    
        const newHistoryItem: HistoryItem = { input: code, output: null };
        setHistory(prev => [...prev, newHistoryItem]);
        setCurrentInput('');
    
        if (!isPyodideReady) {
            onMessage("Pyodide is still loading. Please wait...");
            return;
        }
    
        try {
            const { pyodide } = window as any;
            const result = await pyodide.runPythonAsync(code);
            setHistory(prev => {
                const updated = [...prev];
                updated[updated.length - 1].output = result !== undefined ? result.toString() : null;
                return updated;
            });
        } catch (error) {
            setHistory(prev => {
                const updated = [...prev];
                updated[updated.length - 1].output = `Error: ${error}`;
                return updated;
            });
        }
    
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };
    

    return (
        <div className="python-console">
            <div className="python-console-history">
                {history.map((item, index) => {
                    if (index === 0) {
                        return (
                            <React.Fragment key={index}>
                                <div>{`${item.input} ${item.output}`}</div>
                            </React.Fragment>)
                    } else if (item.input !== 'Python version') {
                        return (
                            <React.Fragment key={index}>
                                <div>{`>>> ${item.input}`}</div>
                                {item.output !== null && <div>{item.output}</div>}
                            </React.Fragment>)
                    } else {
                        return null;
                    }
                })}
                <div ref={scrollRef} />
            </div>
            <div className="python-console-input">
                <span>{'>>> '}</span>
                <input
                    ref={inputRef}
                    value={currentInput}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                />
            </div>
        </div>
    );
};

export default PythonConsole;
