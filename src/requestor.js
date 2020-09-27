import React, { useState, useEffect } from 'react'
import ImageUploader from 'react-images-upload'
import PropTypes from 'prop-types'
import Image from 'react-bootstrap/Image'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Container from 'react-bootstrap/Container'
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import faker from  'faker'

const Requestor = (props) => {
  const [showModal, setShowModal] = useState(false)

  const handleShowModal = () => {
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  return (
    <>
      <div className="col-sm-6 col-md-4 col-lg-3">
        <Card className="mb-3">
          <Card.Img variant="top" src={
            props.logo && props.logo.data
            ? `data:${props.logo.dataType};base64,${props.logo.data}`
            : faker.random.image()
          } />
          <Card.Body>
            <Card.Title>{props.name}</Card.Title>
            <Card.Text>{`${props.description.slice(0, 85)}...`}</Card.Text>
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
          <Modal.Title>{props.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="justify-content-end">
            <Col xs={{ span: 5}} style={{textAlign: 'left'}}>
              <Image
                style={{height: "300px", width: "300px", objectFit: "cover"}}
                src={
                  props.logo && props.logo.data ? `data:${props.logo.dataType};base64,${props.logo.data}` : faker.random.image()
                }
              />
            </Col>
            <Col xs={{ span: 7}} style={{textAlign: 'right'}}>
              <p>{props.description}</p>
            </Col>
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
  logo: PropTypes.object,
  name: PropTypes.string,
  description: PropTypes.string
}

export default Requestor
