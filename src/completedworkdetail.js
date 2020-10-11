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
import Carousel from 'react-bootstrap/Carousel'
import Choice from './choice'
import Decision from './decision'
import Sentence from './sentence'
import ImgProc from './imgproc'
import CanvasDraw, { saveableCanvas } from "react-canvas-draw"
import faker from  'faker'


const defaultProps = {
  onChange: null,
  loadTimeOffset: 5,
  lazyRadius: 30,
  brushRadius: 12,
  brushColor: "#444",
  catenaryColor: "#0a0302",
  gridColor: "rgba(150,150,150,0.17)",
  hideGrid: false,
  canvasWidth: 400,
  canvasHeight: 400,
  saveData: null,
  immediateLoading: false,
  hideInterface: false
}

const WorkDetail = (props) => {
  const [showModal, setShowModal] = useState(false)
  const [processingImg, setProcessingImg] = useState({})
  const [responses, setResponses] = useState([])
  const [loading, setLoading] = useState(true)
  const [logoImg, setLogoImg] = useState({})
  const [sTaskIdx, setSTaskIdx] = useState(0)

  const handleShowModal = () => {
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  const arrayBufferToBase64 = (buffer) => {
    var binary = ''
    var bytes = [].slice.call(new Uint8Array(buffer))
    bytes.forEach((b) => binary += String.fromCharCode(b))
    return window.btoa(binary)
  }

  const fetchProcessingImg = () => {
    if (props.task.imageProcessingQuestion) {
      const url = `api/imageprocessingimage/${props.task._id}`
      fetch(url, {credentials: 'include'})
      .then(response => {
        return response.json()
      })
      .then(response => {
        if (response) {
          console.log(response)
          const dataType = response.img.contentType
          const data = arrayBufferToBase64(response.img.data.data)
          setProcessingImg({dataType: dataType, data: data})
        }
      })
    }
    if (props.task.logo) {
      const url = `/api/userimage/${props.task.logo}`
      fetch(url, {credentials: 'include'})
      .then(response => {
        return response.json()
      })
      .then(response => {
        if (response) {
          const logoDataType = response.img.contentType
          const logoData = arrayBufferToBase64(response.img.data.data)
          setLogoImg({dataType: logoDataType, data: logoData})
        }
      })
    }
  }

  const fetchResponses = () => {
    fetch(`/api/responses/${props.task._id}`)
    .then(responseList => {
      return responseList.json()
    })
    .then(responseList => {
      let itemsProcessed = 0
      const resultList = []
      if (responseList) {
        responseList.forEach((response, i) => {
          fetch(`/api/users/${response.worker}`)
          .then(response => response.json())
          .then(user => {
            itemsProcessed++
            const worker = response
            worker.user = user
            resultList.push(worker)
            if (itemsProcessed === responseList.length) {
              setResponses(resultList)
              setLoading(false)
            }
          })
        })
      }
    })
  }

  const fetchData = () => {
    fetchProcessingImg()
    fetchResponses()
  }

  useEffect(fetchData, [])

  const nextTask = (ev) => {
    ev.preventDefault()
    if (sTaskIdx < responses.length) {
      const newIdx = sTaskIdx + 1
      setSTaskIdx(newIdx)
    }
  }

  const lastTask = (ev) => {
    ev.preventDefault()
    if (sTaskIdx > 0) {
      const newIdx = sTaskIdx - 1
      setSTaskIdx(newIdx)
    }
  }


  let taskDetail
  let slides
  if (props.task.choiceQuestion) {
    taskDetail = (<>
      <h4 style={{textAlign: 'left'}}>Description</h4>
      <p>{props.task.description}</p>
      <h5>Question</h5>
      <p>{props.task.choiceQuestion}</p>
      <h5>Options</h5>
      <ListGroup className="mb-3">
        {props.task.choiceOptions.map((choice, idx) =>
          <ListGroup.Item key={`options-${idx}`}>{choice}</ListGroup.Item>
        )}
      </ListGroup>
    </>)
    slides = (
      <Carousel>
        {responses.map((response, idx) => (
          <Carousel.Item key={`response-${idx}`}>
            <img
              className="d-block w-100"
              src="/images/black.jpg"
              alt="Response"
            />
            <Carousel.Caption>
              <h3>{`${response.user.firstname} ${response.user.lastname}`}</h3>
              <p>{props.task.choiceOptions[parseInt(response.response)]}</p>
            </Carousel.Caption>
          </Carousel.Item>
        ))}
      </Carousel>
    )
  } else if (props.task.decisionTaskQuestion) {
    taskDetail = (
      <>
        <h4 style={{textAlign: 'left'}}>Description</h4>
        <p>{props.task.description}</p>
        <h5>Question</h5>
        <p>{props.task.decisionTaskQuestion}</p>
      </>
    )
    slides = (
      <Carousel>
        {responses.map((response, idx) => (
          <Carousel.Item key={`response-${idx}`}>
            <img
              className="d-block w-100"
              src="/images/black.jpg"
              alt="Response"
            />
            <Carousel.Caption>
              <h3>{`${response.user.firstname} ${response.user.lastname}`}</h3>
              <p>{response.response}</p>
            </Carousel.Caption>
          </Carousel.Item>
        ))}
      </Carousel>
    )
  } else if (props.task.sentenceTaskQuestion) {
    taskDetail = (
      <>
        <h4 style={{textAlign: 'left'}}>Description</h4>
        <p>{props.task.description}</p>
        <h5>Question</h5>
        <p>{props.task.sentenceTaskQuestion}</p>
      </>
    )
    if (responses.length > 0) {
      slides = (
        <Card>
          <Card.Title>
            <h3>{`${responses[sTaskIdx].user.firstname} ${responses[sTaskIdx].user.lastname}`}</h3>
          </Card.Title>
          <Card.Body>
            {responses[sTaskIdx].response}
            <Row style={{justifyContent: "space-between"}} className="mt-3">
              <Button variant="outline-info" size="sm" className="m-3" onClick={lastTask}>Last</Button>
              <Button variant="outline-info" size="sm" className="m-3" onClick={nextTask}>Next</Button>
            </Row>
          </Card.Body>
        </Card>
      )
    }
  } else if (props.task.imageProcessingQuestion) {
    taskDetail = (
      <>
        <h4 style={{textAlign: 'left'}}>Description</h4>
        <p>{props.task.description}</p>
        <h5>Question</h5>
        <p>{props.task.imageProcessingQuestion}</p>
        <Image
          style={{objectFit: "cover"}}
          src={`data:${processingImg.dataType};base64,${processingImg.data}`}
          fluid
          className="mt-2 mb-2"
        />
      </>
    )
    slides = (
      <Carousel>
        {responses.map((response, idx) => (
          <Carousel.Item key={`response-${idx}`}>
            <CanvasDraw
              imgSrc={`data:${processingImg.dataType};base64,${processingImg.data}`}
              {...defaultProps}
              disabled
              saveData={response.response ? response.response : null}
              className="mb-3"
            />
            <Carousel.Caption>
              <h3>{`${response.user.firstname} ${response.user.lastname}`}</h3>
            </Carousel.Caption>
          </Carousel.Item>
        ))}
      </Carousel>
    )
  }

  const toggleAction = () => {
    setAction(!action)
  }

  return (
    <>
      <div className="col-sm-6 col-md-4 col-lg-3 mb-5">
        <Card className="m-3">
          <Card.Img variant="top" src={
            logoImg.data
            ? `data:${logoImg.dataType};base64,${logoImg.data}`
            : faker.random.image()
          } />
          <Card.Body>
            <Card.Title>{props.task.title}</Card.Title>
            <Card.Text>{`${props.task.description.slice(0, 85)}...`}</Card.Text>
            <Card.Text>{`Amount offered: ${props.task.reward}`}</Card.Text>
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
          <Modal.Title>{props.task.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="justify-content-end">
            <Col xs={{ span: 5}} style={{textAlign: 'left'}}>
              {taskDetail}
              <p className="ml-3">{responses.length ? `You have had ${responses.length} respondants.` : 'Noone has responded yet.'}</p>
            </Col>
            <Col xs={{ span: 7}} style={{textAlign: 'left'}}>
              {slides}
            </Col>
          </Row>
          <Row className="justify-content-end mr-3">
            <p>{`Reward offered for the task of ${props.task.reward}`}</p>
          </Row>
        </Modal.Body>
        <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseModal}>
          Close
        </Button>
        <Button variant="primary" type="submit" disabled>
          Pay User
        </Button>
        </Modal.Footer>
      </Modal>
    </>
  )

}

WorkDetail.propTypes = {
  task: PropTypes.object
}

export default WorkDetail
