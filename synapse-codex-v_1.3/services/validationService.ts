

import { MiniFile, Status, ProcessDocumentResponse } from '../types';

/**
 * Validates a MiniFile object against a set of rules.
 * This simulates a more robust backend validation process.
 * @param file The MiniFile object to validate.
 * @returns An array of string error messages. An empty array means the file is valid.
 */
export const validateMiniFile = (file: MiniFile): string[] => {
    const errors: string[] = [];

    if (!file.id || file.id.trim() === '') {
        errors.push('ID is required and cannot be empty.');
    }

    if (file.version < 1) {
        errors.push(`Version must be a positive integer, but got ${file.version}.`);
    }

    if (file.status === Status.Complete && !file.provenance) {
        errors.push('Provenance is required when status is "complete".');
    }

    if (!file.modalities || file.modalities.length === 0) {
        errors.push('Modalities array cannot be empty.');
    }

    if (file.dependencies.includes(file.id)) {
        errors.push('A file cannot have a dependency on itself.');
    }

    return errors;
};

/**
 * Validates the entire ProcessDocumentResponse.
 * @param result The ProcessDocumentResponse object.
 * @returns boolean true if all mini-files are valid, false otherwise.
 */
export const validateDocument = (result: ProcessDocumentResponse): boolean => {
    if (!result.projectSummary || !result.miniFiles) {
        return false;
    }
    // Check if any miniFile has validation errors.
    const isInvalid = result.miniFiles.some(file => validateMiniFile(file).length > 0);
    return !isInvalid;
};
