//import { useState } from "react";
//import $ from "jquery";
import "./App.css";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom"
import Title from "./components/header";
import Footer from "./components/footer";
 
function App() {
    return (
        <Router>
            <Title />

            <Footer />
        </Router>
    );
}
 
export default App;