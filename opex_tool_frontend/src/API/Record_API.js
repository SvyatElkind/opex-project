// Enhanced Record API with proper error handling and media file support
import { ERROR_MESSAGES } from "../Constants/Constnats";

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
        body: formData, // Don't set Content-Type for FormData
    });

    // Enhanced error response handling for inconsistent backend responses
    const handleAPIResponse = async (response) => {
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch {
                errorData = { error: 'Network error' };
            }

            // Handle Django's various error response formats
            let errorMessage = 'Unknown error occurred';
            
            if (errorData.error) {
                errorMessage = errorData.error;
            } else if (errorData.ERROR) { // Backend uses uppercase ERROR
                errorMessage = errorData.ERROR;
            } else if (errorData.errors) {
                // Multiple field errors - format for display
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

    // Enhanced URL builder with proper query parameter handling
    const buildAPIURL = {
        // Standard record operations  
        record: (projectId, recordId = null) => {
            const base = `/api/v1/project/${projectId}/record/`;
            return recordId ? `${base}${recordId}/` : base;
        },

        // Media record operations with type parameter support
        mediaRecord: (projectId, recordId = null, recordType = null) => {
            const base = `/api/v1/project/${projectId}/media_record/`;
            const url = recordId ? `${base}${recordId}/` : base;
            return recordType ? `${url}?type=${recordType}` : url;
        },

        // File operations
        file: (projectId, fileId) => {
            return `/api/v1/project/${projectId}/file/${fileId}/`;
        },

        // Metadata operations
        metadata: (projectId, recordId) => {
            return `/api/v1/project/${projectId}/record/${recordId}/additional_metadata/`;
        },

        metadataMethods: (projectId, recordId) => {
            return `/api/v1/project/${projectId}/record/${recordId}/additional_metadata/methods/`;
        },

        // File uploads
        multipleFiles: (projectId, recordId) => {
            return `/api/v1/project/${projectId}/record/${recordId}/multiple_files/`;
        }
    };

    // Retry logic with exponential backoff
    const createRetryableRequest = async (requestFn, maxRetries = 3) => {
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const result = await requestFn();
                return result;
            } catch (error) {
                lastError = error;
                
                // Don't retry on client errors (4xx)
                if (error.status >= 400 && error.status < 500) {
                    break;
                }
                
                // Wait before retry (exponential backoff)
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
    // MEDIA RECORD OPERATIONS (Fixed Implementation)
    // ========================================

    // FIXED: Create media record with single file upload (matches API spec exactly)
    const createMediaRecord = async (projectId, itemId, file) => {
        if (!file) {
            return [false, 'No file provided'];
        }

        // Validate single file constraint for media records
        const singleFile = Array.isArray(file) ? file[0] : file;

        try {
            const formData = new FormData();
            formData.append('files', singleFile); // API expects 'files' key

            return await createRetryableRequest(async () => {
                const response = await fetch(
                    `${buildAPIURL.mediaRecord(projectId)}?item_id=${itemId}`,
                    createMultipartRequestOptions('POST', formData)
                );
                
                return await handleAPIResponse(response);
            });
        } catch (error) {
            console.error('Media record creation error:', error);
            return [false, error.message || 'Media record creation failed'];
        }
    };

    // Get media record details
    const getMediaRecord = async (projectId, recordId) => {
        try {
            return await createRetryableRequest(async () => {
                const response = await fetch(
                    buildAPIURL.mediaRecord(projectId, recordId),
                    createRequestOptions('GET')
                );
                
                return await handleAPIResponse(response);
            });
        } catch (error) {
            return [false, error.message || 'API request failed'];
        }
    };

    // Update media record with required type parameter (API spec compliant)
    const updateMediaRecord = async (projectId, recordId, recordData, recordType) => {
        if (!recordType) {
            return [false, 'Record type is required for media record updates'];
        }

        // Validate required fields based on API specification
        const validationResult = validateMediaRecordData(recordData, recordType);
        if (!validationResult.isValid) {
            return [false, validationResult.errors.join(', ')];
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
            return [false, error.message || ERROR_MESSAGES.GENERIC_ERROR];
        }
    };

    // Helper function to validate media record data according to API spec
    const validateMediaRecordData = (recordData, recordType) => {
        const errors = [];

        switch (recordType) {
            case 'Foto':
                if (!recordData.color || recordData.color.trim() === '') {
                    errors.push('Color is required for Photo records');
                }
                if (!recordData.horizontal_resolution || recordData.horizontal_resolution < 1) {
                    errors.push('Valid horizontal_resolution is required for Photo records');
                }
                if (!recordData.vertical_resolution || recordData.vertical_resolution < 1) {
                    errors.push('Valid vertical_resolution is required for Photo records');
                }
                break;

            case 'Video':
                if (!recordData.color || recordData.color.trim() === '') {
                    errors.push('Color is required for Video records');
                }
                if (!recordData.duration || recordData.duration.trim() === '') {
                    errors.push('Duration is required for Video records (format: HH:MM:SS)');
                }
                if (!recordData.horizontal_resolution || recordData.horizontal_resolution < 1) {
                    errors.push('Valid horizontal_resolution is required for Video records');
                }
                if (!recordData.vertical_resolution || recordData.vertical_resolution < 1) {
                    errors.push('Valid vertical_resolution is required for Video records');
                }
                // Validate duration format (HH:MM:SS)
                if (recordData.duration && !/^\d{2}:\d{2}:\d{2}$/.test(recordData.duration)) {
                    errors.push('Duration must be in HH:MM:SS format');
                }
                break;

            case 'Audio':
                if (!recordData.duration || recordData.duration.trim() === '') {
                    errors.push('Duration is required for Audio records (format: HH:MM:SS)');
                }
                // Validate duration format (HH:MM:SS)
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

    // Delete media record with type parameter
    const deleteMediaRecord = async (projectId, recordId, recordType) => {
        if (!recordType) {
            return [false, 'Record type is required for media record deletion'];
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

    // ========================================
    // STANDARD RECORD OPERATIONS
    // ========================================

    // Create standard text record
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

    // Upload multiple files to existing record
    const uploadMultipleFiles = async (projectId, recordId, files) => {
        if (!files || files.length === 0) {
            return [false, 'No files provided'];
        }

        try {
            const formData = new FormData();
            files.forEach(file => {
                formData.append('files', file); // Backend expects 'files' key
            });

            return await createRetryableRequest(async () => {
                const response = await fetch(
                    buildAPIURL.multipleFiles(projectId, recordId),
                    createMultipartRequestOptions('POST', formData)
                );
                
                return await handleAPIResponse(response);
            });
        } catch (error) {
            return [false, error.message || ERROR_MESSAGES.GENERIC_ERROR];
        }
    };

    // Delete individual file (only for text records)
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
            return [false, error.message || ERROR_MESSAGES.GENERIC_ERROR];
        }
    };

    // ========================================
    // METADATA OPERATIONS  
    // ========================================

    // Get available metadata methods
    const getMetadataMethods = async (projectId, recordId) => {
        try {
            return await createRetryableRequest(async () => {
                const response = await fetch(
                    buildAPIURL.metadataMethods(projectId, recordId),
                    createRequestOptions('GET')
                );
                
                return await handleAPIResponse(response);
            });
        } catch (error) {
            return [false, error.message || 'Get metadata methods failed'];
        }
    };

    // Add metadata with proper class parameter
    const addMetadata = async (projectId, recordId, metadataData, metadataClass) => {
        if (!metadataClass) {
            return [false, 'Metadata class is required'];
        }

        try {
            return await createRetryableRequest(async () => {
                const response = await fetch(
                    `${buildAPIURL.metadata(projectId, recordId)}?class=${metadataClass}`,
                    createRequestOptions('POST', metadataData)
                );
                
                return await handleAPIResponse(response);
            });
        } catch (error) {
            return [false, error.message || 'Add metadata failed'];
        }
    };

    // Update metadata with class and id parameters
    const updateMetadata = async (projectId, recordId, metadataData, metadataClass, metadataId) => {
        if (!metadataClass || !metadataId) {
            return [false, 'Metadata class and ID are required'];
        }

        try {
            return await createRetryableRequest(async () => {
                const response = await fetch(
                    `${buildAPIURL.metadataMethods(projectId, recordId)}?class=${metadataClass}&id=${metadataId}`,
                    createRequestOptions('PUT', metadataData)
                );
                
                return await handleAPIResponse(response);
            });
        } catch (error) {
            return [false, error.message || 'Update metadata failed'];
        }
    };

    // Delete metadata
    const deleteMetadata = async (projectId, recordId, metadataClass, metadataId) => {
        if (!metadataClass || !metadataId) {
            return [false, 'Metadata class and ID are required'];
        }

        try {
            return await createRetryableRequest(async () => {
                const response = await fetch(
                    `${buildAPIURL.metadataMethods(projectId, recordId)}?class=${metadataClass}&id=${metadataId}`,
                    createRequestOptions('DELETE')
                );
                
                return await handleAPIResponse(response);
            });
        } catch (error) {
            return [false, error.message || 'Delete metadata failed'];
        }
    };

    // EXPLICITLY DEFINED MISSING METHODS TO FIX ESLINT ERRORS

    // Get record details  
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

    // Update record
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

    // Delete record
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
    // EXPORT API METHODS
    // ========================================

    return {
        // Media Records
        createMediaRecord,  
        getMediaRecord,
        updateMediaRecord,
        deleteMediaRecord,
        
        // Standard Records
        createRecord,
        getRecord,      
        updateRecord,   
        deleteRecord,   
        uploadMultipleFiles,
        deleteFile,
        
        // Metadata
        getMetadataMethods, 
        addMetadata,
        updateMetadata,
        deleteMetadata,
        
        // Utilities
        buildAPIURL,
        handleAPIResponse,
        validateMediaRecordData
    };
};

// Fix ESLint no-anonymous-default-export error
const RecordAPI = Record_API;
export default RecordAPI;