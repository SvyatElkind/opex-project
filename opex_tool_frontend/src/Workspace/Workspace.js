import React from "react";
import Project from "../Project/Project";
import Document from "../Document/Document";
import Inventory_Regestry from "../Inventory_Regestry/Inventory_Regestry";
import Inventory_Parcell from "../Inventory_Parcell/Inventory_Parcell";
import App from "../API/GET";

import "./Workspace.css"

class Workspace extends React.Component{

  constructor(){
    super()
    this.array = []
    this.json = {}
    this.index = null
  }
  onChange(){
    return
  }

  render() {
      return (
        <div className="worspace_container">
          <div className="project_container">
            <Project/>
          </div>
          <App/>
          <div className="Project_LVL">

            <div className="Inventory_reg_container">
              <Inventory_Regestry/>
            </div>

            <div className="Inventory_parcell_container">
              <Inventory_Parcell/>
            </div>

            <div className="doc_container">
              <Document/>
            </div>

          </div>
        </div>
      );
  }
}

export default Workspace