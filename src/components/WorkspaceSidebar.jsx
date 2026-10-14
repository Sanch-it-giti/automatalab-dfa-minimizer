import { BookOpen, ChevronLeft, FlaskConical, RotateCcw } from "lucide-react";
import DFAEditor from "./DFAEditor";
import "./workspaceSidebar.css";

export default function WorkspaceSidebar({ collapsed, onToggle, exampleName, onExampleChange, onLoadExample, onReset, editorProps }) {
  return <aside className={`workspace-sidebar ${collapsed ? "is-collapsed" : ""}`}>
    <div className="sidebar-top"><div className="sidebar-label"><BookOpen size={17} /><span>DFA editor</span></div><button className="sidebar-toggle" onClick={onToggle} aria-label={collapsed ? "Open editor" : "Collapse editor"}><ChevronLeft size={18} /></button></div>
    {!collapsed && <div className="sidebar-content"><div className="editor-actions"><label>Example DFA<select value={exampleName} onChange={(event) => onExampleChange(event.target.value)} aria-label="Choose an example"><option value="equivalent">Equivalent states</option><option value="unreachable">Unreachable states</option></select></label><button className="compact-button primary-compact" onClick={onLoadExample}><FlaskConical size={15} /> Load example</button><button className="compact-button" onClick={onReset}><RotateCcw size={15} /> Reset editor</button></div><DFAEditor {...editorProps} /></div>}
  </aside>;
}
