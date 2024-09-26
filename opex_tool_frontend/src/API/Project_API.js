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
        try{
            const response = await fetch(`${API_ENDPOINT.API_BASE_URL}${id}/`, createRequestOptions('GET'));
            if(!response.ok) return [false, ERROR_MESSAGES.GENERIC_ERROR];;
            const json = await response.json();
            return [true, json];
        }catch(error){
            return [false, error];
        }
    }

    {/*
        
    */}

    const uploadFileAsAttachment = async (projectId, file) => {
        const reader = new FileReader(); // Create a FileReader to read the file contents
    
        // Read the file as a binary string
        reader.onload = async (event) => {
            const binaryData = event.target.result; // Get the binary contents of the file as ArrayBuffer
    
            try {
                const response = await fetch(`${API_ENDPOINT.API_BASE_URL}${projectId}/add_report/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/octet-stream', // Assuming binary data
                        'Content-Disposition': `attachment; filename="${file.name}"` // Manually setting Content-Disposition
                    },
                    body: binaryData // Send binary data directly
                });
    
                if (!response.ok) {
                    const errorResponse = await response.json();
                    return [false, errorResponse];
                }
    
                const result = await response.json(); // Parse successful response
                console.log(result);
                return [true, result];
            } catch (error) {

                console.error('Error during upload:', error);
                return [false, error];
            }
        };
    
       return reader.readAsArrayBuffer(file); // Read file as ArrayBuffer
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