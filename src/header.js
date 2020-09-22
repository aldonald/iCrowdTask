import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import NavDropdown from 'react-bootstrap/NavDropdown'

const Header = (props) => {
  const [username, setUsername] = useState('Account')

  const setUser = () => {
    if (props.user && props.user.firstname) {
      setUsername(`${props.user.firstname} ${props.user.lastname}`)
    }
  }

  useEffect(setUser, [props])

  const LogoutComponent = (
    <>
      <NavDropdown.Divider />
      <NavDropdown.Item href="/api/reqlogin" onClick={props.logout} >Logout</NavDropdown.Item>
    </>
  )

  return (
    <Navbar bg="light" variant="light">
      <Navbar.Brand href="#home">iCrowdTask</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link href="#home">Tasks</Nav.Link>
          <Nav.Link href="#features">Find a Helper</Nav.Link>
        </Nav>
        <NavDropdown title={username} id="basic-nav-dropdown">
          <NavDropdown.Item href="/">Preferences</NavDropdown.Item>
          {props.loggedin &&
            LogoutComponent}
        </NavDropdown>
      </Navbar.Collapse>
    </Navbar>
  )
}

Header.propTypes = {
  loggedin: PropTypes.bool,
  logout: PropTypes.func,
  user: PropTypes.any
}

export default Header
