import React, { useState, useEffect } from 'react'
import {
  Route,
  HashRouter
} from 'react-router-dom'
import Header from './header'
import TaskList from './tasklist'
// import { useHistory } from "react-router-dom"


const App = () => {
  const [loggedin, setLoggedin] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // const history = useHistory()

  const fetchUser = () => {
    const url = `/api/user/`
    fetch(url, {
      credentials: 'include'
    }).then((response) => {
      if (response.status !== 200) logout()
      else return response.json()
    }).then((user) => {
      if (user) {
        setLoggedin(true)
        setUser(user)
      }
    }).catch((err) => {
    }).finally(() => setLoading(false))
  }

  useEffect(fetchUser, [])

  const logout = (ev) => {
    if (ev) ev.preventDefault()
    setLoggedin(false)
    fetch('/api/logout/', {method: 'POST', credentials: 'include'})
    .then((res) => {
      setUser(null)
      window.location.href = `${window.location.origin}/api/reqlogin`

      // history.push("/login")
    })
  }

  const checkLoggedIn = () => {
    if (!loading && !loggedin) {
      return logout()
    }
  }

  useEffect(checkLoggedIn, [loading])

  // This is work in progress
  const requireAuth = (nextState, replace, next) => {
    console.log(nextState)
    console.log(replace)
    if (!true) {
      replace({
        pathname: "/api/reqlogin",
        state: {nextPathname: nextState.location.pathname}
      })
      // history.push("/login")
    }
    next()
  }

  return (
    <>
      {loggedin &&
        (<HashRouter>
          <Header loggedin={loggedin} logout={logout} user={user} />
          <div className="content">
            <Route exact path="/" component={TaskList} onEnter={requireAuth} />
            <Route path="/home" component={TaskList} onEnter={requireAuth} />
          </div>
        </HashRouter>)
      }
    </>
  )
}

export default App
