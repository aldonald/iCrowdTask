import React, { useState, useEffect } from 'react'
import ImageUploader from 'react-images-upload'
import PropTypes from 'prop-types'
import Image from 'react-bootstrap/Image'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Container from 'react-bootstrap/Container'
import CardGroup from 'react-bootstrap/CardGroup'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import faker from  'faker'
import HeadImg from './headImg'
import Requestor from './requestor'
import Footer from './footer'
import Loader from 'react-loader-spinner'


const Home = (props) => {
  const [requestorList, setRequestorList] = useState([])
  const [loading, setLoading] = useState(true)


  const arrayBufferToBase64 = (buffer) => {
    var binary = ''
    var bytes = [].slice.call(new Uint8Array(buffer))
    bytes.forEach((b) => binary += String.fromCharCode(b))
    return window.btoa(binary)
  }

  const fetchCards = () => {
    const url = `/api/requestors/`
    fetch(url).then(response =>
      response.json()
    ).then(response => {
      setRequestorList(response.slice(0, 8))
    }).finally(() => setLoading(false))
  }

  useEffect(fetchCards, [])

  return (
    <>
      <Loader
        visible={loading}
        type="Oval"
        color="#00BFFF"
        height={200}
        width={200}
        style={{textAlign: 'center', verticalAlign: 'middle', margin: '0', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: '100'}}
      />
      {!loading &&
        (<>
          <HeadImg />
          <h2 className="mt-5">Featured Requestors</h2>
          <Container className="mt-5">
            <Row>
                {requestorList.map((requestor, i) => (
                  <Requestor
                    key={`requestor-${i}`}
                    requestor={requestor}
                  />)
                )}
            </Row>
          </Container>
          <Footer />
        </>)
      }
    </>
  )
}

export default Home
