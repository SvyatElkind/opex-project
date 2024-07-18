import React, { useState, useEffect } from 'react';

function App() {
  const [data, setData] = useState(null);
  const requestoptions = {
    method: "GET",
    mode : "no-cors"
  }

  useEffect(() => {
    fetch('127.0.0.1:8000/api/v1/projects/1/',requestoptions)
      .then(response => response.json())
      .then(json => setData(json))
      .catch(error => console.error(error));
  }, []);

  return (
    <div>
      {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : 'Loading...'}
    </div>
  );
}

export default App;