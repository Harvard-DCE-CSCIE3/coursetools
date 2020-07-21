// Import caccl
import {mean, median, standardDeviation} from 'simple-statistics';


function days_between(date1, date2) {

    // The number of milliseconds in one day
    const ONE_DAY = 1000 * 60 * 60 * 24;

    // Calculate the difference in milliseconds
    const differenceMs = Math.abs(date1 - date2);

    // Convert back to days and return
    return Math.round(differenceMs / ONE_DAY);

}

class StudentAccess {

  constructor(students){
    this.students = students;

    this.studentsNeverAccessed = [];
    this.studentsAccessed = [];
    this.meanLastAccess = 'N/A';
    this.medianLastAccess = 'N/A';
    this.createStudentLists();
    this.calculateAccessStats();
  }

  createStudentLists(){
    this.students.forEach(el =>{
      if (el.enrollments[0].last_activity_at){
        this.studentsAccessed.push(el);
      }else{
        this.studentsNeverAccessed.push(el);
      }
    });
  }

  calculateAccessStats(){
    let lastAccessDays = this.studentsAccessed.map((val, idx, ar)=>{
      // add days since last activity to the array, as a # of days
      let lastAccessDate = new Date(val.enrollments[0].last_activity_at);
      val.daysSinceActivity = days_between(Date.now(), lastAccessDate);
      // return new array of just the number of days
      return val.daysSinceActivity;
    });
    // with the array of only days:
      // get mean and median
    if (lastAccessDays && lastAccessDays.length>0){
      this.meanLastAccess = mean(lastAccessDays).toFixed(1);
      this.medianLastAccess = median(lastAccessDays).toFixed(1);

      // now get stardard deviation and add that value to the studentsAccessed array

      let stdDev = standardDeviation(lastAccessDays);
      this.studentsAccessed.forEach((el, idx)=>{
        el.last_access_std_dev = (el.daysSinceActivity - stdDev.toFixed(1)).toFixed(1);
      });
    }
  }


}// end class



// average time since last access

// number never accessed

// list never accessed



export default StudentAccess;
