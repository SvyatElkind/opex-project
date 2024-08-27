const API_BASE_URL = '/api/v1/institution/';

const Institution_API = () => {
    const createRequestOptions = (method, body = null) => ({
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : null,
    });

    const createInstitution = async (institutionData) => {
        try {
            const response = await fetch(API_BASE_URL, createRequestOptions('POST', institutionData));
            if (!response.ok) throw new Error("Network response was not ok");
            const json = await response.json();
            return [true, json];
        } catch (error) {
            return [false, error];
        }
    };

    const getInstitutions = async () => {
        try {
            const response = await fetch(API_BASE_URL, createRequestOptions('GET'));
            if (!response.ok) throw new Error("Network response was not ok");
            const json = await response.json();
            return [true, json];
        } catch (error) {
            return [false, error];
        }
    };

    const getInstitution = async (institutionId) => {
        try {
            const response = await fetch(`${API_BASE_URL}${institutionId}/`, createRequestOptions('GET'));
            if (!response.ok) throw new Error("Network response was not ok");
            const json = await response.json();
            return [true, json];
        } catch (error) {
            return [false, error];
        }
    };

    const updateInstitution = async (institutionId, institutionData) => {
        try {
            const response = await fetch(`${API_BASE_URL}${institutionId}/`, createRequestOptions('PUT', institutionData));
            if (!response.ok) throw new Error("Network response was not ok");
            const json = await response.json();
            return [true, json];
        } catch (error) {
            return [false, error];
        }
    };

    const deleteInstitution = async (institutionId) => {
        try {
            const response = await fetch(`${API_BASE_URL}${institutionId}/`, createRequestOptions('DELETE'));
            if (!response.ok) throw new Error("Network response was not ok");
            const json = await response.json();
            return [true, json];
        } catch (error) {
            return [false, error];
        }
    };

    return {
        createInstitution,
        getInstitutions,
        getInstitution,
        updateInstitution,
        deleteInstitution,
    };
};

export default Institution_API;