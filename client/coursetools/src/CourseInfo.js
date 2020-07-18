// Header.js
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Container, Col, Row, Card, ListGroup, ListGroupItem } from 'react-bootstrap';


class CourseInfo extends Component {

  constructor(props){
    super(props);
    this.state ={
      available: '',
    }
    this.handleEdit = this.handleEdit.bind(this);
    this.handleStopEdit = this.handleStopEdit.bind(this);
    console.log(props.course);
  }


  handleEdit(event) {
      this.setState({editMode: true});
  }
  handleStopEdit(event) {
      this.setState({editMode: false});
  }
  workflowState () {
      // get availability info
      // 'unpublished', 'available', 'completed', or 'deleted'
      let obj = {
        workflow_state: '',
        start_at: '',
        end_at: ''
      };
      let {workflow_state, start_at, end_at}  = this.props.course;
      //debugger;
      if (workflow_state){
        workflow_state =  (workflow_state=="available" ? "Published" : workflow_state.charAt(0).toUpperCase() + workflow_state.slice(1));
      }
      obj.workflow_state = workflow_state;
      if (start_at){
        obj.start_at = new Date(start_at);
      }
      if (end_at){
        obj.end_at = new Date(end_at);
      }
      return obj;
  }

  moduleState(){
    let numMods = this.props.course.modules.length;
     let modsPublished = this.props.course.modules.reduce((acc, val)=>{
        if(val.published){
          return ++acc;
        }
        return acc;
      }, 0);
      return {
        modules: numMods,
        hasMods: numMods>0,
        modules_published: modsPublished,
      };
  }

  render() {
    return (
      <Container>
        <Row>
          <Col><h2>{this.props.course.name}</h2></Col>
        </Row>
        <Row>
          <Col>
              <Card>
                <Card.Body>
                  <Card.Header>Course Info</Card.Header>
                  <ListGroup>
                    <ListGroupItem><b>Course ID: </b>{this.props.number}</ListGroupItem>
                    <ListGroupItem><b>Course Code: </b> {this.props.course.course_code}</ListGroupItem>
                    <ListGroupItem><b>Account: </b> {this.props.course.account.name} </ListGroupItem>
                    <ListGroupItem><b>Term: </b> {this.props.course.term.name}
                                   { (this.props.course.term.start_at ) ? <div><br /><b>Term Dates: </b> {this.props.course.term.start_at} until {this.props.course.term.end_at}</div> : ''
                                   }
                     </ListGroupItem>
                  </ListGroup>
                  <Card.Header>Enrollment Info</Card.Header>
                  <ListGroup>
                    <ListGroupItem><b>Students </b>{this.props.course.students.length}</ListGroupItem>
                    <ListGroupItem><b>Sections: </b> {this.props.course.sections.length}</ListGroupItem>
                    <ListGroupItem><b>Teachers: </b> {this.props.course.teachers.length} </ListGroupItem>
                  </ListGroup>
                </Card.Body>
              </Card>
          </Col>
          <Col>
          <Card>
            <Card.Body>
              <Card.Header>Visibility</Card.Header>
              <ListGroup>
                <ListGroupItem><b>Availability: </b> {this.workflowState().workflow_state}</ListGroupItem>
                <ListGroupItem><b>Is Public: </b> { this.props.course.is_public ? "Yes" : "No"}</ListGroupItem>
                <ListGroupItem><b>Opens On: </b> {this.workflowState().start_at.toString()}</ListGroupItem>
                <ListGroupItem><b>Closes On: </b> {this.workflowState().end_at.toString()}</ListGroupItem>
              </ListGroup>
              <Card.Header>Configuration</Card.Header>
              <ListGroup>
                <ListGroupItem><b>Default View: </b> {this.props.course.default_view}</ListGroupItem>
                <ListGroupItem><b>Modules: </b> { this.moduleState().modules}</ListGroupItem>
                <ListGroupItem><b>Published Modules: </b> { this.moduleState().modules_published}</ListGroupItem>

              </ListGroup>
            </Card.Body>
          </Card>
          </Col>

        </Row>

      </Container>
    );
  }
}

export default CourseInfo;
