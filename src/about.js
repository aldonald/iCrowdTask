import React from 'react'
import Container from 'react-bootstrap/Container'
import Footer from './footer'

const About = () => {
  return (
    <>
      <Container>
        <div style={{
          position: 'relative',
          width: '100%',
          height: '0',
          paddingTop: '141.4286%',
          paddingBottom: '48px',
          boxShadow: '0 2px 8px 0 rgba(63,69,81,0.16)',
          marginTop: '1.6em',
          marginBottom: '0.9em',
          overflow: 'hidden',
          borderRadius: '8px',
          willChange: 'transform'
        }}>
          <iframe style={{position: 'absolute', width: '100%', height: '100%', top: '0', left: '0', border: 'none', padding: '0', margin: '0'}}
            src="https:&#x2F;&#x2F;www.canva.com&#x2F;design&#x2F;DAEKQ8MWFAk&#x2F;view?embed">
          </iframe>
        </div>
      </Container>
      <Footer />
    </>
  )
}

export default About
