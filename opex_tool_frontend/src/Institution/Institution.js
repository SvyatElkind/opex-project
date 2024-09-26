import React, { useEffect, useState } from "react";
import InstitutionSigners from "./IntitutionSigners";
import Project_API from "../API/Project_API";

const Institution = ({ institution }) => {
     
    const [institutionData, setInstitutionData] = useState(institution);
    const [signerFormVisability, setSignerFormVisability] = useState(false);
    const projectAPI = Project_API(); 

    

    const togglePopup = () => {
        setSignerFormVisability(prev => !prev);
    };

    const refreshInstitutionData = async () => {
        const [success,data] = await projectAPI.get_project(institution.project);
        if(success){
            console.log(data.institution);
            setInstitutionData(data.institution);
        }else{
            console.error("Failed to fetch institution data");
        }
    }

    useEffect(()=>{},[institutionData]);

    return (
        <div className="detailItem">
            {institution.lenght === 0 ? (<p>inventārs tukšs</p>) : (
                <div>
                    {institutionData && (
                        <div >
                            <h1>{institution.name}</h1>
                            <ul>
                                <li><strong>ID: </strong>{institutionData.id}</li>
                                <li><strong>Reģistrācijas Numurs: </strong>{institutionData.reg_nr}</li>
                                <li><strong>Projekta ID: </strong>{institutionData.project}</li>
                                <li><strong>Institūcijas veidotājs: </strong>
                                {institutionData.creator === "" ? "nav norādīts" :institutionData.creator}</li>
                                <li><strong>Institūcijas veidotāja pozīcija: </strong>
                                {institutionData.creator_position === "" ? "nav norādīts" : institutionData.creator_position}</li>
                                <li><strong>institūcijas parakstītājs: </strong>
                                {institutionData.signer === "" ? "nav norādīts" : institutionData.signer}</li>
                                <li><strong>institūcijas parakstītāja pozīcija: </strong>
                                {institutionData.signer_position === "" ? "nav norādīts" : institutionData.signer_position}</li>
                            </ul>
                            <input type="button" onClick={togglePopup} value={'piešķirt parakstītājus'}/>
                        </div>
                    )}
                    {signerFormVisability && (
                        <InstitutionSigners 
                            institution = {institutionData} 
                            onClose={togglePopup}
                            onSignersAdded={refreshInstitutionData}
                        />
                    )}
                </div>
            )}
        </div>
    )
}

export default Institution;