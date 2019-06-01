import React, {Fragment} from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Login from './components/auth/Login';
import Register from './components/auth/Register';

import './App.css';

const App = () => {
  return (
    <Router>
      <Fragment>
        <Route exact path = "/" component = {Landing}/>
        <div className = "container">
        <Switch>
          <Route exact path = "/login" component = {Login}/>
          <Route exact path = "/register" component = {Register}/>
        </Switch>
        </div>
        <Navbar/>
      </Fragment>
    </Router>
    
  );
}

export default App;
