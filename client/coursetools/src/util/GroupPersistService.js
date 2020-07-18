// Import caccl

class GroupPersistService {

}

GroupPersistService.saveCourseGroup = function(group, key){
  console.log('setting course group');
  console.log(group);
  localStorage.setItem(key, JSON.stringify(group));
}
GroupPersistService.getCourseGroup = function(key){
  console.log('getting course group '+key);
  console.log(localStorage.getItem(key));
  return JSON.parse(localStorage.getItem(key));
}


export default GroupPersistService;
