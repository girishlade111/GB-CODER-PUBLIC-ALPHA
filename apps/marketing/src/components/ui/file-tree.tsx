import { Icon } from "./icon";
import type { IconName } from "./icons";

export interface SampleFile {
  name: string;
  code: string;
  icon: IconName;
}

export type FileNode = SampleFile | { name: string; children: FileNode[] };

export function FileTree({
  nodes,
  selectedFile,
  onSelect,
}: {
  nodes: FileNode[];
  selectedFile: SampleFile;
  onSelect: (file: SampleFile) => void;
}) {
  return (
    <ul className="studio-tree">
      {nodes.map((node) => (
        <li key={node.name}>
          {"children" in node ? (
            <details className="studio-tree__folder" open>
              <summary className="studio-tree__row">
                <Icon name="chevron-down" size={13} className="studio-tree__chevron" />
                <Icon name="folder" size={15} className="studio-tree__folder-icon" />
                <span>{node.name}</span>
              </summary>
              <FileTree nodes={node.children} selectedFile={selectedFile} onSelect={onSelect} />
            </details>
          ) : (
            <button
              className="studio-tree__row studio-tree__file"
              type="button"
              aria-current={node === selectedFile ? "true" : undefined}
              onClick={() => onSelect(node)}
            >
              <Icon name={node.icon} size={15} />
              <span>{node.name}</span>
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
