import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Image from 'react-bootstrap/Image'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Container from 'react-bootstrap/Container'
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import ListGroup from 'react-bootstrap/ListGroup'
import faker from  'faker'

const Requestor = (props) => {
  const [showModal, setShowModal] = useState(false)

  const handleShowModal = () => {
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  let main = null

  if (props.requestor.choiceQuestion) {
    main = (
      <>
        <h4>Description</h4>
        <p>{props.requestor.description}</p>
        <h5>Question</h5>
        <p>{props.requestor.choiceQuestion}</p>
        <h5>Options</h5>
        <ListGroup>
          {props.requestor.choiceOptions.map((choice, idx) => {
            return (
            <ListGroup.Item key={`options-${idx}`}>{choice}</ListGroup.Item>)
          })}
        </ListGroup>
      </>
    )

  } else if (props.requestor.decisionTaskQuestion) {
    main = (
      <>
        <h4>Description</h4>
        <p>{props.requestor.description}</p>
        <h5>Question</h5>
        <p>{props.requestor.decisionTaskQuestion}</p>
      </>
    )
  } else if (props.requestor.sentenceTaskQuestion) {
    main = (
      <>
        <h4>Description</h4>
        <p>{props.requestor.description}</p>
        <h5>Question</h5>
        <p>{props.requestor.sentenceTaskQuestion}</p>
      </>
    )
  }

  let masterW = ''
  if (props.masterWorkers) {
    if (props.masterWorkers === "yes") masterW = "Master worker required. "
    else masterW = "Open to all. "
  }

  return (
    <>
      <div className="col-sm-6 col-md-4 col-lg-3 mb-5">
        <Card className="m-3">
          <Card.Img variant="top" src={
            props.logo && props.logo.data
            ? `data:${props.logo.dataType};base64,${props.logo.data}`
            : faker.random.image()
          } />
          <Card.Body>
            <Card.Title>{props.requestor.title}</Card.Title>
            <Card.Text>{`${props.requestor.description.slice(0, 85)}...`}</Card.Text>
            <Card.Text>{`${masterW}Amount offered: ${props.requestor.reward}`}</Card.Text>
            <Button variant="outline-dark" onClick={handleShowModal}>View Details</Button>
          </Card.Body>
        </Card>
      </div>

      <Modal
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        show={showModal}
        onHide={handleCloseModal}
      >
        <Modal.Header closeButton>
          <Modal.Title>{props.requestor.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="justify-content-end">
            <Col xs={{ span: 5}} style={{textAlign: 'left'}}>
              <Image
                style={{height: "300px", width: "300px", objectFit: "cover"}}
                src={
                  props.requestor.logo && props.requestor.logo.data ? `data:${props.requestor.logo.dataType};base64,${props.requestor.logo.data}` : faker.random.image()
                }
              />
            </Col>
            <Col xs={{ span: 7}} style={{textAlign: 'left'}}>
              {main}
            </Col>
          </Row>
          <Row className="justify-content-end mr-3">
            <p>{`${masterW}Reward offered for the task of ${props.requestor.reward}`}</p>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" type="submit" disabled>
            Apply for task
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )

}

Requestor.propTypes = {
  requestor: PropTypes.object
}

export default Requestor
