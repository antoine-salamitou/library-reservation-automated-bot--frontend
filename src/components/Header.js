import React, { Component } from 'react';
import { Navbar, Dropdown } from "react-bootstrap";

class Header extends Component {
  componentDidMount(){
    document.title = "AffluBot"
  }
  render() {
    return (
        <Navbar fixed="top" bg="primary" variant="dark" style={{justifyContent: 'space-between', height: '5em' }}>
          <Navbar.Brand onClick={()=>this.props.history.push('/')} style={{marginLeft: '1em'}}>AffluBot</Navbar.Brand>
    
          <Dropdown style={{marginRight: '1em', background: 'rgb(211,211,211)'}}>
            <Dropdown.Toggle variant="success" id="dropdown-basic" style={{background: "rgb(211,211,211)", color: 'black'}}>
              Demande de réservation
            </Dropdown.Toggle>

            <Dropdown.Menu inline>
              <Dropdown.Item onClick={()=>this.props.history.push('/reservation')}>Demande de réservation</Dropdown.Item>
              <Dropdown.Item onClick={()=>this.props.history.push('/decaler_reservation')}>Reporter sa réservation</Dropdown.Item>
              <Dropdown.Item onClick={()=>this.props.history.push('/valider_presence')}>Valider sa présence</Dropdown.Item>
              <Dropdown.Item onClick={()=>this.props.history.push('/annuler_demande_reservation')}>Annuler une demande</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Navbar>
    )
  }
 
}

export default Header
