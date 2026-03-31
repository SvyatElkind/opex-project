import { ERROR_MESSAGES, API_ENDPOINT } from "../Constants/Constants";

  const Project_API = () => {
    const createRequestOptions = (method, body = null) => ({
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : null,
    });


    // Initial project list fetch on Workspace load
    const connect_api = async () => {
        try {
            const response = await fetch(API_ENDPOINT.API_BASE_URL, createRequestOptions('GET'));

            if (response.status === 500) {
                return [true, []];
            }

            if (!response.ok) {
                if (response.status === 204) {
                    return [true, []];
                }
                return [false, ERROR_MESSAGES.BACKEND_SERVER_ERROR];
            }
            const text = await response.text();
            if (!text) {
                return [true, []];
            }

            const json = JSON.parse(text);
            return [true, json];

        } catch (error) {
            return [false, error.message || ERROR_MESSAGES.GENERIC_ERROR];
        }
    };

    const create_project = async (projectData) => {
        try {
            const response = await fetch(API_ENDPOINT.API_BASE_URL, createRequestOptions('POST', projectData));
            if (!response.ok) return [false, ERROR_MESSAGES.GENERIC_ERROR];
            const json = await response.json();
            return [true, json];
        } catch (error) {
            return [false, error.message || ERROR_MESSAGES.GENERIC_ERROR];
        }
    };

    const delete_project = async (id) => {
        try {
            const response = await fetch(`${API_ENDPOINT.API_BASE_URL}${id}/`, createRequestOptions('DELETE'));
            if (!response.ok) return [false, ERROR_MESSAGES.GENERIC_ERROR];
            const json = await response.json();
            return [true, json];
        } catch (error) {
            return [false, error.message || ERROR_MESSAGES.GENERIC_ERROR];
        }
    };

    const rename_project = async (id, projectData) => {
        try {
            const response = await fetch(`${API_ENDPOINT.API_BASE_URL}${id}/`, createRequestOptions('PUT', projectData));
            if (!response.ok) return [false, ERROR_MESSAGES.GENERIC_ERROR];
            const json = await response.json();
            return [true, json];
        } catch (error) {
            return [false, error.message || ERROR_MESSAGES.GENERIC_ERROR];
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
                } catch {
                    // Could not parse error response
                }
                return [false, errorMessage];
            }
            const json = await response.json();
            return [true, json];
            
        } catch (error) {
            return [false, error.message || ERROR_MESSAGES.GENERIC_ERROR];
        }
    };

    const uploadFileAsAttachment = async (projectId, file) => {
        return new Promise((resolve, reject) => {
            if (!file || !(file instanceof File)) {
                reject(new Error('Invalid file object provided'));
                return;
            }

            const reader = new FileReader();

            reader.onload = async (event) => {
                try {
                    const binaryData = event.target.result;
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
                        reject(errorResponse);
                    } else {
                        const responseText = await response.text();
                        try {
                            const result = JSON.parse(responseText);
                            resolve([true, result]);
                        } catch {
                            resolve([true, { message: 'Upload successful', raw: responseText }]);
                        }
                    }
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = (error) => {
                reject(new Error('Failed to read file: ' + error.message));
            };

            try {
                reader.readAsArrayBuffer(file);
            } catch (error) {
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