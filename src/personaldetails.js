import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import ToggleButton from 'react-bootstrap/ToggleButton'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Form from 'react-bootstrap/Form'
import { useHistory } from "react-router-dom"


const PersonalDetails = () => {
  const [decision, setDecision] = useState('')
  const [user, setUser] = useState({})
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [address1, setAddress1] = useState('')
  const [address2, setAddress2] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')
  const [mobile, setMobile] = useState('')

  const history = useHistory()


  const submitForm = (ev) => {
    ev.preventDefault()

    const formData = new FormData()
    formData.append('firstname', firstname)
    formData.append('lastname', lastname)
    formData.append('inputEmail', email)
    formData.append('inputPassword', password)
    formData.append('confirmPassword', confirmPassword)
    formData.append('inputAddress', address1)
    formData.append('inputAddress2', address2)
    formData.append('inputCity', city)
    formData.append('inputState', state)
    formData.append('inputZip', zip)
    formData.append('inputMobile', mobile)
    fetch('/api/updateuser/', {
      method: 'POST',
      credentials: 'include',
      body: formData
    })
    .then(_ => history.push("/"))
    .catch((error) => {
      console.error('Error:', error)
    })


  }

  const getUserInfo = () => {
    fetch('api/getuser', {
      credentials: 'include'
    })
    .then(response => response.json())
    .then(userResponse => {
      setFirstname(userResponse.firstname)
      setLastname(userResponse.lastname)
      setEmail(userResponse.emailaddress)
      setAddress1(userResponse.address)
      setCity(userResponse.city)
      setState(userResponse.state)
      setZip(userResponse.zip)
      setMobile(userResponse.mobile)
    })
  }

  useEffect(getUserInfo, [])

  return (
    (
      <>
        <Container style={{marginTop: '100px'}}>
          <Form onSubmit={submitForm}>
            <Form.Group as={Row} key="firstname" controlId="firstname" className="mb-3" style={{justifyContent: "space-between"}}>
              <Form.Label column sm="3">
                First name
              </Form.Label>
              <Col sm="9">
                <Form.Control type="text" name="firstname" placeholder="Enter first name" value={firstname} onChange={(ev) => setFirstname(ev.target.value)}/>
              </Col>
            </Form.Group>
            <Form.Group as={Row} key="lastname" controlId="lastname" className="mb-3" style={{justifyContent: "space-between"}}>
              <Form.Label column sm="3">
                Last name
              </Form.Label>
              <Col sm="9">
                <Form.Control type="text" name="lastname" placeholder="Enter last name"  value={lastname} onChange={(ev) => setLastname(ev.target.value)}/>
              </Col>
            </Form.Group>
            <Form.Group as={Row} key="email" controlId="email" className="mb-3" style={{justifyContent: "space-between"}}>
              <Form.Label column sm="3">
                Email
              </Form.Label>
              <Col sm="9">
                <Form.Control type="email" placeholder="Enter email" value={email} onChange={(ev) => setEmail(ev.target.value)} />
              </Col>
            </Form.Group>
            <Form.Group as={Row} key="password" controlId="password" className="mb-3" style={{justifyContent: "space-between"}}>
              <Form.Label column sm="3">
                Password
              </Form.Label>
              <Col sm="9">
                <Form.Control type="password" placeholder="Enter New Password" onChange={(ev) => setPassword(ev.target.value)}/>
                <Form.Text className="text-muted">
                  Minimum eight characters.
                </Form.Text>
              </Col>
            </Form.Group>
            <Form.Group as={Row} key="confirmPassword" controlId="confirmPassword" className="mb-3" style={{justifyContent: "space-between"}}>
              <Form.Label column sm="3">
                Confirm password
              </Form.Label>
              <Col sm="9">
                <Form.Control type="password" placeholder="Confirm New Password" onChange={(ev) => setConfirmPassword(ev.target.value)} />
              </Col>
            </Form.Group>
            <Form.Group as={Row} key="inputAddress" controlId="inputAddress" className="mb-3" style={{justifyContent: "space-between"}}>
              <Form.Label column sm="3">
                Address
              </Form.Label>
              <Col sm="9">
                <Form.Control type="text" placeholder="Enter New Address"  value={address1} onChange={(ev) => setAddress1(ev.target.value)} />
              </Col>
            </Form.Group>
            <Form.Group as={Row} key="inputAddress2" controlId="inputAddress2" className="mb-3" style={{justifyContent: "space-between"}}>
              <Form.Label column sm="3">
              </Form.Label>
              <Col sm="9">
                <Form.Control type="text" placeholder=""  value={address2} onChange={(ev) => setAddress2(ev.target.value)} />
              </Col>
            </Form.Group>
            <Form.Group as={Row} key="inputCity" controlId="inputCity" className="mb-3" style={{justifyContent: "space-between"}}>
              <Form.Label column sm="3">
                City
              </Form.Label>
              <Col sm="9">
                <Form.Control type="text" placeholder="Enter City" value={city} onChange={(ev) => setCity(ev.target.value)} />
              </Col>
            </Form.Group>
            <Form.Group as={Row} key="inputState" controlId="inputState" className="mb-3" style={{justifyContent: "space-between"}}>
              <Form.Label column sm="3">
                State, Province or Region
              </Form.Label>
              <Col sm="9">
                <Form.Control type="text" placeholder="Enter State" value={state} onChange={(ev) => setState(ev.target.value)} />
              </Col>
            </Form.Group>
            <Form.Group as={Row} key="inputZip" controlId="inputZip" className="mb-3" style={{justifyContent: "space-between"}}>
              <Form.Label column sm="3">
                ZIP / Postal code
              </Form.Label>
              <Col sm="9">
                <Form.Control type="text" placeholder="Enter Zip" value={zip} onChange={(ev) => setZip(ev.target.value)} />
              </Col>
            </Form.Group>
            <Form.Group as={Row} key="inputMobile" controlId="inputMobile" className="mb-3" style={{justifyContent: "space-between"}}>
              <Form.Label column sm="3">
                Mobile Number
              </Form.Label>
              <Col sm="9">
                <Form.Control
                  type="text"
                  placeholder="Enter Mobile"
                  pattern="\d{10}"
                  title="Please enter the number with no spaces."
                  value={mobile}
                  onChange={(ev) => setMobile(ev.target.value)}
                />
              </Col>
            </Form.Group>

            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </Container>
      </>
    )
  )
}

PersonalDetails.propTypes = {
}

export default PersonalDetails
