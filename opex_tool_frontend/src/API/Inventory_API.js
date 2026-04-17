import { API_ENDPOINT, ERROR_MESSAGES } from "../Constants/Constants";

const Inventory_API = () =>{
    const createRequestOptions = (method, body = null) =>({
        method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: body ? JSON.stringify(body) : null,
      });

    const createInventory = async (projectId, fondId, inventoryData) => {
        try {
            const response = await fetch(`${API_ENDPOINT.API_BASE_URL}${projectId}/inventory/?fond_id=${fondId}`, createRequestOptions('POST', inventoryData));
            if (!response.ok) {
                return [false, ERROR_MESSAGES.BACKEND_SERVER_ERROR];
            }
            const json = await response.json();
            return [true, json];
        } catch (error) {
            return [false, error.message || ERROR_MESSAGES.GENERIC_ERROR];
        }
    };
    const updateInventory = async (projectId, inventoryId, inventoryData) => {
        try {
            const response = await fetch(`${API_ENDPOINT.API_BASE_URL}${projectId}/inventory/${inventoryId}/`, createRequestOptions('PUT', inventoryData));
            if (!response.ok) {
                let errorMessage = ERROR_MESSAGES.BACKEND_SERVER_ERROR;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.detail || errorMessage;
                } catch (jsonError) {
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

    const deleteInventory = async (projectId, inventoryId) => {
        try {
            const response = await fetch(`${API_ENDPOINT.API_BASE_URL}${projectId}/inventory/${inventoryId}/`, createRequestOptions('DELETE'));
            if (!response.ok) {
                return [false, ERROR_MESSAGES.BACKEND_SERVER_ERROR];
            }
            // DELETE returns 204 No Content — don't parse body
            if (response.status === 204) {
                return [true, null];
            }
            const json = await response.json();
            return [true, json];
        } catch (error) {
            return [false, error.message || ERROR_MESSAGES.GENERIC_ERROR];
        }
    };

    return{
        createInventory,
        updateInventory,
        deleteInventory
    }


}
export default Inventory_API