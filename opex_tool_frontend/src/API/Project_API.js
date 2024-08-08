const API_BASE_URL = '/api/v1/project/';


  const Project_API = () => {
    const createRequestOptions = (method, body = null) => ({
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : null,
    });

    const connect_api = async () => {
        try {
            const response = await fetch(API_BASE_URL, createRequestOptions('GET'));
            if (!response.ok) throw new Error("Network response was not ok");
            const json = await response.json();
            return [true, json]; 
        } catch (error) {
            return [false, error];
        }
    };

    const create_project = async (projectData) => {
        try {
            const response = await fetch(API_BASE_URL, createRequestOptions('POST', projectData));
            if (!response.ok) throw new Error("Network response was not ok");
            const json = await response.json();
            return [true, json];
        } catch (error) {
            return [false, error];
        }
    };

    const delete_project = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}${id}/`, createRequestOptions('DELETE'));
            if (!response.ok) throw new Error("Network response was not ok");
            const json = await response.json();
            return [true, json];
        } catch (error) {
            return [false, error];
        }
    };

    const rename_project = async (id, projectData) => {
        try {
            const response = await fetch(`${API_BASE_URL}${id}/`, createRequestOptions('PUT', projectData));
            if (!response.ok) throw new Error("Network response was not ok");
            const json = await response.json();
            return [true, json];
        } catch (error) {
            return [false, error];
        }
    };

    const get_project = async (projectData) => {
        try{
            const response = await fetch(`${API_BASE_URL}${id}/`, createRequestOptions('GET', projectData));
            if(!response.ok) throw new Error("Network response was not ok");
            const json = await response.json();
            return [true, json];
        }catch(error){
            return [false, error];
        }
        
    }


    return {
        connect_api,
        create_project,
        delete_project,
        rename_project,
        get_project
    };
};

export default Project_API;