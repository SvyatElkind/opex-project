import React, { useState } from "react";
import { UI_TEXT } from "../Constants/Constnats";

const Fond = ({fond}) =>{

    const [fondData, setFondData] = useState();

    console.log("Fond: ")
    console.log(fond);
    
    return(
        <div className="detailItem">
            <h1>
                {fond.fond_code}
            </h1>
            <ul>
                <li><strong>{UI_TEXT.FOND_TITLE}</strong>{fond.fond_title}</li>
                <li><strong>{UI_TEXT.FOND_ID}</strong>{fond.id}</li>
                <li><strong>{UI_TEXT.FOND_CODE}</strong>{fond.fond_code}</li>
                <li><strong>{UI_TEXT.FOND_ARCH_ABREVIATION}</strong>{fond.arch_abriviation}</li>
                <li><strong>{UI_TEXT.FOND_ARCH_TITLE}</strong>{fond.arch_title}</li>
                <li><strong>{UI_TEXT.FOND_NUMBER}</strong>{fond.fond_number}</li>
                <li><strong>{UI_TEXT.FOND_SUBFOND}</strong>{fond.subfond}</li>
            </ul>
        </div>)
}

export default Fond;