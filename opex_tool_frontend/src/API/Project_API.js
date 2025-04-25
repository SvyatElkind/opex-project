import { ERROR_MESSAGES, API_ENDPOINT } from "../Constants/Constnats";

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

            if (!response.ok) {
                console.error("Error response status:", response.status);
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
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
    
            // Set up the onload callback
            reader.onload = async (event) => {
                const binaryData = event.target.result;
    
                try {
                    const response = await fetch(`${API_ENDPOINT.API_BASE_URL}${projectId}/add_report/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/octet-stream',
                            'Content-Disposition': `attachment; filename="${file.name}"`
                        },
                        body: binaryData
                    });
    
                    if (!response.ok) {
                        const errorResponse = await response.json();
                        reject(errorResponse); // Reject promise on error
                    } else {
                        const result = await response.json(); // Parse successful response
                        resolve([true, result]); // Resolve the promise with the result
                    }
                } catch (error) {
                    console.error('Error during upload:', error);
                    reject(error); // Reject promise on error
                }
            };
    
            // Set up error handling for the reader
            reader.onerror = (error) => {
                console.error('File reading error:', error);
                reject(error); // Reject if there's a file reading error
            };
    
            reader.readAsArrayBuffer(file); // Read file as ArrayBuffer
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