import React, { useEffect, useState, useRef } from 'react';

const PythonConsole: React.FC = () => {
    const [history, setHistory] = useState<string[]>([]);
    const [currentInput, setCurrentInput] = useState('');
    const [isPyodideReady, setIsPyodideReady] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    
    const loadPyodidePackages = async () => {
        const { pyodide } = window as any;
        await pyodide.loadPackage("micropip");
        await pyodide.runPythonAsync(`
            import micropip
            await micropip.install(['matplotlib', 'numpy'])
        `);
        console.log("Packages loaded successfully");
    };

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://pyscript.net/latest/pyscript.js';
        script.defer = true;
        script.onload = () => {
            const checkPyodide = setInterval(() => {
                if ((window as any).pyodide && (window as any).pyodide.runPython) {
                    setIsPyodideReady(true);
                    clearInterval(checkPyodide);
                    loadPyodidePackages(); // Load packages when Pyodide is ready
                }
            }, 100);
        };
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, []);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        console.log("Input changed:", newValue);
        setCurrentInput(prevInput => {
            console.log("Updating currentInput from", prevInput, "to", newValue);
            return newValue;
        });
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
            setHistory(prev => [...prev, "Pyodide is still loading. Please wait..."]);
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
            <h4>Python Console</h4>
            {React.createElement('py-config', { type: 'json', style: { display: 'none' } }, JSON.stringify({ packages: ["matplotlib", "numpy"] }))}
            <div className="python-console-history">
                {history.map((line, index) => (
                    <div key={index}>{line}</div>
                ))}
                <div>
                    {'>>>'} <input
                        ref={inputRef}
                        value={currentInput}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        disabled={!isPyodideReady}
                        style={{ border: '2px solid red' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default PythonConsole;
