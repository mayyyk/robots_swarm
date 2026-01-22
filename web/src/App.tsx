import { OrbitControls, Grid } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { Vector3, Box3 } from "three";
import { VectorArrow } from "./components/VectorArrow";
import "./App.css";

// Type definition for a single vector.
type Vector = {
  x: number;
  y: number;
  z: number;
};

// Colors for the vectors to make them distinguishable.
const COLORS = ["#ff6347", "#4682b4", "#3cb371", "#ffd700", "#6a5acd"];

/**
 * A helper component to automatically adjust the camera to fit all objects in the scene.
 */
function CameraRig() {
  const { camera, scene } = useThree();
  useEffect(() => {
    const box = new Box3().setFromObject(scene);
    const center = new Vector3();
    box.getCenter(center);
    camera.position.set(center.x, center.y, 10); // Position the camera at a distance.
    camera.lookAt(center);
  }, [camera, scene]);

  return null;
}

/**
 * The main application component.
 * It connects to the Go gateway via WebSockets and displays a 3D visualization of the vectors.
 */
function App() {
  // State to hold the array of vectors received from the simulation.
  const [vectors, setVectors] = useState<Vector[]>([]);

  // Effect to establish and manage the WebSocket connection.
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8081/ws");

    socket.onopen = () => {
      console.log("Connected to Gateway!");
    };

    // Handle incoming messages from the WebSocket.
    socket.onmessage = (event) => {
      try {
        // Parse the JSON data from the server.
        const parsedData: Vector[] = JSON.parse(event.data);
        setVectors(parsedData);
        console.log(parsedData);
      } catch (error) {
        console.error("Failed to parse incoming data:", error);
      }
    };

    // Cleanup function to close the connection when the component unmounts.
    return () => {
      socket.close();
      console.log("Disconnected from Gateway.");
    };
  }, []); // Empty dependency array ensures this runs only once.

  return (
    <div style={{ height: "100vh", background: "#222" }}>
      <Canvas>
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />

        {/* Camera and Controls */}
        <OrbitControls />
        <CameraRig />

        {/* Scene Helpers */}
        <Grid
          infiniteGrid
          sectionColor={"#555"}
          sectionSize={2}
          fadeDistance={25}
        />

        {/* Render the vectors */}
        {vectors.map((vec, index) => (
          <VectorArrow
            key={index}
            start={[0, 0, 0]}
            end={[vec.x, vec.y, vec.z]}
            color={COLORS[index % COLORS.length]}
            label={`v${index + 1}`}
          />
        ))}
      </Canvas>
    </div>
  );
}

export default App;
