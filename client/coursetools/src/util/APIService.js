// Import caccl
import initCACCL from 'caccl/client/cached';

const { api, getStatus } = initCACCL();

function adjustPropertyNamesForCACCL(o){
  if (o.due_at) o.dueAt = o.due_at;
  if (o.unlock_at) o.unlockAt = o.unlock_at;
  if (o.lock_at) o.lockAt = o.lock_at;
  return o;
}
class APIService {

}

APIService.updateItem = async function(type, id, content_id, o){
  console.log('type is '+type);
  console.log('content_id is '+content_id);
  let params = {};
  switch(type){
    case 'Assignment':
      o = adjustPropertyNamesForCACCL(o);
      params =  Object.assign({assignmentId: content_id,}, o);
      return await api.course.assignment.update(params);
      break;
    case 'Module':
     // In CanvasAPI, module param names must be wrapped in 'module[]'
      let module_o = {}
      for(let l in o){
          module_o['module['+l+']'] = o[l];
      }
      //console.log(`/api/v1/courses/${o.courseId}/modules/${id}`);
      //console.log(module_o)
      params =  {
        method: 'PUT',
        path: `/api/v1/courses/${o.courseId}/modules/${id}`,
        params: module_o,
      };
      return await api.other.endpoint(params);
      break;
    case 'Quiz':
      // change params property names for CACCL
      o = adjustPropertyNamesForCACCL(o);
      params =  Object.assign({quizId: content_id,}, o);
      return await api.course.quiz.update(params);
      break;
    case 'Discussion':
      o = adjustPropertyNamesForCACCL(o);
      params =  {
        method: 'PUT',
        path: `/api/v1/courses/${o.courseId}/discussion_topics/${content_id}`,
        params: o,
      };
      return await api.other.endpoint(params);
      break;
    case 'Page':
    // In CanvasAPI, page param names must be wrapped in 'wiki_page[]'
     let url = content_id.match(/.*\/(\S+)/);
     console.log('url');console.log(url[1]);
     let page_o = {}
     for(let l in o){
         page_o['wiki_page['+l+']'] = o[l];
     }
     //page_o['wiki_page[title]'] = o.name;
      params =  {
        method: 'PUT',
        path: `/api/v1/courses/${o.courseId}/pages/${url[1]}`,
        params: page_o,
      };
      return await api.other.endpoint(params);
      break;
    case 'ExternalUrl':
    case 'SubHeader':
    case 'ExternalTool':
    case 'File':
      params =  {
        method: 'PUT',
        path: `/api/v1/courses/${o.courseId}/modules/${o.module_id}/items/${id}`,
        params: {
          'module_item[title]': o.name,
        },
      };
      return await api.other.endpoint(params);
      break;
  }
}

APIService.responses = [];
APIService.updateModules = async function(courseId, rows){

  //accumulate responses
  this.responses = [];

  let o = {
    courseId: courseId,
  };

  // go over this list of rows
  for (let i=0; i<rows.length; i++){
    // see if there's modified fields in this row
    if (rows[i].modified.length > 0 ){
      console.log("updating a row");
      console.log(rows[i]);

      let modified_fields = rows[i].modified;
      // since there are, we pull these keys and values into a new object
      for (let k=0;k<rows[i].modified.length;k++){
        // need to handle the case where this is a date that's been cleared. In that case,
        // the date can't be passed as null, but needs to be an empty string
        if (modified_fields[k] == 'unlock_at' || modified_fields[k] == 'lock_at' || modified_fields[k] == 'due_at'){
          o[modified_fields[k]] = rows[i][modified_fields[k]] || '';
        } else {
          // it's not a date field, so copy as is
          o[modified_fields[k]] = rows[i][modified_fields[k]];
        }
      }
      // manully override to overcome bug in CACCL(?)
      // title is always claled name in the grid
      o.name = rows[i].name;
      o.title = rows[i].name;
      o.module_id = rows[i].module_id;

      // call appropriate method to update this row
      try{
        console.log("calling updateItem on "+rows[i].type+" with content_id "+ rows[i].content_id +"params ");
        console.log(o);
        await this.updateItem(rows[i].type, rows[i].id, (rows[i].content_id || rows[i].url || (rows[i].discussion_topic && rows[i].discussion_topic.id) || null), o).then(res => this.responses.push(res));
      }catch(err){
        console.log('failed in APIService.updateModules' + err);
      }
      //return responses;
    }
  }
}// end updateModules


export default APIService;
