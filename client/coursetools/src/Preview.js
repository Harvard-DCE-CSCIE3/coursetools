import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye } from '@fortawesome/free-solid-svg-icons'
import { OverlayTrigger, Popover  } from 'react-bootstrap';

// for the preview html
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Import caccl
import initCACCL from 'caccl/client/cached';

// set up DOMPurify
const window = (new JSDOM('')).window;
const DOMPurify = createDOMPurify(window);

const { api, getStatus } = initCACCL();

class Preview extends Component {
   constructor(props){
     super(props);
     let html_url = props.item.html_url || props.item.items_url;
     let id = html_url.match(/courses\/(\d+)\//)[1];
     this.state = {
       content: {},
       courseId: id,
       type: props.item.type || '',
     }
   }

   componentDidMount() {
     setTimeout(()=>{
       let content = this.getContent().then((c)=>{
       this.setState({content: c});
     })}, Math.round((Math.random()*5000))// cheesy way to avoid throttling: generate random loading time from 0 to 5 seconds
   )}

  async getContent(){
    let type=this.props.item.type;
    if (type=='Page'){
      let page = await api.course.page.get({
        courseId: this.state.courseId,
        pageURL: this.props.item.page_url,
      });
      return page;
    } else if (type=='Assignment'){
      let assn = await api.course.assignment.get({
        courseId: this.state.courseId,
        assignmentId: this.props.item.content_id,
      });
      return assn;
    } else if (type=='Discussion'){
      console.log(`getting /api/v1/courses/${this.state.courseId}/discussion_topics/${this.props.item.content_id}`)
      let disc = await api.other.endpoint({
        path: `/api/v1/courses/${this.state.courseId}/discussion_topics/${this.props.item.content_id}`,
        method: 'GET',
      });
      console.log(disc);
      disc.description = disc.message;
      return disc.assignment || disc;
    } else if (type=='Quiz'){
      let quiz = await api.course.quiz.get({
        courseId: this.state.courseId,
        quizId: this.props.item.content_id,
      });
      return quiz;
    } else if (type=='File'){
      let file = await api.other.endpoint({
        path: `/api/v1/courses/${this.state.courseId}/modules/${this.props.item.module_id}/items/${this.props.item.id}`,
        method: 'GET',
      });
      return file;
    }
    return;
  }

 popover(){
    return (
      <Popover id="popover-basic">
        <Popover.Title as="h3">Page Content</Popover.Title>
        <Popover.Content>
          {this.state.content.body}
        </Popover.Content>
      </Popover>
  )};

  loadPreview(e) {
    /*debugger;
    console.log("loading");
    let content = this.getContent();
    this.setState({
      content: content,
    })*/
    e.preventDefault();
    return false;
  }

  render(){
    return (
        <OverlayTrigger
          delay={{ show: 50, hide: 200 }}
          placement="right"
          trigger="click"
          rootClose
          overlay={(
            <Popover id="popover-basic">
              <Popover.Title as="h3">{(this.state.type || '') + ': ' + (this.state.content && (this.state.content.title || this.state.content.name || ''))}</Popover.Title>
              <Popover.Content>
              {
                (this.state.type=="Assignment" || this.state.type=="Quiz" || this.state.type=="Discussion")  &&
                 <div className={'assn_dates_popover'}>
                   <b>Due At:</b>{this.state.content && (this.state.content.due_at || '')} <b>Unlock At: </b>{this.state.content && (this.state.content.unlock_at || '')} <b>Available Until: </b>{this.state.content && (this.state.content.lock_at || '')}
                 </div>
               }
                   <div className={'preview_content'} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize((this.state.content && (this.state.content.body || this.state.content.description || 'N/A')), {ADD_TAGS: ['iframe']}) }} />
              </Popover.Content>
            </Popover>
          )}>
          <a href="#" onClick={this.loadPreview} title="Preview Content" className="previewIcon"><FontAwesomeIcon icon={faEye} /></a>
        </OverlayTrigger>
  )};
}
// see if this even runs...


export default Preview;
