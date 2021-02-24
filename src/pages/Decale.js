import React, { Component } from 'react';
import { Footer, Header } from '../components';
import { Form, Button, Spinner, ListGroup, Alert } from "react-bootstrap";
import axios from 'axios';

class Decale extends Component {
  state = {
    email: "",
    render: 'email',
    render_mail_inconnu: false,
    reservation: [],
    selectDate: false,
    hour_start_new: '10:00',
    hour_end_new: '20:00',
    no_auth_token: false,
    auth_token: '',
    reservation_decalee: false,
    horaires: {
      '10:00': "10:00",
      '10:30': '10:30',
      '11:00': '11:00',
      '11:30': '11:30',
      '12:00': '12:00',
      '12:30': '12:30',
      '13:00': '13:00',
      '13:30': '13:30',
      '14:00': '14:00',
      '14:30': '14:30',
      '15:00': '15:00',
      '15:30': '15:30',
      '16:00': '16:00',
      '16:30': '16:30',
      '17:00': '17:00',
      '17:30': '17:30',
      '18:00': '18:00'
    },
    horaires_start_temp: {

    },
    horaires_end_temp: {

    }
  };

  fetchComingReservations = () => {
    const headers = { 
      'Content-Type': 'application/json' ,
      'authorization' : 'Bearer ' + this.state.auth_token
    }
    axios.get(
      'https://reservation.affluences.com/api/myreservations', { 'headers': headers}
      ).then(response => { 
        // to do status code
        var reservations = response.data.results
        const res = reservations.filter(({
          state
        }) => ['UPCOMING'].includes(state));
        this.setState({ reservation: res });

        this.setState({ render: 'reporter' })
      })
      .catch(error => {
        this.setState({ render: 'error' })
      });

 
  }


  setHoursForForm = () => {
    var filtered = Object.fromEntries(Object.entries(this.state.horaires).filter(([k,v]) => v != '10:00'));
    this.setState({ horaires_start_temp: this.state.horaires, horaires_end_temp: filtered })
  
  }

