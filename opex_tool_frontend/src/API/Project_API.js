import { ERROR_MESSAGES, API_ENDPOINT } from "../Constants/Constants";

  const Project_API = () => {
    const createRequestOptions = (method, body = null) => ({
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : null,
    });


    {/* 
        Method Call hapens on first Load inside the Workspace Component    
    */}
    const connect_api = async () => {
        try {
            const response = await fetch(API_ENDPOINT.API_BASE_URL, createRequestOptions('GET'));

            if (response.status === 500) {
                console.warn("Server error (500) - treating as no projects available");
                return [true, []]; // Return empty array instead of error
            }

            if (!response.ok) {
                console.error("Error response status:", response.status);
                if (response.status === 204) {
                    return [true, []];
                }
                return [false, ERROR_MESSAGES.BACKEND_SERVER_ERROR];
            }
            const text = await response.text(); // Get the raw text response
        
            if (!text) {
            return [true, []];
            }

            const json = JSON.parse(text);
            return [true, json];

        } catch (error) {
            console.error("API call failed:", error);
            return [false, error.message || ERROR_MESSAGES.GENERIC_ERROR]; // Return proper error message
        }
    };

    const create_project = async (projectData) => {
        try {
            const response = await fetch(API_ENDPOINT.API_BASE_URL, createRequestOptions('POST', projectData));
            if (!response.ok) return [false, ERROR_MESSAGES.GENERIC_ERROR];
            const json = await response.json();
            return [true, json];
        } catch (error) {
            return [false, error];
        }
    };

    const delete_project = async (id) => {
        try {
            const response = await fetch(`${API_ENDPOINT.API_BASE_URL}${id}/`, createRequestOptions('DELETE'));
            if (!response.ok) return [false, ERROR_MESSAGES.GENERIC_ERROR];
            const json = await response.json();
            return [true, json];
        } catch (error) {
            return [false, error];
        }
    };

    const rename_project = async (id, projectData) => {
        try {
            const response = await fetch(`${API_ENDPOINT.API_BASE_URL}${id}/`, createRequestOptions('PUT', projectData));
            if (!response.ok) return [false, ERROR_MESSAGES.GENERIC_ERROR];
            const json = await response.json();
            return [true, json];
        } catch (error) {
            return [false, error];
        }
    };

    const get_project = async (id) => {
        try {
            const response = await fetch(`${API_ENDPOINT.API_BASE_URL}${id}/`, createRequestOptions('GET'));
            
            if (!response.ok) {
                let errorMessage = ERROR_MESSAGES.GENERIC_ERROR; 
                try {
                    const errorJson = await response.json();
                    errorMessage = errorJson;
                } catch (jsonError) {
                    console.error('Failed to parse error response:', jsonError);
                }
                return [false, errorMessage];
            }
            const json = await response.json();
            return [true, json];
            
        } catch (error) {
            return [false, error];
        }
    }

    {/*
        
    */}

    const uploadFileAsAttachment = async (projectId, file) => {
        console.log('=== STARTING UPLOAD ===');
        console.log('Project ID:', projectId);
        console.log('File:', file);
        console.log('File constructor:', file.constructor.name);
        console.log('========================');
        return new Promise((resolve, reject) => {
            // Validate file object
            if (!file || !(file instanceof File)) {
                reject(new Error('Invalid file object provided'));
                return;
            }

            console.log('Starting file upload for:', file.name);
            
            const reader = new FileReader();

            // Set up the onload callback
            reader.onload = async (event) => {
                try {
                    console.log('File read successfully, starting upload...');
                    const binaryData = event.target.result;

                    const response = await fetch(`${API_ENDPOINT.API_BASE_URL}${projectId}/add_report/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/octet-stream',
                            'Content-Disposition': `attachment; filename="${file.name}"`
                        },
                        body: binaryData
                    });

                    console.log('Upload response status:', response.status);

                if (!response.ok) {
                    const errorResponse = await response.json();
                    console.error('Upload failed:', errorResponse);
                    reject(errorResponse);
                } else {
                    // Debug: Check the response content type and body
                    console.log('Response headers:', response.headers);
                    console.log('Response content-type:', response.headers.get('content-type'));
                    
                    const responseText = await response.text();
                    console.log('Raw response text:', responseText);
                    
                    try {
                        const result = JSON.parse(responseText);
                        console.log('Upload successful:', result);
                        resolve([true, result]);
                    } catch (jsonError) {
                        console.error('JSON parsing error:', jsonError);
                        console.error('Response was not valid JSON:', responseText);
                        // Still resolve as successful since we got 200 OK
                        resolve([true, { message: 'Upload successful', raw: responseText }]);
                    }
                }
                } catch (error) {
                    console.error('Error during upload:', error);
                    reject(error);
                }
            };

            // Set up error handling for the reader
            reader.onerror = (error) => {
                console.error('File reading error:', error);
                reject(new Error('Failed to read file: ' + error.message));
            };

            // Add try-catch around readAsArrayBuffer
            try {
                console.log('Starting to read file as ArrayBuffer...');
                reader.readAsArrayBuffer(file);
            } catch (error) {
                console.error('FileReader.readAsArrayBuffer error:', error);
                reject(new Error('Failed to start file reading: ' + error.message));
            }
        });
    };

    return {
        connect_api,
        create_project,
        delete_project,
        rename_project,
        get_project,
        uploadFileAsAttachment
    };
};

export default Project_API;