import React from "react";

class Project extends React.Component{
   

    constructor(data){
        super();
        this.state = {
            data:data.data,
            PopupIsOpen : false
        }
        this.data = data;
        console.log(this.data);
        this.form = null;
        
        
    }
    togglePopup(){
        this.setState({PopupIsOpen: true});
    }
    project_display(){
        console.log(this.state.PopupIsOpen)
    }

    render(){
        if(this.data == null){
            this.setState({PopupIsOpen: true});
        } else {
            this.form = <h1>LOADED</h1>;
        }
        return (
            <div className="project_tabs">
                <input
                type="button"
                value="Click to Open Popup"
                onClick={this.project_display}/>
                <h5>{this.state.data.id}</h5>
                <h5>{this.state.data.name}</h5>
                <h5>{this.state.data.created_at}</h5>
            </div>
        )
    }
}

export default Project