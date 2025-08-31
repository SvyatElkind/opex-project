import { API_ENDPOINT, ERROR_MESSAGES } from "../Constants/Constnats";

const Item_API = () =>{

    const createRequestOptions = (method, body = null) =>({
        method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: body ? JSON.stringify(body) : null,
      });

    const createItem = async (itemData,projectId,inventoryId) =>{
        try{
            const response = await fetch(`${API_ENDPOINT.API_BASE_URL}${projectId}/item/?inventory_id=${inventoryId}`,createRequestOptions('POST',itemData));
            if(!response.ok) return [false, ERROR_MESSAGES.GENERIC_ERROR]
            const json = await response.json();
            return [true, json];

        }catch(error){
            return [false, error];

        }

    }
    const updateItem = async (itemData, projectId, itemId) => {
            try{
                const response = await fetch(`${API_ENDPOINT.API_BASE_URL}${projectId}/item/${itemId}/`, createRequestOptions('PUT', itemData));
                if(!response.ok) {
                    const errorData = await response.json();
                    return [false, errorData];
                }
                const json = await response.json();
                return [true, json];
            } catch(error) {
                return [false, error.message || ERROR_MESSAGES.GENERIC_ERROR];
            }
    }
    const deleteItem = async(projectId,itemId) =>{
        try{   
            const response = await fetch(`${API_ENDPOINT.API_BASE_URL}${projectId}/item/${itemId}/`,createRequestOptions('DELETE'));
            if(!response.ok) return [false, ERROR_MESSAGES.GENERIC_ERROR]
            const json = await response.json();
            return [true , json];

        }catch(error){
            return[false, error];
        }
    }

    return{
        createItem,
        updateItem,
        deleteItem
    };

}

export default Item_API;