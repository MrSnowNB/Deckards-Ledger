import JSZip from 'jszip';
import { MiniFile, Modality, ExportOptions } from '../types';

export interface AdditionalFile {
    path: string;
    content: string;
}

const generateYamlHeader = (file: MiniFile): string => {
  const yamlProvenance = file.provenance
    ? `
  agent: ${file.provenance.agent}
  model: ${file.provenance.model || 'N/A'}
  completed_at: ${file.provenance.completedAt}`
    : ' null';

  const yamlVerificationTrail = file.verificationTrail.length > 0
    ? file.verificationTrail.map(v =>
`  - agent: ${v.agent}
    timestamp: ${v.timestamp}
    status: ${v.status}${v.notes ? `\n    notes: "${v.notes}"` : ''}`
      ).join('\n')
    : ' []';

  return `---
id: ${file.id}
parent_id: ${file.parentId}
hash: ${file.hash}
version: ${file.version}
created: ${file.created}
tokens: ${file.tokens}
status: ${file.status}
agent_hint: "${file.agentHint}"
modalities: [${file.modalities.join(', ')}]
dependencies: [${file.dependencies.join(', ')}]
dependency_status: ${file.dependencyStatus}
provenance:${yamlProvenance}
verification_trail:
${yamlVerificationTrail}
---

`;
};

export const createZip = async (
    files: MiniFile[],
    options: ExportOptions,
    additionalFiles: AdditionalFile[] = []
): Promise<Blob> => {
    const zip = new JSZip();

    // Add additional files like the hiro protocol and satellite docs
    additionalFiles.forEach(file => {
        zip.file(file.path, file.content);
    });

    const docsFolder = zip.folder('docs');
    const miniFolder = docsFolder!.folder('mini');

    const filteredFiles = files.filter(file =>
        options.modalities.some(modality => file.modalities.includes(modality))
    );

    filteredFiles.forEach(file => {
        let fileContent = '';
        if (options.includeHeader) {
            fileContent += generateYamlHeader(file);
        }
        fileContent += file.content;

        // Mini files go into docs/mini/
        miniFolder!.file(`${file.id}.md`, fileContent);
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    return blob;
};