import axios from "axios";

// Return user first
export function userFirstName(prop) {
    // let nameArray = prop.split(' ');
    // return nameArray[0];
  }


  export function test(prop) {
    return axios.get(`${prop}`)
    .then((response) => {
      return response.data;
    })
  }

// Highlight search words
export function renderedQuestion(param, param2) {
  let title = param.split(' ');
  let array = [];
  for (let word of title) {
      if (word.toLowerCase().includes(param2.toLowerCase())) {
          array.push(`<span class="highlight">${word}</span>`);
      } else {
          array.push(word);
      }
  }
  return array.join(' ');
}

export function scienceBrnaches() {
  return ([
    "Agriculture",
    "Biochemistry",
    "Biological and Biomedical Sciences",
    "Biomedical Engineering",
    "Biotechnology",
    "Chemistry",
    "Engineering",
    "Environmental Sciences",
    "Life Sciences",
    "Physical Sciences",
    "Physics"
]);
};

// Convert date format 20240809 to human readable string
export function readableDate(arg) {
  // Extract year, month, and day from the string
  const year = arg?.substring(0, 4);
  const month = arg?.substring(4, 6);
  const day = arg?.substring(6, 8);
  
  // Create a new Date object using the extracted values
  const date = new Date(`${year}-${month}-${day}`);
  
  // Define options for the date formatting
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  
  // Format the date to a human-readable string
  let humanReadableDate = date.toLocaleDateString('en-US', options);
      return humanReadableDate;
  }
  