import React, { useState } from 'react'
import {
  Route,
  HashRouter
} from 'react-router-dom'
import Header from './header'
import LoggedOut from './loggedout'
import TaskList from './tasklist'
import Login from './login'


const App = () => {
  const [loggedin, setLoggedin] = useState(true)

  const logout = () => {
    setLoggedin(false)
    fetch('/api/logout')
    .then(get => console.log(get))
  }

  const requireAuth = (nextState, replace, next) => {
    console.log(nextState)
    console.log(replace)
    debugger
    if (!true) {
      replace({
        pathname: "/api/login",
        state: {nextPathname: nextState.location.pathname}
      });
    }
    next()
  }

  return (
    <HashRouter>
      <Header loggedin={loggedin} logout={logout} />
      <div className="content">
        <Route path="/" component={TaskList} onEnter={requireAuth} />
        <Route path="/login" component={Login} />
        <Route path="/home" component={TaskList} onEnter={requireAuth} />
        <Route path="/loggedout" component={LoggedOut} onEnter={requireAuth} />
      </div>
    </HashRouter>
  )
}

export default App
