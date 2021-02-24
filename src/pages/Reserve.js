import React, { Component } from 'react';
import { Footer, Header } from '../components';
import { Form, Button, Spinner, Alert } from "react-bootstrap";
import axios from 'axios';

const HOUR_LIMITATION = 1
const DEBUT_DES_RESA = '11:00'
const DEBUT_DES_RESA_DEMI = '11:30'

class Reserve extends Component {

  state = {
    email: "",
    render: 'choose_bibli', 
    date: '22/10/2020',
    hour_start: DEBUT_DES_RESA,
    hour_end: DEBUT_DES_RESA_DEMI,
    type: '702',
    render_mail_inconnu: false,
    auth_token: '',
    already_res: false,
    too_soon: false,
    is_dimanche: false,
    error_hour: false,
    checked: true,
    horaires: {
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

    },
    reservation: [],
    deja_res: false,
    min_date: '',
    max_date: '',
    bibli: 'BSB'

  };


  fetchRes = (response) => {
    var next_step = 'type_resa'

    const auth_token = response['data'].substring(10) 
    if(auth_token == '000000'){
      this.setState({ 
        render: next_step,
        auth_token: auth_token
     })
    }
    else {
      const headers = { 
        'Content-Type': 'application/json' ,
        'authorization' : 'Bearer ' + auth_token
      }
      axios.get(
        'https://reservation.affluences.com/api/myreservations', { 'headers': headers}
        ).then(response => { 
          const reservations = response.data.results
          const res = reservations.filter(({
            state
          }) => ['UPCOMING'].includes(state));
          this.setState({ reservation: res });
          this.setState({ 
            render: next_step,
            auth_token: auth_token
         })
        })
        .catch(error => {
          this.setState({ render: 'error' })
        });
    }
    
  }

  addDays = (date, days) => {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }


