import React, { Component } from 'react';
import { Navbar, Dropdown } from "react-bootstrap";

class Footer extends Component {

  render() {
    return (
        
        <Navbar  bg="primary" variant="dark" style={{justifyContent: 'space-between', height: '5em', marginTop: '1em' }}>
          <Navbar.Brand href="/" style={{marginLeft: '1em'}}>contact@afflubot.fr</Navbar.Brand>
    
     
        </Navbar>
    )
  }
 
}

export default Footer
