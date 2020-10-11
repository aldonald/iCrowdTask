import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import MyFilter from './filter'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import WorkDetail from './completedworkdetail'
import { useHistory } from "react-router-dom"
import Loader from 'react-loader-spinner'


const MyOutstandingWork = () => {
  const [myOutstandingList, setMyOutstandingList] = useState([])
  const [filteredList, setFilteredList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFullList, setShowFullList] = useState(false)

  const history = useHistory()

  const fetchAllCards = () => {
    const url = '/api/requests/foruser'
    fetch(url).then(response => {
      return response.json()}
    ).then(response => {
      setMyOutstandingList(response)
      setFilteredList(response)
    }).finally(() => setLoading(false))
  }

  const refresh = () => {
    setLoading(true)
    return document.location.reload()
  }

  let workListDisplay
  if (myOutstandingList.length > 0) {
    workListDisplay = filteredList.map((workItem, i) => (
      <WorkDetail
        key={`workItem-${i}`}
        task={workItem}
        refresh={refresh}
      />
    )
  )} else {
    workListDisplay = <p>No work allocated. Why don't you <a href="/newtask">create a task</a>.</p>
  }

  const addTasks = () => {
    fetchAllCards()
  }

  const filterJobs = (jobs) => {
    setFilteredList(jobs)
  }

  useEffect(fetchAllCards, [])

  return (
    <>
      <Loader
        visible={loading}
        type="Oval"
        color="#00BFFF"
        height={200}
        width={200}
        style={{textAlign: 'center', verticalAlign: 'middle', margin: '0', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}
      />
      <Container className="mt-5">
        <Row className="mb-5" style={{alignItems: 'flex-end'}}>
          <h2 className="mt-5 mb-0">Tasks allocated out to workers</h2>
          <MyFilter returnResults={filterJobs} workList={myOutstandingList} />
        </Row>
        <Row>
          {workListDisplay}
        </Row>
      </Container>
    </>
  )
}

export default MyOutstandingWork
