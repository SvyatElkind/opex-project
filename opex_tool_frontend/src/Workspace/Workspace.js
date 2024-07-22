import React from "react";
import Project from "../Project/Project";
import Document from "../Document/Document";
import Inventory_Regestry from "../Inventory_Regestry/Inventory_Regestry";
import Inventory_Parcell from "../Inventory_Parcell/Inventory_Parcell";
import Project_API from "../API/Project_API";

import "./Workspace.css"

class Workspace extends React.Component{

  constructor(props){
    super(props);
    // *** Project Atributes ***
    // constructor creates empty variables relating to the project level
    // this attributes will be filled with data from the Project API
    // decisions and renders will be determent by the content of the attibutes
    //
    this.state = {
      ProjectAPIHasLoded: false
    }
    this.Project_API = null;
    this.Project_state = null;
    this.initiate_Project();
    this.Project = null;

  }

  async initiate_Project(){
    // *** Initate Project API ***
    // An async method that creates an instance of Project_API
    // Instance gets saved as an attibute to the Workspace Class
    // afterwards Project_API's Method "connect_api" gets called with await keyword
    // The state gets assing to the Workspace Class Atribute named Project_state
    // THe Project_API object gets destrojed
    // state Project Has been changed to true
    this.Project_API = new Project_API();
    
    if(await this.Project_API.connect_api()){
      return console.log("error while loding api")
    } else {
      this.Project_state = this.Project_API.state;
      this.Project_API = null;
      this.setState({ ProjectAPIHasLoded: true });
    }

  }
  parse_project(){
  }
  
  create_project(){
  }
  
  call_Project(){
  }
  get_project(){
  }


  render() {
      if(this.state.ProjectAPIHasLoded){
        this.projectElement = <Project data = {this.Project_state.data.project}/>;
      } else {
        this.ProjectElement = <Project data = {null}/>;
      }
      return (
        <div className="worspace_container">
          {this.projectElement}
        </div>
      );
  }
}

export default Workspace