import React, { useState, useEffect } from 'react'
import {
  Route,
  HashRouter
} from 'react-router-dom'
import Header from './header'
import TaskList from './tasklist'


const App = () => {
  const [loggedin, setLoggedin] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = () => {
    const url = `/api/user/`
    fetch(url, {
      credentials: 'include'
    }).then((response) => {
      console.error(response)
      if (response.status !== 200) logout()
      else return response.json()
    }).then((user) => {
      console.error(user)
      if (user) {
        setLoggedin(true)
        setUser(user)
      }
    }).catch((err) => {
      console.error(err)
    }).finally(() => setLoading(false))
  }

  useEffect(fetchUser, [])

  const logout = () => {
    setLoggedin(false)
    fetch('/api/logout/', {method: 'POST', credentials: 'include'})
    .then((res) => {
      window.location.href = `${window.location.origin}/api/reqlogin`
    })
  }

  const checkLoggedIn = () => {
    if (!loading && !loggedin) {
      return logout()
    }
  }

  useEffect(checkLoggedIn, [loading])

  const requireAuth = (nextState, replace, next) => {
    console.log(nextState)
    console.log(replace)
    if (!true) {
      replace({
        pathname: "/api/login",
        state: {nextPathname: nextState.location.pathname}
      })
    }
    next()
  }

  return (
    <>
      <HashRouter>
        <Header loggedin={loggedin} logout={logout} user={user} />
        <div className="content">
          <Route exact path="/" component={TaskList} onEnter={requireAuth} />
          <Route path="/home" component={TaskList} onEnter={requireAuth} />
        </div>
      </HashRouter>
    </>
  )
}

export default App
