import React from 'react'
import {
  BrowserRouter,
  Route,
  Switch
} from 'react-router-dom'
import { HomePage, NotFound, Reserve, Valide, Decale, Annulation } from './pages'

const App = (props) => (
  <BrowserRouter>
    <Switch>
      <Route exact path='/' component={HomePage} />
      <Route exact path='/reservation' component={Reserve} />
      <Route exact path='/decaler_reservation' component={Decale} />
      <Route exact path='/valider_presence' component={Valide} />
      <Route exact path='/annuler_demande_reservation' component={Annulation} />
      <Route component={NotFound} />
    </Switch>
  </BrowserRouter>
)

export default App
