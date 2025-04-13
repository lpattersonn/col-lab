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
  }).catch((err) => {})
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

export function scienceBranches() {
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
  
  // Convert date format
  export function dateFormat(dateString) {
     // Create a Date object from the input string
     const dateObj = new Date(dateString);

     // Extract the year, month, and day
     const year = dateObj.getFullYear();
     const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
     const day = String(dateObj.getDate()).padStart(2, '0');
 
     // Combine them into the desired format
     const formattedDate = `${year}-${month}-${day}`;
     return formattedDate;
  };

export function humanReadableDate(args) {
  const dateString = args;
  const date = new Date(dateString);

  // Define options for formatting
  const options = { year: 'numeric', month: 'long', day: 'numeric' };

  // Format the date
  const humanReadableDate = date.toLocaleDateString('en-US', options);
  return humanReadableDate;
}

// Submit a report
export function submitReport(argPostType, userDetails) {
  // Create a axios post request that creates a post request that creates a request post type. 
  return axios.post(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/report-post`,
    {
      title: `Misconduct from ${userDetails?.firstName} on ${argPostType?.type}`,
      author: userDetails?.id,
      author_email: userDetails?.email,
      author_name: `${userDetails?.firstName} ${userDetails?.lastName}`,
      content: argPostType?.content?.rendered,
      excerpt: 'Reporting a user infraction',
      status: 'publish',
      'acf' : {
          'offence_type': `${argPostType?.type}`,
          'offence_authorid': `${argPostType?.author}`,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${userDetails?.token}`,
        'Content-Type': 'application/json',
      }
    }
    ).then((res) => {
        alert("Thank you. The post has been reported.")
    }).catch((error) => {
      console.log(error)
    });
}

// Reduce user points
export async function reducePoints(user, fee, required) {
  try {
      // Fetch user data
      const response = await fetch(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/users/${user.id}`, {
          headers: {
              Authorization: `Bearer ${user.token}`,
          },
      });

      if (!response.ok) {
          throw new Error('Failed to fetch user details');
      }

      const userDetails = await response.json();
      const currentPoints = Number(userDetails?.acf?.["user-points"]) || 0;

      // Check if user has enough points
      if (currentPoints < Number(required)) {
          alert(`⚠️ You don\’t have enough points to submit a learning request. Visit the Points Center to earn more points and try again!`);
          return;
      }

      const updatedPoints = currentPoints - Number(fee);

      // Update user points via POST
      const updateResponse = await fetch(`${process.env.REACT_APP_API_URL}/wp-json/wp/v2/users/${user.id}`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
              acf: {
                  "user-points": updatedPoints,
              },
          }),
      });

      if (!updateResponse.ok) {
          throw new Error('Failed to update user points');
      } else {
        const updatedUser = await updateResponse.json();

        console.log("User points updated successfully:", updatedUser);
        return true;
      }
  } catch (error) {
      console.error("Error reducing points:", error);
  }
}
