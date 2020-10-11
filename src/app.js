import React, { useState, useEffect } from 'react'
import {
  Route,
  BrowserRouter
} from 'react-router-dom'
import Header from './header'
import TaskList from './tasklist'
import Home from './home'
import NewTask from './newtask'
import MyWork from './mywork'
import MyOutstandingWork from './myjobs'
import Loader from 'react-loader-spinner'
import PersonalDetails from './personaldetails'
import About from './about'


const App = () => {
  const [loggedin, setLoggedin] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

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
    setLoading(true)
    setLoggedin(false)
    fetch('/api/logout/', {method: 'POST', credentials: 'include'})
    .then((res) => {
      setUser(null)
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
    if (!user) {
      fetchUser()
    }
  }

  return (
    <>
      {loading ?
        <Loader
          visible={loading}
          type="Oval"
          color="#00BFFF"
          height={200}
          width={200}
          style={{textAlign: 'center', verticalAlign: 'middle', margin: '0', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: '100'}}
        />
        : loggedin &&
          (<BrowserRouter>
            <Header loggedin={loggedin} logout={logout} user={user} />
            <div className="content">
              <Route exact path="/" component={Home} onEnter={requireAuth} />
              <Route path="/home" component={TaskList} onEnter={requireAuth} />
              <Route path="/newtask" component={NewTask} onEnter={requireAuth} />
              <Route path="/mywork" component={MyWork} onEnter={requireAuth} />
              <Route path="/myjobs" component={MyOutstandingWork} onEnter={requireAuth} />
              <Route path="/personaldetails" component={PersonalDetails} onEnter={requireAuth} />
              <Route path="/about" component={About} />
            </div>
          </BrowserRouter>)
      }
    </>
  )
}

export default App
