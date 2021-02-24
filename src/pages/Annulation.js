import React, { Component } from 'react';
import { Footer, Header } from '../components';
import { Form, Button, Spinner, ListGroup, Alert } from "react-bootstrap";
import axios from 'axios';


class Annulation extends Component {
  //WILL BE A PROBLEM IF RESA < 10H : time => 9 and not 09 TO DO
  state = {
    email: "",
    reservation: [],
    annulation_confirmee: false,
    render_mail_inconnu: false,
    render: 'email'
    };


  
  get_reservation_requests = () => {
    axios.get(
      'https://treipmf3ub.execute-api.eu-west-3.amazonaws.com/dev/bsb/send_reservation_request/' + this.state.email, { 'headers': { 'Content-Type': 'application/json' } 
    }).then(response => { 
      if(response['data']) {
        this.setState({ reservation: response['data']});
        this.setState({ render: 'reservation' });
      }
      else {
        this.setState({ render: 'error' });
      } 
    })
    .catch(error => {
      this.setState({ render: 'error' });
    });
  }


  connexion = async (event) => {
    event.preventDefault();
    this.setState({ render: 'loading' })
    this.setState({ render_mail_inconnu: false })
    this.setState({ annulation_confirmee: false })
    
    if (this.state.email !== '') {
      axios.get(
        'https://treipmf3ub.execute-api.eu-west-3.amazonaws.com/dev/bsb/' + this.state.email + '/none', { 'headers': { 'Content-Type': 'application/json' } 
      }).then(response => { 
        this.setState({ loading: false })
        if(response['data'].substring(0,10) === "auth_token") {
          this.get_reservation_requests()
          this.setState({ 
            render: 'reservation'
         })
        }
        else if(response['data'] === "email_not_found") {
          this.setState({ render: 'email' });
          this.setState({ render_mail_inconnu: true })
        }
        else if (response['data'] === 'False') {
          this.setState({ render: 'check_mail' })
        }
        else {
          this.setState({ render: 'error' })

        }
      })
      .catch(error => {
        this.setState({ loading: false })
        this.setState({ render: 'error' })
      });
  
    }
   
  };


  annulation = (i) => {
    this.setState({ render: 'loading' });
    const resa = this.state.reservation[i]
    const body = {
      id_request: resa[0]
    }
    axios.post(
      'https://treipmf3ub.execute-api.eu-west-3.amazonaws.com/dev/bsb/reservation_request_annulation', body , { 'headers': { 'Content-Type': 'application/json' } }
      ).then(response => { 
  
        if(response['data'] === "True") {
          this.setState({ annulation_confirmee: true })
          var array = this.state.reservation
          array.splice(i, 1)
          this.setState({ reservation: array})
          this.setState({ render: 'reservation' });
        }
        else  {
          this.setState({ render: 'error' })
        }
      })
      .catch(error => {
        this.setState({ render: 'error' })
      });
  }

  render() {
    return (
      <div> 
        <Header history={this.props.history} />
        
        <div style={{marginTop: '10em', marginLeft: '2em', marginRight: '2em'}}>
        <h2>Annuler une demande de réservation</h2>
        {
          this.state.render === 'email' 
          &&
          <div>
            <p>Commence par rentrer ton adresse mail qui est liée à tes demandes de réservations</p>
            <Form onSubmit={this.connexion}>
              <Form.Group>
                <Form.Control
                  className="text-muted"
                  placeholder="Email"
                  value={this.state.email}
                  onChange={e => this.setState({ email: e.target.value })}
                  type="email"
                />
                <Form.Text className="text-muted">
                  On ne partagera pas votre email.
                </Form.Text>
              </Form.Group>
        
              <Button variant="primary" type="submit">
                Valider
              </Button>
            </Form>
          </div>
        }
        { this.state.render === 'loading' &&
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading...</span>
        </Spinner>
        } 

        {
          this.state.annulation_confirmee === true && 
          <Alert variant={'dark'}>Demande de réservation annulée </Alert>

        }
        
        {
          this.state.render === 'reservation' &&
          <div>
            <p> Voici tes demandes de réservations </p>
            <ListGroup variant="flush">
              {this.state.reservation.map((resa, i) => {     
              return (<ListGroup.Item key={i}>{resa[3]} de {resa[4]} à  {resa[5]} <Button onClick={() => this.annulation(i)}> <span aria-hidden="true">&times;</span> </Button> </ListGroup.Item>) 
              })}
            </ListGroup>

            </div>
        }
        {
          this.state.render === 'error' && 
          <p>Erreur inconnue, essayez plus tard ou contacte nous à contact@afflubot.fr</p>

        }
        {
          this.state.render === 'check_mail' && 
        <div>

          <p>S'il s'agit d'un mail connecté à un compte Affluence, tu vs recevoir un mail, clique sur le lien</p>
          <Form onSubmit={this.connexion}>
              <Button variant="primary" type="submit" style={{marginTop: '2em'}}>
                J'ai validé mon mail
              </Button>
            </Form>
          </div>
        }
        {
          this.state.render_mail_inconnu === true && 
          <Alert style={{marginTop: '10px'}} variant={'dark'}>Le mail n'est pas relié à un compte Affluence</Alert>

        }
       
        </div>

        <Footer style={{ marginTop: '20em' }}/>
      </div>
    )
  }
 
}

export default Annulation
