import React, { useState, useEffect } from 'react'
import ImageUploader from 'react-images-upload'
import PropTypes from 'prop-types'
import Image from 'react-bootstrap/Image'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Container from 'react-bootstrap/Container'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import faker from  'faker'

const HeadImg = (props) => {
  const [userImg, setUserImg] = useState({})
  const [file, setFile] = useState({})
  const [fileName, setFileName] = useState('Update image')
  const [show, setShow] = useState(false)


  const arrayBufferToBase64 = (buffer) => {
    var binary = ''
    var bytes = [].slice.call(new Uint8Array(buffer))
    bytes.forEach((b) => binary += String.fromCharCode(b))
    return window.btoa(binary)
  }

  const fetchHeadImage = () => {
    const url = `api/userimage/`
    fetch('/api/userimage/', {
      credentials: 'include'
    })
    .then(response => response.json())
    .then(response => {
      const dataType = response.img.contentType
      const data = arrayBufferToBase64(response.img.data.data)
      setUserImg({dataType: dataType, data: data})
    })
  }

  const onFileChange = e => {
    setFile(e.target.files[0])
    setFileName(e.target.files[0].name)
  }

  const onFileSubmit = e => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('image', file)
    fetch('/api/userimage/', {
      method: 'POST',
      credentials: 'include',
      body: formData
    })
    .then(response => response.json())
    .then(response => {
      const dataType = response.img.contentType
      const data = arrayBufferToBase64(response.img.data.data)
      setUserImg({dataType: dataType, data: data})
    })
    .then(data => {
      console.log('Success:', data)
    })
    .catch((error) => {
      console.error('Error:', error)
    })
  }

  const handleShow = () => {
    setShow(true)
  }

  const handleClose = () => {
    setShow(false)
  }

  useEffect(fetchHeadImage, [])

  return (
    <>
      <Image
        style={{maxHeight: "400px", width: "100%", objectFit: "cover"}}
        src={
          userImg.data ? `data:${userImg.dataType};base64,${userImg.data}` : faker.image.cats()
        }
        fluid
        className="mt-5"
      />
      <Row className="justify-content-end">
        <Col xs={{ span: 3}} style={{textAlign: 'right'}}>
          <Button variant="outline-dark" size="sm" onClick={handleShow} className="mt-2 mr-2">
            Change Displayed Photo
          </Button>
        </Col>
      </Row>

      <Modal
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        show={show}
        onHide={handleClose}
      >
        <Form onSubmit={onFileSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Add Photo</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.File
              id="imageFile"
              label={fileName}
              custom
              onChange={onFileChange}
            />

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" type="submit" onClick={handleClose}>
              Update image
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  )

}

export default HeadImg
