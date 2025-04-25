import { API_ENDPOINT, ERROR_MESSAGES } from "../Constants/Constnats";

const Inventory_API = () =>{
    const createRequestOptions = (method, body = null) =>({
        method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: body ? JSON.stringify(body) : null,
      });

    const createInventory = async (projectId,fondId,inevntoryData) =>{
        try{ 
            const response = await fetch(`${API_ENDPOINT.API_BASE_URL}${projectId}/inventory/?fond_id=${fondId}`,createRequestOptions('POST',inevntoryData))

            if(!response.ok){
                console.error("Error response status:", response.status);
                return[false, ERROR_MESSAGES.BACKEND_SERVER_ERROR];
            }
            const json = await response.json();
            return [true, json];
        }catch(error){
            console.log(error)
        }


    }

    const deleteInventory = async(projectId,inventoryId) => {
        try{
            const response = await fetch(`${API_ENDPOINT.API_BASE_URL}${projectId}/inventory/${inventoryId}/`,createRequestOptions('DELETE'));

            if(!response.ok){
                console.error("Error response status:", response.status);
                return[false, ERROR_MESSAGES.BACKEND_SERVER_ERROR];
            }
            const json = await response.json();
            return [true, json];
        }catch(error){
            console.log(error)
            return[false, error];
        }
    }

    return{
        createInventory,
        deleteInventory
    }


}
export default Inventory_API