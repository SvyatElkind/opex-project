import React from "react";


class File_Name extends React.Component{
constructor(arr){
    super();
    this.lable = arr[0]
    this.index = arr[1]
    console.log(this.lable, this.index)
}

render(){
  return (<div><h1 key={this.index}>{this.lable}</h1></div>)
}



}
export default File_Name