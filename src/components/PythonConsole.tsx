import React, { useEffect, useState, useRef } from 'react';
import { JSX } from 'react/jsx-runtime';


interface PythonConsoleProps {
    onMessage: (message: string) => void;
}

function PythonConsole({
    onMessage
} : PythonConsoleProps) : JSX.Element {
    const [history, setHistory] = useState<string[]>([]);
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
            let pyodide = await (window as any).loadPyodide();
            (window as any).pyodide = pyodide;
            if (pyodide) {
                onMessage("Pyodide loaded successfully");
                setIsPyodideReady(true);
            }
            await loadPyodidePackages();
            const result = await pyodide.runPythonAsync("import sys; print(sys.version)");
            if (result !== undefined) {
                setHistory(prev => [...prev, result.toString()]);
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
        }
    };

    const executeCode = async (code: string) => {
        setHistory(prev => [...prev, `>>> ${code}`]);
        setCurrentInput('');

        if (!isPyodideReady) {
            onMessage("Pyodide is still loading. Please wait...");
            return;
        }

        try {
            const { pyodide } = window as any;
            const result = await pyodide.runPythonAsync(code);
            if (result !== undefined) {
                setHistory(prev => [...prev, result.toString()]);
            }
        } catch (error) {
            setHistory(prev => [...prev, `Error: ${error}`]);
        }

        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    return (
        <div className="python-console">
            <div className="python-console-history">
                {history.map((line, index) => (
                    <div key={index}>{line}</div>
                ))}
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
