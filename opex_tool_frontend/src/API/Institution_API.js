import { ERROR_MESSAGES, API_ENDPOINT } from "../Constants/Constnats";



const Institution_API = () => {

  const createRequestOptions = (method, body = null) =>({
    method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : null,
  })

  const addSigners = async(projectId,institutionId,signersData) =>{
    try{
        const response = await fetch(`${API_ENDPOINT.API_BASE_URL}${projectId}/institution/${institutionId}/`,createRequestOptions('PUT',signersData));
        if(!response.ok){
            console.error("Error response status:", response.status);
            return [false, ERROR_MESSAGES.BACKEND_SERVER_ERROR];
        }
        const json = await response.json();
        return [true, json];
    }catch(error){
        return[false, error];
    }
  }

  const updateSignerField = async (projectId, institutionId, updatedInstitutionData) => {
    try {
        const updateData = { 
            creator: updatedInstitutionData.creator,
            creator_position: updatedInstitutionData.creator_position,
            signer: updatedInstitutionData.signer,
            signer_position: updatedInstitutionData.signer_position 
        };
        const response = await fetch(`${API_ENDPOINT.API_BASE_URL}${projectId}/institution/${institutionId}/`, createRequestOptions('PUT', updateData));
        if (!response.ok) {
            console.error("Error response status:", response.status);
            return [false, ERROR_MESSAGES.BACKEND_SERVER_ERROR];
        }
        const json = await response.json();
        return [true, json];
    } catch (error) {
        return [false, error];
    }
};

    return { addSigners, updateSignerField};
};

export default Institution_API;