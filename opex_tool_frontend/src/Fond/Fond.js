import React, { useState } from "react";
import { UI_TEXT } from "../Constants/Constnats";

const Fond = ({fond}) =>{

    const [fondData, setFondData] = useState();
    
    return(
        <div className="detailItem">
            <p><strong>{fond.arch_title}</strong> <strong>{fond.fond_number}</strong> "<strong>{fond.fond_title}</strong>" (<strong>{fond.fond_code}</strong>)</p>
        </div>)
}

export default Fond;