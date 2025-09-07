import type { Extension } from "@codemirror/state";
import { dracula } from "@uiw/codemirror-theme-dracula";
import CodeMirror from "@uiw/react-codemirror";
import { useMemo, useState } from "react";
import "./CodeBlockEditor.css";
// Language imports
import { cpp } from "@codemirror/lang-cpp";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { java } from "@codemirror/lang-java";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { python } from "@codemirror/lang-python";
import { sql } from "@codemirror/lang-sql";
import { StreamLanguage } from "@codemirror/language";
import { shell } from "@codemirror/legacy-modes/mode/shell";
import { EditorView } from "@codemirror/view";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";

const customLightEditor = EditorView.theme(
  {
    ".cm-activeLine": {
      backgroundColor: "#f6f6ff !important", // subtle purple tint
    },
    ".cm-activeLineGutter": {
      backgroundColor: "#f6f6ff !important",
    },
    ".cm-content": {
      caretColor: "#111 !important", // dark caret for light mode
    },
  },
  { dark: false }
);

const customDarkEditor = EditorView.theme(
  {
    ".cm-content": {
      caretColor: "#fff !important", // white caret in dark mode
    },
  },
  { dark: true }
);

type CodeBlockValue = {
  title?: string;
  code?: string;
  language?: string;
};

console.log(githubDark);
console.log(githubLight);
console.log(dracula);

type CodeBlockEditorProps = {
  value: CodeBlockValue;
  onChange: (value: CodeBlockValue) => void;
  bgTheme?: "light" | "dark"; // 👈 add theme prop
  height?: number; // 👈 number of pixels
  width?: number; // 👈 add width too
};

const LANGUAGE_LABELS: Record<string, string> = {
  javascript: "JS",
  typescript: "TypeScript",
  python: "Python",
  java: "Java",
  cpp: "C++",
  sql: "SQL",
  html: "HTML",
  css: "CSS",
  json: "JSON",
  markdown: "Markdown",
  terminal: "Terminal",
};

function languageExtension(lang: string): Extension[] {
  switch (lang) {
    case "javascript":
    case "typescript":
      return [javascript({ jsx: true, typescript: lang === "typescript" })];
    case "python":
      return [python()];
    case "java":
      return [java()];
    case "cpp":
      return [cpp()];
    case "sql":
      return [sql()];
    case "html":
      return [html()];
    case "css":
      return [css()];
    case "json":
      return [json()];
    case "markdown":
      return [markdown()];
    case "terminal":
      return [StreamLanguage.define(shell)];
    default:
      return [];
  }
}

const CodeBlockEditor: React.FC<CodeBlockEditorProps> = ({
  value,
  onChange,
  bgTheme = "dark",
}) => {
  const {
    title = "Web Sockets Example",
    code = "",
    language = "javascript",
  } = value || {};
  const [collapsed, setCollapsed] = useState(false);
  console.log(setCollapsed);

  const [copied, setCopied] = useState(false);

  const extensions = useMemo<Extension[]>(() => {
    return [
      bgTheme === "dark" ? githubDark : githubLight,
      bgTheme === "dark" ? customDarkEditor : customLightEditor,
      ...languageExtension(language),
      EditorView.lineWrapping, // <-- enable word wrap
    ];
  }, [language, bgTheme]);

  const handleLanguageChange = (newLang: string) => {
    onChange({ ...value, language: newLang });
  };

  const handleCopy = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={`code-block-editor ${bgTheme}`} // 👈 attach class properly
      style={{
        borderRadius: "8px",
        background: "#fff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        width: "100%", // 👈 fill parent
        height: "100%", // 👈 fill parent
        display: "flex",
        flexDirection: "column", // header + editor stacked
      }}
    >
      {/* ---------------- Header ---------------- */}
      <div
        className="code-editor-header"
        style={{
          padding: "12px 16px",
          borderTopLeftRadius: "8px",
          borderTopRightRadius: "8px",
          height: "25px",
          borderBottom:
            bgTheme === "dark"
              ? "1px solid rgba(211, 211, 211, 1)"
              : "1px solid black",
          fontFamily: "Nunito",
          fontSize: "16px",
          fontWeight: "600",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: bgTheme === "dark" ? "#1e1e1e" : "#f9f9ff",
          color: bgTheme === "dark" ? "rgba(211, 211, 211, 1)" : "#6965db",
          flexShrink: 0, // 👈 keep header fixed
        }}
      >
        <span
          className="code-editor-title"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) =>
            onChange({ ...value, title: e.currentTarget.textContent || "" })
          }
          style={{
            outline: "none",
            flex: 1,
            cursor: "text",
          }}
        >
          {title}
        </span>
        <select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          style={{
            marginLeft: "12px",
            padding: "6px 10px",
            borderRadius: "6px",
            border: bgTheme === "dark" ? "1px solid #444" : "1px solid #d3d3d3",
            fontSize: "13px",
            color: bgTheme === "dark" ? "#d3d3d3" : "#333",
            background: bgTheme === "dark" ? "#2a2a2a" : "#fff",
            cursor: "pointer",
          }}
        >
          {Object.entries(LANGUAGE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* ---------------- Body ---------------- */}
      {!collapsed && (
        <>
          {/* Code Editor */}
          <div
            style={{
              borderBottomLeftRadius: "8px",
              borderBottomRightRadius: "8px",
              flex: 1, // fills remaining height
              position: "relative", // needed for absolute positioning of button
              height: "calc(100% - 25px)",
              overflow: "auto", // make the editor scrollable
            }}
          >
            <div className="editor-wrapper">
              <CodeMirror
                value={code}
                height="100%" // 👈 fill remaining space
                width="100%"
                theme={bgTheme === "dark" ? githubDark : githubLight} // 👈 GitHub theme
                extensions={extensions}
                placeholder="Write your code here..."
                onChange={(val) => onChange({ ...value, code: val })}
              />{" "}
            </div>
            <div
              style={{
                position: "absolute",
                bottom: "10px",
                right: "10px",
                zIndex: 10,
              }}
            >
              <button
                onClick={handleCopy}
                style={{
                  padding: "6px 14px",
                  fontSize: "13px",
                  background: bgTheme === "light" ? "#fff" : "#6965db",
                  color:
                    bgTheme === "light" ? "#6965db" : "rgba(211, 211, 211, 1)",
                  border: bgTheme === "light" ? "1px solid #6965db" : "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Copy
              </button>
            </div>
            {copied && (
              <div
                style={{
                  position: "absolute",
                  bottom: "50px", // 👈 show above button instead
                  right: "10px",
                  background: bgTheme === "light" ? "#fff" : "#6965db",
                  color:
                    bgTheme === "light" ? "#6965db" : "rgba(211, 211, 211, 1)",
                  fontSize: "13px",
                  fontWeight: 500,
                  padding: "6px 12px",
                  border: bgTheme === "light" ? "1px solid #6965db" : "none",
                  borderRadius: "6px",
                  // boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  opacity: 0.95,
                  whiteSpace: "nowrap",
                  zIndex: 10,
                }}
              >
                Copied To Clipboard!
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CodeBlockEditor;
