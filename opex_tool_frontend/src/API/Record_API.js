import { API_ENDPOINT,ERROR_MESSAGES } from "../Constants/Constnats";

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
        body: formData, // Don't set Content-Type for FormData, browser will set it
    });

    // Enhanced error response handling
    const handleAPIResponse = async (response) => {
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch {
                errorData = { error: 'Network error' };
            }

            // Handle different error response structures from backend
            if (errorData.error) {
                return [false, errorData.error];
            } else if (errorData.errors) {
                // Multiple field errors
                return [false, errorData.errors];
            } else if (typeof errorData === 'string') {
                return [false, errorData];
            } else {
                return [false, 'Unknown error occurred'];
            }
        }

        let successData;
        try {
            successData = await response.json();
        } catch {
            successData = { success: true };
        }

        return [true, successData];
    };

    // URL builder utility for consistent endpoint construction
    const buildAPIURL = {
        // Standard record operations  
        record: (projectId, recordId = null) => {
            const base = `${API_ENDPOINT.API_BASE_URL}${projectId}/record/`;
            return recordId ? `${base}${recordId}/` : base;
        },

        // Media record operations
        mediaRecord: (projectId, recordId = null) => {
            const base = `${API_ENDPOINT.API_BASE_URL}${projectId}/media_record/`;
            return recordId ? `${base}${recordId}/` : base;
        },

        // File operations
        file: (projectId, fileId) => {
            return `${API_ENDPOINT.API_BASE_URL}${projectId}/file/${fileId}/`;
        },

        // Metadata operations
        metadata: (projectId, recordId) => {
            return `${API_ENDPOINT.API_BASE_URL}${projectId}/record/${recordId}/additional_metadata/`;
        },

        metadataMethods: (projectId, recordId) => {
            return `${API_ENDPOINT.API_BASE_URL}${projectId}/record/${recordId}/additional_metadata/methods/`;
        },

        // File uploads - FIXED: Use correct endpoint
        multipleFiles: (projectId, recordId) => {
            return `${API_ENDPOINT.API_BASE_URL}${projectId}/record/${recordId}/multiple_files/`;
        }
    };

    // Retry logic for failed requests
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
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                }
            }
        }
        
        throw lastError;
    };

    // ========================================
    // STANDARD RECORD OPERATIONS
    // ========================================

    // Create a new record
    const createRecord = async (recordData, projectId, itemId) => {
        try {
            return await createRetryableRequest(async () => {
                const response = await fetch(
                    buildAPIURL.record(projectId) + `?item_id=${itemId}`,
                    createRequestOptions('POST', recordData)
                );
                
                return await handleAPIResponse(response);
            });
        } catch (error) {
            return [false, error.message || ERROR_MESSAGES.GENERIC_ERROR];
        }
    };

    // Get record details with metadata
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

    // Update a record
    const updateRecord = async (recordData, projectId, recordId) => {
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

    // Delete a record
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
    // MEDIA RECORD OPERATIONS (NEW)
    // ========================================

    // Upload media file and create media record
    const uploadMediaFile = async (projectId, itemId, file) => {
        try {
            return await createRetryableRequest(async () => {
                const formData = new FormData();
                formData.append('files', file);

                const response = await fetch(
                    buildAPIURL.mediaRecord(projectId) + `?item_id=${itemId}`,
                    createMultipartRequestOptions('POST', formData)
                );
                
                return await handleAPIResponse(response);
            });
        } catch (error) {
            return [false, error.message || ERROR_MESSAGES.GENERIC_ERROR];
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
            return [false, error.message || ERROR_MESSAGES.GENERIC_ERROR];
        }
    };

    // Update media record
    const updateMediaRecord = async (projectId, recordId, recordData) => {
        try {
            return await createRetryableRequest(async () => {
                const response = await fetch(
                    buildAPIURL.mediaRecord(projectId, recordId),
                    createRequestOptions('PUT', recordData)
                );
                
                return await handleAPIResponse(response);
            });
        } catch (error) {
            return [false, error.message || ERROR_MESSAGES.GENERIC_ERROR];
        }
    };

    // Delete media record
    const deleteMediaRecord = async (projectId, recordId) => {
        try {
            return await createRetryableRequest(async () => {
                const response = await fetch(
                    buildAPIURL.mediaRecord(projectId, recordId),
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
            return [false, error.message || ERROR_MESSAGES.GENERIC_ERROR];
        }
    };

    // Add metadata to record
    const addMetadata = async (projectId, recordId, metadataClass, metadataData) => {
        try {
            return await createRetryableRequest(async () => {
                const response = await fetch(
                    buildAPIURL.metadata(projectId, recordId) + `?class=${metadataClass}`,
                    createRequestOptions('POST', metadataData)
                );
                
                return await handleAPIResponse(response);
            });
        } catch (error) {
            return [false, error.message || ERROR_MESSAGES.GENERIC_ERROR];
        }
    };

    // Update metadata
    const updateMetadata = async (projectId, recordId, metadataClass, metadataId, metadataData) => {
        try {
            return await createRetryableRequest(async () => {
                const response = await fetch(
                    buildAPIURL.metadata(projectId, recordId) + `?class=${metadataClass}&id=${metadataId}`,
                    createRequestOptions('PUT', metadataData)
                );
                
                return await handleAPIResponse(response);
            });
        } catch (error) {
            return [false, error.message || ERROR_MESSAGES.GENERIC_ERROR];
        }
    };

    // Delete metadata
    const deleteMetadata = async (projectId, recordId, metadataClass, metadataId) => {
        try {
            return await createRetryableRequest(async () => {
                const response = await fetch(
                    buildAPIURL.metadata(projectId, recordId) + `?class=${metadataClass}&id=${metadataId}`,
                    createRequestOptions('DELETE')
                );
                
                return await handleAPIResponse(response);
            });
        } catch (error) {
            return [false, error.message || ERROR_MESSAGES.GENERIC_ERROR];
        }
    };

    // ========================================
    // FILE OPERATIONS
    // ========================================

    // Upload files to record - FIXED: Use correct endpoint
    const uploadFiles = async (projectId, recordId, files) => {
        try {
            return await createRetryableRequest(async () => {
                const formData = new FormData();
                files.forEach(file => {
                    formData.append('files', file);
                });

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

    // Delete a file
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
    // BATCH OPERATIONS (NEW)
    // ========================================

    // Batch delete records
    const batchDeleteRecords = async (projectId, recordIds) => {
        try {
            const deletePromises = recordIds.map(recordId => 
                deleteRecord(projectId, recordId)
            );
            
            const results = await Promise.allSettled(deletePromises);
            
            const successful = [];
            const failed = [];
            
            results.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value[0]) {
                    successful.push(recordIds[index]);
                } else {
                    failed.push({
                        recordId: recordIds[index],
                        error: result.status === 'rejected' ? result.reason : result.value[1]
                    });
                }
            });
            
            return [true, { successful, failed }];
        } catch (error) {
            return [false, error.message || ERROR_MESSAGES.GENERIC_ERROR];
        }
    };

    // Batch update records
    const batchUpdateRecords = async (projectId, updates) => {
        try {
            const updatePromises = updates.map(({ recordId, data }) => 
                updateRecord(data, projectId, recordId)
            );
            
            const results = await Promise.allSettled(updatePromises);
            
            const successful = [];
            const failed = [];
            
            results.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value[0]) {
                    successful.push(updates[index].recordId);
                } else {
                    failed.push({
                        recordId: updates[index].recordId,
                        error: result.status === 'rejected' ? result.reason : result.value[1]
                    });
                }
            });
            
            return [true, { successful, failed }];
        } catch (error) {
            return [false, error.message || ERROR_MESSAGES.GENERIC_ERROR];
        }
    };

    // ========================================
    // VALIDATION HELPERS (NEW)
    // ========================================

    // Validate record data before sending
    const validateRecordData = (recordData, recordType = 'textual') => {
        const errors = {};

        // Title validation
        if (!recordData.title || recordData.title.trim() === '') {
            errors.title = ['Nosaukums ir obligāts'];
        } else if (recordData.title.length > 500) {
            errors.title = ['Nosaukums ir garāks par 500 simboliem'];
        }

        // Date validation
        if (recordData.date && isNaN(Date.parse(recordData.date))) {
            errors.date = ['Nepareizs datuma formāts'];
        }

        // Duration validation for media records
        if (recordData.duration) {
            const durationRegex = /^\d{1,2}:[0-5]\d:[0-5]\d$/;
            if (!durationRegex.test(recordData.duration)) {
                errors.duration = ['Glabājamās vienības skanēšanas ilgums norādīts nepareizi'];
            }
        }

        // Access restriction validation
        if (recordData.access_restriction && !['open', 'closed'].includes(recordData.access_restriction)) {
            errors.access_restriction = ['Nepareizi norādīta pieejamības vērtība'];
        }

        return Object.keys(errors).length > 0 ? errors : null;
    };

    // ========================================
    // EXPORT ALL METHODS
    // ========================================

    return {
        // Standard record operations
        createRecord,
        getRecord,
        updateRecord,
        deleteRecord,
        
        // Media record operations
        uploadMediaFile,
        getMediaRecord,
        updateMediaRecord,
        deleteMediaRecord,
        
        // Metadata operations
        getMetadataMethods,
        addMetadata,
        updateMetadata,
        deleteMetadata,
        
        // File operations
        uploadFiles,
        deleteFile,
        
        // Batch operations
        batchDeleteRecords,
        batchUpdateRecords,
        
        // Validation
        validateRecordData,
        
        // Utilities
        buildAPIURL,
        handleAPIResponse,
        createRetryableRequest
    };
};

export default Record_API;