import React, { useState, useEffect, Component } from 'react';



class Project_API extends Component{
  constructor(){
    super();
    this.state = { data:[] };
    this.requestoptions = {
      method : "GET"
    };
  }
  async connect_api(){
    try{
      const response = await fetch('/api/v1/projects/1/',this.requestoptions);
      const json = await response.json();
      this.state = { data: json };
    } catch (error){
      console.log(error)
      return false;
    }
  }

}

export default Project_API;