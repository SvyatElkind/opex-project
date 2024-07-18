import React from "react";
import "./Document.css"
import File_Name from "../Fields/File_Name";

class Document extends React.Component{
   

    constructor(){
       super();

       this.lables = [
        "FILE NAME",
        "FILE SIZE",
        "FILE DESCRIPTION",
        "FILE PATH",
        "FILE AUTHOR",
        "FILE RADIO SELECT",
        "asdads",
        "absdkabdsk"
    ]
       this.texts = [
        "NAME",
        "SIZE",
        "DISCRIPTION",
        "PATH",
        "AUTHOR",
        "RADIO",
        "",
        "asdasda"
    ]
    }
    


    render(){
        return (
            <div className="document Container">
            
            {this.lables.map((lable,index) =>{

                if(lable === "FILE DESCRIPTION"){
                    return <div>
                    <h5 key={index}>{lable}</h5>
                    <textarea type="" key={index} placeholder={this.texts[index]}></textarea>
                    </div>
                }

                if(lable === "FILE RADIO SELECT"){
                    return <div>
                    <h5 key={index}>{lable}</h5>
                    <input type="radio" key={index} placeholder={this.texts[index]}></input>
                    </div>
                }

                if(lable === "FILE NAME"){
                    return <File_Name>
                        {[lable, index]}
                    </File_Name>
                }
                
                else{
                    return <div>
                    <h5 key={index}>{lable}</h5>
                    <input type="text" key={index} placeholder={this.texts[index]}></input>
                    </div>

                }

            })}
            <button className="btn_prev">{"<-"}</button>
            <button className="btn_next">{"->"}</button>
            </div>
        )
    }
}

export default Document