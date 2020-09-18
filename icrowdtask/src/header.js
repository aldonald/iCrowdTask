import React from 'react'
import PropTypes from 'prop-types'
import { NavLink }  from 'react-router-dom'

const Header = (props) => {
  return (
    <>
      <header>
        <ul className="nav justify-content-end">
          <li className="nav-item">
            <NavLink className="nav-link active" to="/">Tasks</NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/">Find a Helper</NavLink>
          </li>
          <li className="nav-item dropdown">
            <a className="nav-link dropdown-toggle" data-toggle="dropdown" href="/" role="button" aria-haspopup="true" aria-expanded="false">Account</a>
            <div className="dropdown-menu">
              <NavLink className="dropdown-item" to="/">Preferences</NavLink>
              {props.loggedin &&
                <NavLink className="dropdown-item" onClick={props.logout} to="/loggedout">Logout</NavLink>
              }
            </div>
          </li>
        </ul>
      </header>
    </>
  )
}

Header.propTypes = {
  loggedin: PropTypes.bool,
  logout: PropTypes.func
}

export default Header
