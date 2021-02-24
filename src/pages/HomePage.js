import React, { Component } from 'react';
import { Card, Button} from "react-bootstrap";
import { Footer, Header } from '../components';

class HomePage extends Component {
  render() {
    return (
      <div> 
        <Header history={this.props.history} />
        <Card style= {{marginTop: '10em', marginLeft: '2em', marginRight: '2em' }}>
          <Card.Header>Demande de créneau</Card.Header>
          <Card.Body>
            <Card.Text>
              S'il n'y a plus de place pour les horaires que tu souhaites sur Affluence, indique le ici et dès qu'une place se libère, elle te sera réservée.
            </Card.Text>
            <Button onClick={() => this.props.history.push('/reservation')} variant="primary">Réserver</Button>
          </Card.Body>
        </Card>

        <Card style= {{marginTop: '1em', marginLeft: '2em', marginRight: '2em' }}>
          <Card.Header>Reporter sa réservation (il s'agit ici d'une réservation DÉJA validée sur Affluence)</Card.Header>
          <Card.Body>
            <Card.Text>
              Si tu arrives en retard, et que tu veux décaler ta réservation sans la perdre, clique ici, tu garderas la même place
            </Card.Text>
            <Button onClick={() => this.props.history.push('/decaler_reservation')} variant="primary">Reporter une réservation</Button>
          </Card.Body>
        </Card>

        <Card style= {{marginTop: '1em', marginLeft: '2em', marginRight: '2em' }}>
          <Card.Header>Valider sa présence</Card.Header>
          <Card.Body>
            <Card.Text>
              Valide ta présence sans passer par le QR code (tu dois te géolocaliser pour montrer que tu es bien à la bibliothèque)
            </Card.Text>
            <Button onClick={() => this.props.history.push('/valider_presence')} variant="primary">Valider sa présence</Button>
          </Card.Body>
        </Card>

        <Card style= {{marginTop: '1em', marginLeft: '2em', marginRight: '2em' }}>
          <Card.Header>Annuler une demande de réservation</Card.Header>
          <Card.Body>
            <Card.Text>
              Tu as demandé à Afflubot une reservation, mais tu souhaites l'annuler? 
            </Card.Text>
            <Button onClick={() => this.props.history.push('/annuler_demande_reservation')} variant="primary">Annuler une demande</Button>
          </Card.Body>
        </Card>

        <Footer></Footer>
      </div>
    )
  }
 
}

export default HomePage
