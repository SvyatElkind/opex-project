import React from "react";

class Project extends React.Component{
   

    constructor(){
        super();
        this.tabs = [1,2,3] 
        this.Project = {

        }
        this.Fonds =  {

        }
        
    }

    render(){
        return (
            <div className="project_tabs">
            {this.tabs.map((tab,index) =>{return <button key={index}>{tab}</button>})}
            </div>
        )
    }
}

export default Project