  connexion = async (event) => {
    event.preventDefault();

    this.setState({ render_mail_inconnu: false })
    this.setState({ render: 'loading' });
    if (this.state.email !== '') {
      axios.get(
        'https://treipmf3ub.execute-api.eu-west-3.amazonaws.com/dev/bsb/' + this.state.email + '/none', { 'headers': { 'Content-Type': 'application/json' } 
      }).then(response => { 
        if((response['data'].substring(0,10) === "auth_token" ) && (response['data'].substring(10) !== '000000')) {
          this.setState({ auth_token: response['data'].substring(10)})
          this.fetchComingReservations()
        }
        else if (response['data'].substring(10) === '000000') {
          this.setState({render: 'email'})
          this.setState({no_auth_token: true})
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

  setHoursForForm = (res) => {
    var start_hour_already_exist = res.reservation_start_datetime.substring(11, 16).split(':')
    var end_hour_already_exist = res.reservation_end_datetime.substring(11, 16).split(':')
    start_hour_already_exist = (parseInt(start_hour_already_exist[0]) + 1).toString() + ':' + start_hour_already_exist[1]
    end_hour_already_exist= (parseInt(end_hour_already_exist[0]) + 1).toString() + ':' + end_hour_already_exist[1]


    var filtered = Object.fromEntries(Object.entries(this.state.horaires).filter(([k,v]) => (v >= start_hour_already_exist) && (v <= end_hour_already_exist)));
    var filtered2 = Object.fromEntries(Object.entries(this.state.horaires).filter(([k,v]) => (v > start_hour_already_exist) && (v <= end_hour_already_exist)));
    this.setState({ horaires_start_temp: filtered, horaires_end_temp: filtered2, hour_start_new: start_hour_already_exist, hour_end_new: end_hour_already_exist })
  
  }

  select_res = (i) => {
    var new_res = []
    new_res.push(this.state.reservation[i])
    this.setState({ reservation: new_res })
    this.setState({ selectDate: true})
    this.setHoursForForm(this.state.reservation[i])
  }

  send_change_res = () => {
    this.setState({ render: 'loading' });
    this.setState({ error_date: false })
    const resa = this.state.reservation[0]
    var start_hour = resa['reservation_start_datetime'].substring(11, 16).split(':')
    var end_hour = resa['reservation_end_datetime'].substring(11, 16).split(':')
    start_hour = (parseInt(start_hour[0]) + 1).toString() + ':' + start_hour[1]
    end_hour = (parseInt(end_hour[0]) + 1).toString() + ':' + end_hour[1]
    if (!((this.state.hour_start_new >= start_hour ) && (this.state.hour_end_new <= end_hour )))   {
      this.setState({ error_date: true });
      this.setState({ selectDate: true})
      this.setState({ render: 'reporter' });
    }


    else {
      const body = {
      cancel_token: resa['cancellation_token'],
      resource_id: resa['resource_id'],
      date: resa['reservation_start_datetime'].substring(0, 10),
      stop_hour: this.state.hour_end_new,
      email: this.state.email,
      start_hour: this.state.hour_start_new
    }
    axios.post(
      'https://treipmf3ub.execute-api.eu-west-3.amazonaws.com/dev/bsb/delay_real_reservation', body , { 'headers': { 'Content-Type': 'application/json' } }
      ).then(response => { 
  
        if(response['data'] === "True") {
          this.setState({ render: 'reservation_decalee', selectDate: false })
        }
        else  {
          this.setState({ render: 'error', selectDate: false })
        }
      })
      .catch(error => {
        this.setState({ render: 'error', selectDate: false })
      });

  }
  }
  render() {
    return (
      <div> 
        <Header history={this.props.history} />
        <div style={{marginTop: '10em', marginLeft: '2em', marginRight: '2em'}}>
          <h2>Reporter sa réservation</h2>
          <p>Si tu as déja ta place sur Affluence, mais que tu veux la racourcir sans risquer de la perdre : </p>
        {
          this.state.render === 'email' 
          &&
          <div>
            <p>Commence par rentrer ton adresse mail qui est liée à ton compte Affluence</p>
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
        { this.state.render === 'loading' &&
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading...</span>
        </Spinner>
        } 
        
        {
          this.state.render === 'reporter' &&
          <div>
            <p> Choisis une réservation à reporter </p>
            <div>
              <ListGroup variant="flush">
                {this.state.reservation.map((resa, i) => {   
                  const date = resa['reservation_start_datetime'].substring(0, 10)
                  var start_hour = resa['reservation_start_datetime'].substring(11, 16).split(':')
                  var end_hour = resa['reservation_end_datetime'].substring(11, 16).split(':')
                  start_hour = (parseInt(start_hour[0]) + 1).toString() + ':' + start_hour[1]
                  end_hour = (parseInt(end_hour[0]) + 1).toString() + ':' + end_hour[1]
                  return (<button key={i} onClick={() => this.select_res(i)}> <ListGroup.Item key={i}> Le {date} de  {start_hour} à {end_hour} </ListGroup.Item> </button>)
                  })}
              </ListGroup>

            </div>

            </div>
        }
        {
          this.state.selectDate === true &&
          <div>
            <p>Nouveax horaires</p>
              <div style={{marginTop: '2em'}}>
              <select style={{width: '100%', height: '2em'}} value={this.state.hour_start_new} onChange={e => this.setState({ hour_start_new: e.target.value })}>
                {
                  Object.entries(this.state.horaires_start_temp).map( ([key, value]) => <option key={key}>{value}</option>)
                }
              </select>
              </div>
              <div style={{marginTop: '2em'}}>
 
                <select style={{width: '100%', height: '2em'}} value={this.state.hour_end_new} onChange={e => this.setState({ hour_end_new: e.target.value })}>
                 {
                  Object.entries(this.state.horaires_end_temp).map( ([key, value]) => <option key={key}>{value}</option>)
                  }
                </select>
              </div>
                
              <Button onClick={() => this.send_change_res()} variant="primary" type="submit" style={{marginTop: '2em'}}>
                Reporter
              </Button>
          </div>
           

        }
        {
          this.state.render === 'reservation_decalee' &&
          <p>La réservation à bien été décallée, vérife tes mails.</p>

        }
        {
          this.state.render === 'error' && 
          <p>Erreur inconnue, si l'erreur persiste, contacte nous à contact@afflubot.fr</p>

        }
        {
          this.state.render === 'check_mail' && 
        <div>

          <p>S'il s'agit d'un mail connecté à un compte de la BSB, tu vas recevoir un mail, clique sur le lien</p>
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
        {
          this.state.error_date === true && 
          <Alert style={{marginTop: '10px'}} variant={'dark'}>Indiquez des heures comprises dans la réservation de base (ex: changer 10h/18h pour 13/18h</Alert>

        }
        {
          this.state.no_auth_token === true && 
          <Alert style={{marginTop: '10px'}} variant={'dark'}>Cette fonctionnalité n'est plus disponible</Alert>

        }
       
        </div>

        <Footer style={{ marginTop: '20em' }}/>
      </div>
    )
  }
 
}

export default Decale
