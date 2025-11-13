// src/API/Record_API.js
// Updated to match ENDPOINTS.XLSX specification exactly

import { ERROR_MESSAGES } from "../Constants/Constants";

const Record_API = () => {
    // ========================================
    // UTILITY FUNCTIONS
    // ========================================
    
    const createRequestOptions = (method, body = null) => ({
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : null,
    });

    const createMultipartRequestOptions = (method, formData = null) => ({
        method,
        body: formData,
    });

    const handleAPIResponse = async (response) => {
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch {
                errorData = { error: 'Network error' };
            }

            let errorMessage = 'Unknown error occurred';
            
            if (errorData.error) {
                errorMessage = errorData.error;
            } else if (errorData.ERROR) {
                errorMessage = errorData.ERROR;
            } else if (errorData.errors) {
                errorMessage = typeof errorData.errors === 'object' 
                    ? Object.values(errorData.errors).flat().join(', ')
                    : errorData.errors;
            } else if (typeof errorData === 'string') {
                errorMessage = errorData;
            }

            return [false, errorMessage];
        }

        let successData;
        try {
            successData = await response.json();
        } catch {
            successData = { success: true };
        }

        return [true, successData];
    };

    // URL builder - matches ENDPOINTS.XLSX exactly
    const buildAPIURL = {
        // Standard record operations
        record: (projectId, recordId = null) => {
            const base = `/api/v1/project/${projectId}/record/`;
            return recordId ? `${base}${recordId}/` : base;
        },

        // Media record operations
        mediaRecord: (projectId, recordId = null, recordType = null) => {
            const base = `/api/v1/project/${projectId}/media_record/`;
            const url = recordId ? `${base}${recordId}/` : base;
            return recordType ? `${url}?type=${recordType}` : url;
        },

        // File operations
        file: (projectId, fileId) => {
            // NOTE: ENDPOINTS.XLSX shows api/v1/project<project_id>/file/<file_id>/
            // Missing slash after "project" - assuming typo, adding it
            return `/api/v1/project/${projectId}/file/${fileId}/`;
        },

        // Multiple file uploads (textual records only)
        multipleFiles: (projectId, recordId) => {
            return `/api/v1/project/${projectId}/record/${recordId}/multiple_files/`;
        },

        // Metadata operations
        additionalMetadata: (projectId, recordId, metadataClass) => {
            return `/api/v1/project/${projectId}/record/${recordId}/additional_metadata/?class=${metadataClass}`;
        },

        metadataMethods: (projectId, recordId, metadataClass, metadataId) => {
            return `/api/v1/project/${projectId}/record/${recordId}/additional_metadata/methods/?class=${metadataClass}&id=${metadataId}`;
        }
    };

    // Retry logic
    const createRetryableRequest = async (requestFn, maxRetries = 3) => {
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const result = await requestFn();
                return result;
            } catch (error) {
                lastError = error;
                
                if (error.status >= 400 && error.status < 500) {
                    break;
                }
                
                if (attempt < maxRetries) {
                    await new Promise(resolve => 
                        setTimeout(resolve, Math.pow(2, attempt) * 1000)
                    );
                }
            }
        }
        
        throw lastError;
    };

    // ========================================
    // TEXTUAL/DATABASE RECORD OPERATIONS
    // ========================================

    /**
     * Create standard textual/database record
     * Endpoint: POST /api/v1/project/<project_id>/record/?item_id=<item_id>
     */
    const createRecord = async (recordData, projectId, itemId) => {
        try {
            return await createRetryableRequest(async () => {
                const response = await fetch(
                    `${buildAPIURL.record(projectId)}?item_id=${itemId}`,
                    createRequestOptions('POST', recordData)
                );
                
                return await handleAPIResponse(response);
            });
        } catch (error) {
            return [false, error.message || ERROR_MESSAGES.GENERIC_ERROR];
        }
    };

    /**
     * Get record details with metadata
     * Endpoint: GET /api/v1/project/<project_id>/record/<record_id>/
     */
    const getRecord = async (projectId, recordId) => {
        try {
            return await createRetryableRequest(async () => {
                const response = await fetch(
                    buildAPIURL.record(projectId, recordId),
                    createRequestOptions('GET')
                );
                
                return await handleAPIResponse(response);
            });
        } catch (error) {
            return [false, error.message || ERROR_MESSAGES.GENERIC_ERROR];
        }
    };

    /**
     * Update textual/database record
     * Endpoint: PUT /api/v1/project/<project_id>/record/<record_id>/
     */
    const updateRecord = async (projectId, recordId, recordData) => {
        try {
            return await createRetryableRequest(async () => {
                const response = await fetch(
                    buildAPIURL.record(projectId, recordId),
                    createRequestOptions('PUT', recordData)
                );
                
                return await handleAPIResponse(response);
            });
        } catch (error) {
            return [false, error.message || ERROR_MESSAGES.GENERIC_ERROR];
        }
    };

    /**
     * Delete textual/database record
     * Endpoint: DELETE /api/v1/project/<project_id>/record/<record_id>/
     */
    const deleteRecord = async (projectId, recordId) => {
        try {
            return await createRetryableRequest(async () => {
                const response = await fetch(
                    buildAPIURL.record(projectId, recordId),
                    createRequestOptions('DELETE')
                );
                
                return await handleAPIResponse(response);
            });
        } catch (error) {
            return [false, error.message || ERROR_MESSAGES.GENERIC_ERROR];
        }
    };

    // ========================================
    // MEDIA RECORD OPERATIONS
    // ========================================

    /**
     * Create media record with file upload (Photo/Video/Audio)
     * Endpoint: POST /api/v1/project/<project_id>/media_record/?item_id=<item_id>
     * Request: { files: FILE_LIST } as multipart/form-data
     */
    const createMediaRecord = async (projectId, itemId, file) => {
        if (!file) {
            return [false, 'No file provided'];
        }

        const singleFile = Array.isArray(file) ? file[0] : file;

        try {
            const formData = new FormData();
            formData.append('files', singleFile);

            return await createRetryableRequest(async () => {
                const response = await fetch(
                    `${buildAPIURL.mediaRecord(projectId)}?item_id=${itemId}`,
                    createMultipartRequestOptions('POST', formData)
                );
                
                return await handleAPIResponse(response);
            });
        } catch (error) {
            return [false, error.message || 'Media record creation failed'];
        }
    };

    /**
     * Update media record metadata (after file is uploaded)
     * Endpoint: PUT /api/v1/project/<project_id>/media_record/<record_id>/?type=[Foto, Video, Audio]
     */
    const updateMediaRecord = async (projectId, recordId, recordData, recordType) => {
        if (!recordType) {
            return [false, 'Record type is required (Foto, Video, or Audio)'];
        }

        // Validate based on type
        const validation = validateMediaRecordData(recordData, recordType);
        if (!validation.isValid) {
            return [false, validation.errors.join(', ')];
        }

        try {
            return await createRetryableRequest(async () => {
                const response = await fetch(
                    buildAPIURL.mediaRecord(projectId, recordId, recordType),
                    createRequestOptions('PUT', recordData)
                );
                
                return await handleAPIResponse(response);
            });
        } catch (error) {
            return [false, error.message || 'Media record update failed'];
        }
    };

    /**
     * Delete media record
     * Endpoint: DELETE /api/v1/project/<project_id>/media_record/<record_id>/?type=[Foto, Video, Audio]
     */
    const deleteMediaRecord = async (projectId, recordId, recordType) => {
        if (!recordType) {
            return [false, 'Record type is required'];
        }

        try {
            return await createRetryableRequest(async () => {
                const response = await fetch(
                    buildAPIURL.mediaRecord(projectId, recordId, recordType),
                    createRequestOptions('DELETE')
                );
                
                return await handleAPIResponse(response);
            });
        } catch (error) {
            return [false, error.message || ERROR_MESSAGES.GENERIC_ERROR];
        }
    };

    /**
     * Validate media record metadata based on type
     */
    const validateMediaRecordData = (recordData, recordType) => {
        const errors = [];

        switch (recordType) {
            case 'Foto':
                // Required fields for photo
                if (recordData.color && !['color', 'grayscale'].includes(recordData.color)) {
                    errors.push('Color must be "color" or "grayscale"');
                }
                if (recordData.horizontal_resolution && !Number.isInteger(recordData.horizontal_resolution)) {
                    errors.push('Horizontal resolution must be an integer');
                }
                if (recordData.vertical_resolution && !Number.isInteger(recordData.vertical_resolution)) {
                    errors.push('Vertical resolution must be an integer');
                }
                break;

            case 'Video':
                // Required fields for video
                if (recordData.color && !['color', 'grayscale'].includes(recordData.color)) {
                    errors.push('Color must be "color" or "grayscale"');
                }
                if (recordData.duration && !/^\d{2}:\d{2}:\d{2}$/.test(recordData.duration)) {
                    errors.push('Duration must be in HH:MM:SS format');
                }
                if (recordData.horizontal_resolution && !Number.isInteger(recordData.horizontal_resolution)) {
                    errors.push('Horizontal resolution must be an integer');
                }
                if (recordData.vertical_resolution && !Number.isInteger(recordData.vertical_resolution)) {
                    errors.push('Vertical resolution must be an integer');
                }
                break;

            case 'Audio':
                // Required fields for audio
                if (recordData.duration && !/^\d{2}:\d{2}:\d{2}$/.test(recordData.duration)) {
                    errors.push('Duration must be in HH:MM:SS format');
                }
                break;

            default:
                errors.push(`Unknown record type: ${recordType}`);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    };

    // ========================================
    // FILE OPERATIONS (Textual Records Only)
    // ========================================

    /**
     * Upload multiple files to existing textual record
     * Endpoint: POST /api/v1/project/<project_id>/record/<record_id>/multiple_files/
     */
    const uploadMultipleFiles = async (projectId, recordId, files) => {
        if (!files || files.length === 0) {
            return [false, 'No files provided'];
        }

        try {
            const formData = new FormData();
            files.forEach(file => {
                formData.append('files', file);
            });

            return await createRetryableRequest(async () => {
                const response = await fetch(
                    buildAPIURL.multipleFiles(projectId, recordId),
                    createMultipartRequestOptions('POST', formData)
                );
                
                return await handleAPIResponse(response);
            });
        } catch (error) {
            return [false, error.message || 'File upload failed'];
        }
    };

    /**
     * Delete individual file from textual record
     * Endpoint: DELETE /api/v1/project/<project_id>/file/<file_id>/
     */
    const deleteFile = async (projectId, fileId) => {
        try {
            return await createRetryableRequest(async () => {
                const response = await fetch(
                    buildAPIURL.file(projectId, fileId),
                    createRequestOptions('DELETE')
                );
                
                return await handleAPIResponse(response);
            });
        } catch (error) {
            return [false, error.message || 'File deletion failed'];
        }
    };

    // ========================================
    // METADATA OPERATIONS (Additional Metadata)
    // ========================================

    /**
     * Add metadata to record
     * Endpoint: POST /api/v1/project/<project_id>/record/<record_id>/additional_metadata/?class=[action|addressee|visa|read_status]
     */
    const addMetadata = async (projectId, recordId, metadataData, metadataClass) => {
        if (!metadataClass) {
            return [false, 'Metadata class is required'];
        }

        try {
            return await createRetryableRequest(async () => {
                const response = await fetch(
                    buildAPIURL.additionalMetadata(projectId, recordId, metadataClass),
                    createRequestOptions('POST', metadataData)
                );
                
                return await handleAPIResponse(response);
            });
        } catch (error) {
            return [false, error.message || 'Metadata addition failed'];
        }
    };

    /**
     * Update metadata
     * Endpoint: PUT /api/v1/project/<project_id>/record/<record_id>/additional_metadata/methods/?class=[class]&id=[id]
     */
    const updateMetadata = async (projectId, recordId, metadataData, metadataClass, metadataId) => {
        if (!metadataClass || !metadataId) {
            return [false, 'Metadata class and ID are required'];
        }

        try {
            return await createRetryableRequest(async () => {
                const response = await fetch(
                    buildAPIURL.metadataMethods(projectId, recordId, metadataClass, metadataId),
                    createRequestOptions('PUT', metadataData)
                );
                
                return await handleAPIResponse(response);
            });
        } catch (error) {
            return [false, error.message || 'Metadata update failed'];
        }
    };

    /**
     * Delete metadata
     * Endpoint: DELETE /api/v1/project/<project_id>/record/<record_id>/additional_metadata/methods/?class=[class]&id=[id]
     */
    const deleteMetadata = async (projectId, recordId, metadataClass, metadataId) => {
        if (!metadataClass || !metadataId) {
            return [false, 'Metadata class and ID are required'];
        }

        try {
            return await createRetryableRequest(async () => {
                const response = await fetch(
                    buildAPIURL.metadataMethods(projectId, recordId, metadataClass, metadataId),
                    createRequestOptions('DELETE')
                );
                
                return await handleAPIResponse(response);
            });
        } catch (error) {
            return [false, error.message || 'Metadata deletion failed'];
        }
    };

    // ========================================
    // EXPORT API METHODS
    // ========================================

    return {
        // Textual/Database Records
        createRecord,
        getRecord,
        updateRecord,
        deleteRecord,
        uploadMultipleFiles,
        deleteFile,
        
        // Media Records
        createMediaRecord,
        updateMediaRecord,
        deleteMediaRecord,
        
        // Metadata
        addMetadata,
        updateMetadata,
        deleteMetadata,
        
        // Utilities
        buildAPIURL,
        handleAPIResponse,
        validateMediaRecordData
    };
};

const RecordAPI = Record_API;
export default RecordAPI;