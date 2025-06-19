// Global variable to store the Monaco editor instance
let editor;
let pyrightInstance = null; // Will hold the Pyright type checker instance

// Configure Monaco loader path
require.config({ paths: { vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs" } });

// Load Monaco editor
require(["vs/editor/editor.main"], async function () {
  // Create the Monaco editor instance
  editor = monaco.editor.create(document.getElementById("monaco-editor"), {
    value: `print("Hello from CodeForge IDE!")`,
    language: "python",
    theme: "vs-dark",
    automaticLayout: true,
    fontSize: 16,
    wordWrap: "on"
  });

  // Initialize Pyright for Python type checking and completions
  await initPyright();

  // Register intelligent completions for Python using Pyright
  monaco.languages.registerCompletionItemProvider("python", {
    triggerCharacters: [".", "("],
    provideCompletionItems: (model, position) => {
      const code = model.getValue();
      const offset = model.getOffsetAt(position);
      pyrightInstance.setFile("main.py", code);

      const completions = pyrightInstance.getCompletions("main.py", offset);
      if (!completions || !completions.items) return { suggestions: [] };

      const suggestions = completions.items.map(item => ({
        label: item.label,
        kind: monaco.languages.CompletionItemKind.Function,
        insertText: item.insertText || item.label,
        documentation: item.documentation,
        range: {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: position.column - (item.textEdit?.range?.length || 0),
          endColumn: position.column
        }
      }));

      return { suggestions };
    }
  });

  // Reinitialize Pyright if the language is changed back to Python
  editor.onDidChangeModelLanguage(async () => {
    const lang = editor.getModel().getLanguageId();
    if (lang === "python") {
      await initPyright();
    }
  });

  // Listen for changes in the editor and update diagnostics
  editor.onDidChangeModelContent(onEditorContentChange);
});

// Initialize Pyright in the browser for real-time diagnostics
async function initPyright() {
  if (!window.createPyrightInBrowser || pyrightInstance) return;

  pyrightInstance = await createPyrightInBrowser();
  pyrightInstance.setFile("main.py", editor.getValue());
  await onEditorContentChange();
}

// Update diagnostics in Monaco using Pyright results
async function onEditorContentChange() {
  if (!pyrightInstance) return;

  const code = editor.getValue();
  pyrightInstance.setFile("main.py", code);
  const diagnostics = pyrightInstance.getDiagnostics("main.py");

  monaco.editor.setModelMarkers(editor.getModel(), "pyright", diagnostics.map(diag => ({
    message: diag.message,
    severity: monaco.MarkerSeverity.Error,
    startLineNumber: diag.range.start.line + 1,
    startColumn: diag.range.start.character + 1,
    endLineNumber: diag.range.end.line + 1,
    endColumn: diag.range.end.character + 1
  })));
}

// Get the code currently written in the editor
function getEditorCode() {
  return editor ? editor.getValue() : "";
}

// Get the current programming language of the editor
function getEditorLang() {
  return editor ? editor.getModel().getLanguageId() : "python";
}

// Set a new language for the Monaco editor
function setEditorLanguage(lang) {
  if (editor) {
    monaco.editor.setModelLanguage(editor.getModel(), lang);
  }
}
