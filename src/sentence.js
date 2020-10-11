import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import recognizeMic from 'watson-speech/speech-to-text/recognize-microphone'


const Sentence = (props) => {
  const [responseText, setResponseText] = useState('')
  const [record, setRecord] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState({})

  const sendResponse = (ev) => {
    ev.preventDefault()
    props.sendResponse(responseText)
  }

  const recordData = () => {
   fetch('/api/speech-token')
   .then((response) =>{
     return response.json()
   }).then((response) => {
     const stream = recognizeMic({
         accessToken: response.accessToken,
         objectMode: true,
         extractResults: true,
         format: false,
         url: response.url,
         splitTranscriptAtPhraseEnd: true,
         inactivityTimeout: 2
     })

     stream.on('data', (data) => {
       setResponseText(`${responseText} ${data.alternatives[0].transcript}`)
       if (data.final) {
         setRecord(false)
         stream.stop()
       }
     })
     stream.on('error', function(err) {
       console.log(err)
     })
     document.querySelector('#mic').onclick = () => {
       setRecord(false)
       return stream.stop()
     }
   }).catch(function(error) {
    console.log(error)
   })
 }

 const setRecording = () => {
   if (!record) recordData()
   setRecord(!record)
 }

  return (
    <>
      <h4 style={{textAlign: 'left'}}>Description</h4>
      <p>{props.requestor.description}</p>
      <h5>Question</h5>
      <p>{props.requestor.sentenceTaskQuestion}</p>
      {props.action &&
        (
          <Form className="mb-3">
            <Form.Group controlId="sentenceTaskQuestion">
              <Form.Label>Add your response</Form.Label>
              <Form.Control
                as="textarea"
                rows={15}
                name="sentenceTaskQuestion"
                onChange={(ev) => setResponseText(ev.target.value)}
                value={responseText}
              />
            </Form.Group>
            <Row style={{justifyContent: 'space-between'}}>
              <a
                id="mic"
                onClick={setRecording}
                className="ml-3"
              >
                <i
                  className="fas fa-microphone-alt"
                  style={{fontSize: '24px', color: record ? 'red' : 'black'}}
                ></i>
              </a>
              <Button className="m-1 mr-3" variant="success" type="submit" onClick={sendResponse}>Send Response</Button>
            </Row>
          </Form>
        )}
    </>
  )
}

Sentence.propTypes = {
  requestor: PropTypes.object,
  sendResponse: PropTypes.func,
  action: PropTypes.bool
}

export default Sentence