  setHoursForForm = () => {
    

    var max_date = this.addDays(new Date(), 10)
    var dd_max = String(max_date.getDate()).padStart(2, '0');
    var mm_max = String(max_date.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy_max = max_date.getFullYear();
    max_date = yyyy_max + '-' + mm_max + '-' + dd_max;

    const date_and_hour = this.fetch_date_and_hour_with_limitation(HOUR_LIMITATION)
    var hour = date_and_hour[1]
    hour = (hour.split(':')[0].length == 1) ? '0' + hour : hour
    var addDay = 0

    var end_hour_resa = '18:00'
    if (new Date().getDay() == 6 && this.state.bibli == 'BSG') {
      end_hour_resa = '17:00'
    }


    if (hour >= end_hour_resa) {
      addDay = 1
    }

    var today = this.addDays(new Date(), addDay)
    var dd_today = String(today.getDate()).padStart(2, '0');
    var mm_today = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy_today = today.getFullYear();
    today = yyyy_today + '-' + mm_today + '-' + dd_today;

    


    const hour_start = (hour <= DEBUT_DES_RESA || hour >= end_hour_resa) ? DEBUT_DES_RESA : hour
    var hour_end = hour_start.split(':')[0] + ':30'
    var horaires_start_temp = Object.fromEntries(Object.entries(this.state.horaires).filter(([k,v]) => (v >= hour_start && v <= end_hour_resa)));
    var horaires_end_temp = Object.fromEntries(Object.entries(this.state.horaires).filter(([k,v]) => (v > hour_start && v <= end_hour_resa)));
    
    this.setState({ hour_start:hour_start, hour_end: hour_end, date: today, horaires_start_temp: horaires_start_temp, horaires_end_temp: horaires_end_temp, min_date: today, max_date: max_date})
  
  }

  connexion = async (event) => {
    event.preventDefault();
    this.setHoursForForm()
    this.setState({ render_mail_inconnu: false, render: 'loading', to_soon: false })
    if (this.state.email !== '') {
      axios.get(
        'https://treipmf3ub.execute-api.eu-west-3.amazonaws.com/dev/bsb/' + this.state.email + '/' + this.state.bibli, { 'headers': { 'Content-Type': 'application/json' } 
      }).then(response => { 
        if(response['data'].substring(0,10) === "auth_token") {
          this.fetchRes(response)
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

  chooseTypePlace = (event) => {
    event.preventDefault();
    if (this.state.type !== ""){
      this.setState({ render: 'form_resa' });
    }
  }

  chooseBibli = (event) => {
    event.preventDefault();
    if (this.state.bibli !== ""){
      const type_change = (this.state.bibli == 'BSG') ? '1468' : '702'
      this.setState({ render: 'email', type: type_change });
    }
  }

  fetch_date_and_hour_with_limitation =   (hour_lim) => {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var hh = today.getHours() + hour_lim;
    hh = (hh.toString().split(':')[0].length == 1) ? '0' + hh : hh
    hh = hh + ':00'
    today = yyyy + '-' + mm + '-' + dd;
    return [today, hh]
  }
  

  controlNotToSoonIfToday =() => {
    const date_and_hour = this.fetch_date_and_hour_with_limitation(HOUR_LIMITATION)
    const today = date_and_hour[0]
    var hour = date_and_hour[1]
    if ((today == this.state.date) && (this.state.hour_start < hour)){
      return true
    }
    return false
  }


  reserve = async (event) => {
    
    event.preventDefault();
    this.setState({render: 'loading', deja_res: false, error_hour: false, already_res: false, too_soon: false });
    if (this.state.hour_end <= this.state.hour_start){
      return this.setState({ error_hour: true, render: 'form_resa' })
    }
    const too_soon = this.controlNotToSoonIfToday()
    if (too_soon) { 
      this.setState({ too_soon: true, render: 'form_resa' })
      return
    }
    const res = this.state.reservation
    for (var i = 0; i < res.length; i++){
      var start_hour_already_exist = res[i].reservation_start_datetime.substring(11, 16).split(':')
      var end_hour_already_exist = res[i].reservation_end_datetime.substring(11, 16).split(':')
      start_hour_already_exist = (parseInt(start_hour_already_exist[0]) + 1).toString() + ':' + start_hour_already_exist[1]
      end_hour_already_exist= (parseInt(end_hour_already_exist[0]) + 1).toString() + ':' + end_hour_already_exist[1]
      if ((this.state.date == res[i].reservation_end_datetime.substring(0, 10) ) && (this.state.hour_end > start_hour_already_exist) && (this.state.hour_start < end_hour_already_exist)) {
        return this.setState({ deja_res: true, render: 'form_resa' })
      }
    }


    const body = {
      email: this.state.email,
      auth_token: this.state.auth_token,
      date: this.state.date,
      heure_debut: this.state.hour_start,
      heure_fin: this.state.hour_end,
      type: this.state.type,
      valide: 0,
      etablissement: this.state.bibli,
      morcelle: this.state.checked
    }
    axios.post(
      'https://treipmf3ub.execute-api.eu-west-3.amazonaws.com/dev/bsb/create_reservation_request', body , { 'headers': { 'Content-Type': 'application/json' } }
      ).then(response => { 
        if (response['data'] === "already_res"){
          this.setState({ already_res: true });
          this.setState({ render: 'form_resa' });
        }
        else if(response['data'] === "True") {
          this.setState({ render: 'enregistrer' })
        }
        else  {
          this.setState({ render: 'error' })
        }
      })
      .catch(error => {
        this.setState({ render: 'error' })
      });
    
  }


  removeLastHourIfBsg = () => {
    var filteredWithout18 = Object.fromEntries(Object.entries(this.state.horaires).filter(([k,v]) => v <= '17:00'));
    this.setState()
  }

  changeDate = (date) => {
    this.setState({ is_dimanche: false })
    const new_date = new Date(date);
    if (new_date.getDay() == 0) {
      return this.setState({ is_dimanche: true })
    }
    const date_and_hour = this.fetch_date_and_hour_with_limitation(HOUR_LIMITATION)
    const today = date_and_hour[0]
    var hour = date_and_hour[1]
    hour = (hour.split(':')[0].length == 1) ? '0' + hour : hour
    var end_hour_resa = '18:00'
    if (new_date.getDay() == 6 && this.state.bibli == 'BSG') {
      end_hour_resa = '17:00'
    }
    if (today == date){
      var horaires_start_temp = Object.fromEntries(Object.entries(this.state.horaires).filter(([k,v]) => (v >= hour && v <= end_hour_resa)));
      var horaires_end_temp = Object.fromEntries(Object.entries(this.state.horaires).filter(([k,v]) => (v > hour && v <= end_hour_resa)));
      if (Object.keys(horaires_end_temp).length === 0) {
        this.setState({ too_soon: true })
      }
      const hour_start = (hour <= DEBUT_DES_RESA) ? DEBUT_DES_RESA : hour
      var hour_end = hour_start.split(':')[0] + ':30'
      this.setState({ date: date, horaires_start_temp: horaires_start_temp, horaires_end_temp: horaires_end_temp, hour_start: hour_start, hour_end: hour_end })
    }
    else {
      var horaires_end_temp = Object.fromEntries(Object.entries(this.state.horaires).filter(([k,v]) => (v != DEBUT_DES_RESA && v <= end_hour_resa) ));
      this.setState({ date: date, horaires_start_temp: this.state.horaires, horaires_end_temp: horaires_end_temp, hour_start: DEBUT_DES_RESA, hour_end: DEBUT_DES_RESA_DEMI })
    }
  }

 
  render() {
    return (
      <div> 
        <Header history={this.props.history} />
        
        <div style={{marginTop: '10em', marginLeft: '2em', marginRight: '2em'}}>
        <h2>Demande de réservation</h2>
        <p>Fais une demande de réservation : si une place se libère elle te sera automatiquement attribuée (sous réserve de places disponibles)</p>
        
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
        {
          this.state.render === 'type_resa' && 
          <div>
          <Form onSubmit={this.chooseTypePlace}>
              <div style={{marginTop: '2em'}}>
                
                { this.state.bibli == 'BSB' &&
                  <select style={{width: '100%', height: '2em'}} value={this.state.type} onChange={e => this.setState({ type: e.target.value })}>

                      <option value="702">Place de travail</option>
                      <option value="701">Poste de travail (ordinateur)</option>
                  </select>

                }
                { this.state.bibli == 'BSG' &&
                  <select style={{width: '100%', height: '2em'}} value={this.state.type} onChange={e => this.setState({ type: e.target.value })}>
                   <option value="1468">Place de travail</option>
                  </select>

                }
              </div>

              <Button variant="primary" type="submit" style={{marginTop: '2em'}}>
                Valider
              </Button>
            </Form>
          </div>
        }
        {
          this.state.render === 'form_resa' && 
          <div>
            <p>La réservation n'est possible que {HOUR_LIMITATION} h après la date actuelle.</p>
            <Form onSubmit={this.reserve}>
              <Form.Group>
                <Form.Control
                  className="text-muted"
                  value={this.state.date}
                  onChange={e => this.changeDate(e.target.value)}
                  type="date"
                  min={this.state.min_date}
                  max={this.state.max_date}
                />
              </Form.Group>
              <Form.Group style={{marginTop: '70px'}} controlId="formBasicCheckbox" >
                <Form.Check onChange={() => this.setState({checked: !this.state.checked}) } checked={this.state.checked} type="checkbox" label="J'accepte que ma réservation soit divisée s'il n'y a plus de places (10h/14h => 10h/12h + 12h/14h)" />
              </Form.Group>
              <div >
                
              <select style={{width: '100%', height: '2em'}} value={this.state.hour_start} onChange={e => this.setState({ hour_start: e.target.value })}>
                {
                  Object.entries(this.state.horaires_start_temp).map( ([key, value]) => <option key={key}>{value}</option>)
                }
              </select>
              </div>
              <div style={{marginTop: '2em'}}>
              { 
                this.state.type !== '698' && 
                <select style={{width: '100%', height: '2em'}} value={this.state.hour_end} onChange={e => this.setState({ hour_end: e.target.value })}>
                 {
                  Object.entries(this.state.horaires_end_temp).map( ([key, value]) => <option key={key}>{value}</option>)
                  }
                </select>
              }
              
              
              </div>


        
              <Button variant="primary" type="submit" style={{marginTop: '2em'}}>
                Valider
              </Button>
            </Form>
          </div>

        }
        {
          this.state.render === 'enregistrer' && 
          <p> Demande de réservation enregistrée, tu vas recevoir un email dès qu'une place se libère</p>

        }
        {
          this.state.deja_res === true && 
          <Alert style={{marginTop: '10px'}} variant={'dark'}>Tu as déja une réservation qui se chevauche avec ta demande, veille à d'abord annuler la première sur Affluence.</Alert>

        }
        {
          this.state.error_hour === true && 
          <Alert style={{marginTop: '10px'}} variant={'dark'}>Vérfiez les horaires.</Alert>

        }
        {
          this.state.render === 'error' && 
          <p>Erreur inconnue, essayez plus tard ou contacte nous à contact@afflubot.fr</p>

        }
        {
          this.state.render === 'check_mail' && 
        <div>

          <p>Clique d'abord sur le lien reçu par MAIL, avant de cliquer sur le boutton ci dessous</p>
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
          {
          this.state.already_res === true && 
          <Alert style={{marginTop: '10px'}} variant={'dark'}>Tu as déja une demande de réservation à ces horaires là, va dans l'onglet Annulation d'Afflubot d'abord</Alert>

        }
        {
          this.state.too_soon === true && 
        <Alert style={{marginTop: '10px'}} variant={'dark'}>Tu ne peux faire de demande de réservation qu'à partir de {HOUR_LIMITATION} h de l'heure actuelle</Alert>

        }
        {
          this.state.is_dimanche === true && 
          <Alert style={{marginTop: '10px'}} variant={'dark'}>La bibliothèque est fermée le Dimanche.</Alert>

        }
       
        </div>

        <Footer style={{ marginTop: '20em' }}/>
      </div>
    )
  }
 
}

export default Reserve
