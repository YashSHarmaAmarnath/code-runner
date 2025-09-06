"use client";

import { useState, useRef } from "react";
import { Editor } from "@monaco-editor/react";
import {
  CodeXml,
  Settings,
  Sun,
  Moon,
  FileTerminal,
  Plus,
  Text,
  Play,
  Hourglass,
  Terminal,
  FileInput,
  Lightbulb,
  Trash2,
} from "lucide-react";

function App() {
  const baseUrl = "http://localhost:5000/run/";
  const [lang, setLang] = useState("python");
  const [theme, setTheme] = useState("vs-dark");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [showOutput, setShowOutput] = useState(false);
  // const [outputExpanded, setOutputExpanded] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [showSettings, setShowSettings] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);
  const [minimap, setMinimap] = useState(true);
  const [lineNumbers, setLineNumbers] = useState(true);
  const [currentFile, setCurrentFile] = useState("main");
  const [files, setFiles] = useState({
    main: "",
  });
  const [error, setError] = useState("");
  const [userInput, setUserInput] = useState("");
  const [showInput, setShowInput] = useState(false);
  const editorRef = useRef(null);
  const [outputColor, setOutputColor] = useState("#28a745");

  const languages = [
    {
      id: "python",
      name: "Python",
      icon: (
        <img
          src="https://cdn-icons-png.flaticon.com/128/5968/5968350.png"
          alt="Python Icon"
          style={{ width: "24px", height: "24px" }}
        />
      ),
      defaultCode: '# Python code\nprint("Hello, Python!")\n',
    },
    {
      id: "java",
      name: "Java",
      icon: (
        <img
          src="https://cdn-icons-png.flaticon.com/512/226/226777.png"
          alt="Java Icon"
          style={{ width: "24px", height: "24px" }}
        />
      ),
      defaultCode:
        '// Java code\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, Java!");\n    }\n}',
    },
    {
      id: "cpp",
      name: "C++",
      // icon: "⚡",
      icon: (
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/ISO_C%2B%2B_Logo.svg/1822px-ISO_C%2B%2B_Logo.svg.png"
          alt="CPP Icon"
          style={{ width: "24px", height: "24px" }}
        />
      ),
      defaultCode:
        '// C++ code\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, C++!" << endl;\n    return 0;\n}',
    },
  ];

  const handleLanguageChange = (newLang, defaultCode) => {
    setLang(newLang);
    setCode(defaultCode);
    setFiles((prev) => ({ ...prev, [currentFile]: defaultCode }));
  };

  const toggleTheme = () => {
    setTheme(theme === "vs-dark" ? "light" : "vs-dark");
  };

  const handleRun = async () => {
    setIsRunning(true);
    setShowOutput(true);
    setOutput("");

    const timestamp = new Date().toLocaleString();
    const url = baseUrl + lang;
    const payload = {
      code: code,
      input: userInput, // Send user input along with code
    };

    console.log(url);
    console.log(code);
    console.log(`[${timestamp}] Starting execution...`);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log(data);
      if (data && data.stderr) {
        setOutputColor("#e46962");
        setError(data.stderr);
        setOutput(data.stderr);
        // alert(error);
      } else if (data && data.error) {
        setOutputColor("#e46962");
        setOutput(data.error);
      } else if (data && typeof data.stdout !== "undefined") {
        setOutputColor("#28a745");
        setOutput(`[${timestamp}] Starting execution...\n${data.stdout}`);
      } else {
        setOutputColor("#e46962");
        setOutput("⏱️ Error: Execution timer out'.");
      }
    } catch (error) {
      // setOutput(`⚠️ Execution failed: ${error.message}`);
      setOutputColor("#e46962");
      setOutput(error.message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  const createNewFile = () => {
    const fileName = prompt("Enter file name:");
    if (fileName && !files[fileName]) {
      const currentLang = languages.find((l) => l.id === lang);
      setFiles((prev) => ({
        ...prev,
        [fileName]: currentLang?.defaultCode || "",
      }));
      setCurrentFile(fileName);
      setCode(currentLang?.defaultCode || "");
    }
  };

  const deleteFile = (fileName) => {
    if (fileName === "main") return; // Don't delete main file
    if (confirm(`Delete file "${fileName}"?`)) {
      const newFiles = { ...files };
      delete newFiles[fileName];
      setFiles(newFiles);
      if (currentFile === fileName) {
        setCurrentFile("main");
        setCode(files.main);
      }
    }
  };

  const switchFile = (fileName) => {
    setFiles((prev) => ({ ...prev, [currentFile]: code }));
    setCurrentFile(fileName);
    setCode(files[fileName]);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: theme === "vs-dark" ? "#1e1e1e" : "#f8f9fa",
        color: theme === "vs-dark" ? "#ffffff" : "#212529",
        fontFamily: "system-ui, -apple-system, sans-serif",
        transition: "all 0.3s ease",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: theme === "vs-dark" ? "#202223" : "#ffffff",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              // backgroundColor: theme === "vs-dark" ? "#007acc" : "#0066cc",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
            }}
          >
            <CodeXml />
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: "600",
            }}
          >
            ByteBox
          </h1>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: theme === "vs-dark" ? "#3c3c3c" : "#e9ecef",
              color: theme === "vs-dark" ? "#ffffff" : "#212529",
              cursor: "pointer",
              fontSize: "14px",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor =
                theme === "vs-dark" ? "#00beb8ff" : "#d6d8db";
              e.target.style.transform = "scale(1.05)";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor =
                theme === "vs-dark" ? "#3c3c3c" : "#e9ecef";
              e.target.style.transform = "scale(1)";
            }}
          >
            <Settings size={14} /> Settings
          </button>

          <button
            onClick={toggleTheme}
            style={{
              borderRadius: "6px",
              border: "none",
              backgroundColor: theme === "vs-dark" ? "#3c3c3c" : "#e9ecef",
              // color: theme === "vs-dark" ? "#ffffff" : "#212529",
              cursor: "pointer",
              fontSize: "14px",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              // e.target.style.backgroundColor = theme === "vs-dark" ? "#4a4a4a" : "#d6d8db"
              e.target.style.transform = "scale(1.05)";
            }}
            onMouseOut={(e) => {
              // e.target.style.backgroundColor = theme === "vs-dark" ? "#3c3c3c" : "#e9ecef"
              e.target.style.transform = "scale(1)";
            }}
          >
            {theme === "vs-dark" ? (
              <Sun size={24} />
            ) : (
              <Moon color="#000000" size={24} />
            )}
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div
          style={{
            backgroundColor: theme === "vs-dark" ? "#252526" : "#f8f9fa",
            // borderBottom: `1px solid ${theme === "vs-dark" ? "#202223" : "#e9ecef"}`,
            padding: "16px 24px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
              alignItems: "center",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Font Size: {fontSize}px
              </label>
              <input
                type="range"
                min="10"
                max="24"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "14px",
                }}
              >
                <input
                  type="checkbox"
                  checked={wordWrap}
                  onChange={(e) => setWordWrap(e.target.checked)}
                />
                Word Wrap
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "14px",
                }}
              >
                <input
                  type="checkbox"
                  checked={minimap}
                  onChange={(e) => setMinimap(e.target.checked)}
                />
                Minimap
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "14px",
                }}
              >
                <input
                  type="checkbox"
                  checked={lineNumbers}
                  onChange={(e) => setLineNumbers(e.target.checked)}
                />
                Line Numbers
              </label>
            </div>
          </div>
        </div>
      )}

      {/* File Tabs */}
      <div
        style={{
          backgroundColor: theme === "vs-dark" ? "#202223" : "#ffffff",
          // borderBottom: `1px solid ${theme === "vs-dark" ? "#202223" : "#e9ecef"}`,
          padding: "8px 24px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          overflowX: "auto",
        }}
      >
        {Object.keys(files).map((fileName) => (
          <div
            key={fileName}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "6px",
              backgroundColor:
                currentFile === fileName
                  ? theme === "vs-dark"
                    ? "#007acc"
                    : "#0066cc"
                  : "transparent",
              color:
                currentFile === fileName
                  ? "#ffffff"
                  : theme === "vs-dark"
                  ? "#cccccc"
                  : "#666666",
              cursor: "pointer",
              fontSize: "14px",
              whiteSpace: "nowrap",
              // border: currentFile === fileName ? "none" : `1px solid ${theme === "vs-dark" ? "#202223" : "#e9ecef"}`,
              transition: "all 0.2s ease",
            }}
            onClick={() => switchFile(fileName)}
          >
            <FileTerminal color="#ffffff" /> {fileName}
            {fileName !== "main" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteFile(fileName);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                  padding: "2px",
                  borderRadius: "3px",
                  fontSize: "12px",
                }}
              >
                ✕
              </button>
            )}
          </div>
        ))}

        <button
          onClick={createNewFile}
          style={{
            padding: "6px 12px",
            borderRadius: "6px",
            // border: `1px solid ${theme === "vs-dark" ? "#202223" : "#e9ecef"}`,
            backgroundColor: "transparent",
            color: theme === "vs-dark" ? "#cccccc" : "#666666",
            cursor: "pointer",
            fontSize: "14px",
            whiteSpace: "nowrap",
          }}
        >
          <Plus />
        </button>
      </div>

      {/* Toolbar */}
      <div
        style={{
          backgroundColor: theme === "vs-dark" ? "#202223" : "#ffffff",
          // borderBottom: `1px solid ${theme === "vs-dark" ? "#202223" : "#e9ecef"}`,
          padding: "12px 24px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          {/* Language Buttons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: "14px",
                fontWeight: "500",
                marginRight: "8px",
              }}
            >
              Language:
            </span>
            {languages.map((language) => (
              <button
                key={language.id}
                onClick={() =>
                  handleLanguageChange(language.id, language.defaultCode)
                }
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: "500",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "14px",
                  transition: "all 0.2s ease",
                  backgroundColor:
                    lang === language.id
                      ? theme === "vs-dark"
                        ? "#007acc"
                        : "#0066cc"
                      : theme === "vs-dark"
                      ? "#3c3c3c"
                      : "#e9ecef",
                  color:
                    lang === language.id
                      ? "#ffffff"
                      : theme === "vs-dark"
                      ? "#ffffff"
                      : "#212529",
                  boxShadow:
                    lang === language.id
                      ? "0 2px 8px rgba(0, 153, 254, 1)"
                      : "none",
                }}
              >
                <span>{language.icon}</span>
                <span>{language.name}</span>
              </button>
            ))}
          </div>

          {/* Control Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={() => setShowInput(!showInput)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                fontWeight: "500",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "14px",
                transition: "all 0.2s ease",
                backgroundColor: showInput
                  ? theme === "vs-dark"
                    ? "#007acc"
                    : "#0066cc"
                  : theme === "vs-dark"
                  ? "#3c3c3c"
                  : "#e9ecef",
                color: showInput
                  ? "#ffffff"
                  : theme === "vs-dark"
                  ? "#ffffff"
                  : "#212529",
              }}
            >
              <span>
                <Text />
              </span>
              <span>{showInput ? "Hide Input" : "Show Input"}</span>
            </button>

            {/* Run Button */}
            <button
              onClick={handleRun}
              disabled={isRunning}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                fontWeight: "600",
                cursor: isRunning ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                transition: "all 0.2s ease",
                backgroundColor: isRunning ? "#6c757d" : "#28a745",
                color: "#ffffff",
                boxShadow: isRunning
                  ? "none"
                  : "0 2px 8px rgba(40, 167, 69, 0.3)",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  animation: isRunning ? "spin 1s linear infinite" : "none",
                }}
              >
                {isRunning ? <Hourglass /> : <Play />}
              </span>
              <span>{isRunning ? "Running..." : "Run Code"}</span>
            </button>
          </div>
        </div>
      </div>

      {showInput && (
        <div
          style={{
            backgroundColor: theme === "vs-dark" ? "#252526" : "#f8f9fa",
            // borderBottom: `1px solid ${theme === "vs-dark" ? "#202223" : "#e9ecef"}`,
            padding: "16px 24px",
          }}
        >
          <div style={{ marginBottom: "8px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "8px",
                color: theme === "vs-dark" ? "#ffffff" : "#212529",
              }}
            >
              <FileInput size={16} /> Program Input (stdin):
            </label>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Enter input for your program here... (each line will be sent as separate input)"
              style={{
                width: "100%",
                minHeight: "80px",
                padding: "12px",
                borderRadius: "6px",
                // border: `1px solid ${theme === "vs-dark" ? "#202223" : "#e9ecef"}`,
                backgroundColor: theme === "vs-dark" ? "#1e1e1e" : "#ffffff",
                color: theme === "vs-dark" ? "#ffffff" : "#212529",
                fontFamily: "JetBrains Mono, Monaco, Consolas, monospace",
                fontSize: "13px",
                resize: "vertical",
                outline: "none",
              }}
            />
            <div
              style={{
                fontSize: "12px",
                color: theme === "vs-dark" ? "#cccccc" : "#666666",
                marginTop: "4px",
              }}
            >
              <Lightbulb size={16} /> Tip: For programs that need multiple
              inputs, enter each value on a new line
            </div>
          </div>
        </div>
      )}

      {/* Editor Container */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          height: "calc(100vh - 200px)",
        }}
      >
        {/* Main Editor */}
        <div
          style={{
            flex: showOutput ? "1" : "1",
            width: showOutput ? "50%" : "100%",
            position: "relative",
            // borderRight: showOutput ? `1px solid ${theme === "vs-dark" ? "#202223" : "#e9ecef"}` : "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "12px",
              left: "24px",
              zIndex: 10,
              padding: "4px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              fontFamily: "monospace",
              backgroundColor:
                theme === "vs-dark"
                  ? "rgba(45, 45, 48, 0.9)"
                  : "rgba(248, 249, 250, 0.9)",
              color: theme === "vs-dark" ? "#cccccc" : "#666666",
              backdropFilter: "blur(4px)",
            }}
          >
            {languages.find((l) => l.id === lang)?.name || "Select Language"} •{" "}
            {currentFile}
          </div>

          <Editor
            height="100%"
            language={lang}
            value={code}
            theme={theme}
            onChange={(value) => setCode(value || "")}
            onMount={handleEditorDidMount}
            options={{
              fontSize: fontSize,
              fontFamily:
                "JetBrains Mono, Fira Code, Monaco, Consolas, monospace",
              minimap: { enabled: minimap },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: wordWrap ? "on" : "off",
              lineNumbers: lineNumbers ? "on" : "off",
              renderWhitespace: "selection",
              folding: true,
              bracketPairColorization: { enabled: true },
              smoothScrolling: true,
              cursorBlinking: "smooth",
              mouseWheelZoom: true,
              padding: { top: 50, bottom: 20 },
              suggestOnTriggerCharacters: true,
              quickSuggestions: true,
              parameterHints: { enabled: true },
              formatOnPaste: true,
              formatOnType: true,
            }}
          />
        </div>

        {/* Output Panel */}
        {showOutput && (
          <div
            style={{
              flex: "1",
              width: "50%",
              backgroundColor: theme === "vs-dark" ? "#1e1e1e" : "#f8f9fa",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Output Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 24px",
                backgroundColor: theme === "vs-dark" ? "#202223" : "#ffffff",
                // borderBottom: `1px solid ${theme === "vs-dark" ? "#202223" : "#e9ecef"}`,
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span style={{ fontSize: "16px" }}>
                  <Terminal />
                </span>
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Output
                </span>
                {isRunning && (
                  <div style={{ display: "flex", gap: "4px" }}>
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          backgroundColor: "#28a745",
                          animation: `bounce 1.4s ease-in-out ${
                            i * 0.16
                          }s infinite both`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <button
                  onClick={() => setOutput("")}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    border: "none",
                    backgroundColor: "transparent",
                    color: theme === "vs-dark" ? "#cccccc" : "#666666",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                  title="Clear Output"
                >
                  <Trash2 />
                </button>
                <button
                  onClick={() => setShowOutput(false)}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    border: "none",
                    backgroundColor: "transparent",
                    color: theme === "vs-dark" ? "#cccccc" : "#666666",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                  title="Close Output"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Output Content */}
            <div
              style={{
                flex: 1,
                padding: "16px 24px",
                fontFamily: "JetBrains Mono, Monaco, Consolas, monospace",
                fontSize: "13px",
                // color: theme === "vs-dark" ? outputColor : "#198754",
                color: outputColor,
                backgroundColor: theme === "vs-dark" ? "#1e1e1e" : "#f8f9fa",
                overflow: "auto",
                lineHeight: "1.5",
              }}
            >
              {isRunning ? (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      border: `2px solid ${
                        theme === "vs-dark" ? "#4ec9b0" : "#198754"
                      }`,
                      borderTop: "2px solid transparent",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  ></div>
                  <span>Executing code...</span>
                </div>
              ) : (
                <pre
                  style={{
                    margin: 0,
                    whiteSpace: "pre-wrap",
                    fontSize: "20px",
                    wordBreak: "break-word",
                  }}
                >
                  {output ||
                    'Click "Run Code" to see output here...\n\n💡 Tip: Try modifying the code and running it again!'}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default App;
