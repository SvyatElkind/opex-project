import { ERROR_MESSAGES } from "../Constants/Constnats";


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
            if (!response.ok) return [false, ERROR_MESSAGES.BACKEND_SERVER_ERROR];
            const json = await response.json();
            return [true, json];
        } catch (error) {
            return [false, error];
        }
    };

    const create_project = async (projectData) => {
        try {
            const response = await fetch(API_BASE_URL, createRequestOptions('POST', projectData));
            if (!response.ok) return [false, ERROR_MESSAGES.GENERIC_ERROR];
            const json = await response.json();
            return [true, json];
        } catch (error) {
            return [false, error];
        }
    };

    const delete_project = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}${id}/`, createRequestOptions('DELETE'));
            if (!response.ok) return [false, ERROR_MESSAGES.GENERIC_ERROR];
            const json = await response.json();
            return [true, json];
        } catch (error) {
            return [false, error];
        }
    };

    const rename_project = async (id, projectData) => {
        try {
            const response = await fetch(`${API_BASE_URL}${id}/`, createRequestOptions('PUT', projectData));
            if (!response.ok) return [false, ERROR_MESSAGES.GENERIC_ERROR];
            const json = await response.json();
            return [true, json];
        } catch (error) {
            return [false, error];
        }
    };

    const get_project = async (id) => {
        try{
            const response = await fetch(`${API_BASE_URL}${id}/`, createRequestOptions('GET'));
            if(!response.ok) return [false, ERROR_MESSAGES.GENERIC_ERROR];;
            const json = await response.json();
            return [true, json];
        }catch(error){
            return [false, error];
        }
    }

    const uploadReport = async (projectId, file) => {
        const formData = new FormData();
        formData.append("report", file);
        try {
            const response = await fetch(`${API_BASE_URL}${projectId}/add_report/`, createRequestOptions('POST', formData));
            if (!response.ok) return [false, ERROR_MESSAGES.GENERIC_ERROR];
            const json = await response.json();
            return [true, json];
        } catch (error) {
            return [false, "TEST" + error];
        }
    }

    const setStructure = async (id) => {
        try{
            const response = await fetch(`${API_BASE_URL}`);
            if(!response.ok) return [false, ERROR_MESSAGES.GENERIC_ERROR];
            const json = await response.json();
            return [true, json];
        }catch(error){
            return [false,error];
        }
    }

    return {
        connect_api,
        create_project,
        delete_project,
        rename_project,
        get_project,
        uploadReport,
        setStructure
    };
};

export default Project_API;