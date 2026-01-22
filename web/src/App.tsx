// Import necessary hooks from the React library.
// - `useEffect` is for handling side effects, like API calls or subscriptions.
// - `useState` is for adding state to functional components.
import { useEffect, useState } from "react";

// Import CSS for styling the component.
import "./App.css";

/**
 * The main application component.
 * It connects to the Go gateway via WebSockets and displays the data received from the simulation.
 */
function App() {
  // --- State Management ---

  // Declare a state variable `data` to hold the most recent message from the server.
  // `useState` returns a pair: the current state value (`data`) and a function to update it (`setData`).
  // We initialize it with a default string.
  const [data, setData] = useState("Waiting for data...");

  // --- WebSocket Connection ---

  // The `useEffect` hook runs after the component renders. It's the right place to
  // establish the WebSocket connection.
  // The empty dependency array `[]` at the end means this effect will only run ONCE, (actually in StrictMode it can run twice but it's just React checking if the connection closes correctly)
  // when the component is first mounted (similar to componentDidMount in class components).
  useEffect(() => {
    // Create a new WebSocket connection to the Go gateway.
    // The URL `ws://localhost:8081/ws` points to the port we exposed in `compose.yaml`.
    // "ws" stands for "WebSocket", similar to "http".
    const socket = new WebSocket("ws://localhost:8081/ws"); // port of the local machine (host)

    console.log(socket);

    // --- WebSocket Event Handlers ---

    // This function is called when the WebSocket connection is successfully opened.
    socket.onopen = () => {
      console.log("Connected to Gateway!");
    };

    // This function is called every time a message is received from the server.
    socket.onmessage = (event) => {
      // `event.data` contains the message content from the server (the JSON string from Rust).
      // We update our component's state with this new data.
      setData(event.data);
    };

    // --- Cleanup ---

    // The function returned from `useEffect` is a cleanup function.
    // It's called when the component is unmounted (e.g., when you navigate to a different page).
    // This is crucial for closing the WebSocket connection to prevent memory leaks.
    return () => {
      socket.close();
      console.log("Disconnected from Gateway.");
    };
  }, []); // Empty dependency array ensures this runs only once.

  // --- Render JSX ---

  // This is the JSX that defines the component's UI.
  // It's a syntax extension for JavaScript that looks like HTML.
  return (
    <div
      style={{
        color: "white",
        background: "#222",
        height: "100vh",
        padding: "20px",
      }}
    >
      <h1>Robot Dashboard</h1>
      {/* The `<pre>` tag preserves whitespace and line breaks, ideal for displaying raw data. */}
      {/* We display the current value of the `data` state variable here. */}
      {/* When `setData` is called, React re-renders the component with the new data. */}
      <pre>{data}</pre>
    </div>
  );
}

// Export the App component so it can be used in other files (like main.tsx).
export default App;
