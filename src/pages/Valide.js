import React, { Component } from 'react';
import { Footer, Header } from '../components';
import { Form, Button, Spinner, Alert } from "react-bootstrap";
import axios from 'axios';


class Valide extends Component {
  state = {
    email: "",
    render: 'choose_bibli',
    render_mail_inconnu: false,
    bibli: 'BSB'
  };


  connexion = async (event) => {
    this.setState({ render_mail_inconnu: false })
    event.preventDefault();
    this.setState({ render: 'loading' });
    if (this.state.email !== '') {
      axios.get(
        'https://treipmf3ub.execute-api.eu-west-3.amazonaws.com/dev/bsb/' + this.state.email + '/' + this.state.bibli, { 'headers': { 'Content-Type': 'application/json' } 
      }).then(response => { 
        if(response['data'].substring(0,10) === "auth_token") {
          this.setState({ 
            render: 'validation'
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
        this.setState({ render: 'error' })
      });
  
    }
   
  };

  chooseBibli = (event) => {
    event.preventDefault();
    if (this.state.bibli !== ""){
      this.setState({ render: 'email' });
    }
  }

  validate = (event) => {
    event.preventDefault();
    if (this.state.email !== '') {
      this.setState({ render: 'loading' });
      var validation_code = (this.state.bibli == 'BSB') ? 'PAQI' : 'YZ7I'
      const body = {
        email: this.state.email,
        validationCode: validation_code
      } 
      axios.post(
        'https://reservation.affluences.com/api/validateReservation', body , { 'headers': { 'Content-Type': 'application/json' } }
        ).then(response => { 
          this.setState({ render: 'presence_validee' });
        })
        .catch(error => {
          this.setState({ render: 'error' })
        });
  
    }
  }

  render() {
    return (
      <div> 
        <Header history={this.props.history} />
        <div style={{marginTop: '10em', marginLeft: '2em', marginRight: '2em'}}>
          <h2>Valider sa présence</h2>
        {
          this.state.render === 'email' 
          &&
          <div>
            <p>Commence par rentrer ton adresse mail qui est liée à ton compte de la {this.state.bibli}</p>
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
                  On ne partagera pas ton email.
                </Form.Text>
              </Form.Group>
        
              <Button variant="primary" type="submit">
                Valider
              </Button>
            </Form>
          </div>
        }
        {
          this.state.render === 'choose_bibli' && 
          <div>
          <Form onSubmit={this.chooseBibli}>
              <div style={{marginTop: '2em'}}>
              <select style={{width: '100%', height: '2em'}} value={this.state.bibli} onChange={e => this.setState({ bibli: e.target.value })}>
                <option value="BSB">BSB</option>
                <option value="BSG">BSG</option>
              </select>
              </div>

              <Button variant="primary" type="submit" style={{marginTop: '2em'}}>
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
          this.state.render === 'validation' &&
          <div>
            <p> Si tu n'es pas à la {this.state.bibli} et que tu souhaites arriver plus tard, va plutôt dans l'onglet 'Décaler ma reservation', pour être sûr de pouvoir la changer sans la perdre </p>
            <Form onSubmit={this.validate}>
              <Button variant="primary" type="submit" style={{marginTop: '2em'}}>
                Valider sa présence
              </Button>
            </Form>

            </div>
        }
        {
          this.state.render === 'presence_validee' &&
          <p> Ta présence à été validée, vérifie tes mails. </p>
           

        }
        {
          this.state.render === 'error' && 
          <p>Es tu tu sûr d'avoir une réservation ? Pour rappel, la validation est possible de 10 mn avant à 15 mn après l'heure de départ. Si l'erreur persiste, contacte nous à contact@afflubot.fr</p>

        }
        {
          this.state.render === 'check_mail' && 
        <div>

          <p>S'il s'agit d'un mail connecté à un compte de la {this.state.bibli}, tu vas recevoir un mail, clique sur le lien</p>
          <Form onSubmit={this.connexion}>
              <Button variant="primary" type="submit" style={{marginTop: '2em'}}>
                J'ai validé mon mail
              </Button>
            </Form>
          </div>
        }
        {
          this.state.render_mail_inconnu === true && 
          <Alert style={{marginTop: '10px'}} variant={'dark'}>Le mail n'est pas relié à un compte de la {this.state.bibli}</Alert>

        }
       
        </div>

        <Footer style={{ marginTop: '20em' }}/>
      </div>
    )
  }
 
}

export default Valide
