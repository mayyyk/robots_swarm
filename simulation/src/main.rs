// The `use` keyword imports modules from the Rust standard library (`std`).
// This allows us to use items defined in those modules, like `UdpSocket`.
use nalgebra::Vector3;
use serde_json;
use std::net::UdpSocket;
use std::thread;
use std::time::Duration;

pub fn modified_gram_schmidt_history(vectors: &mut Vec<Vector3<f32>>) -> Vec<Vec<Vector3<f32>>> {
    let mut history = vec![vectors.clone()];
    let n = vectors.len();

    for i in 0..n {
        // Current vector normalization
        let norm = vectors[i].norm();

        // getting unit vector
        if norm > f32::EPSILON {
            vectors[i] /= norm;
        }
        history.push(vectors.clone());

        let v_i = vectors[i]; // Create a copy to resolve borrow checker error

        for j in (i + 1)..n {
            let proj = vectors[j].dot(&v_i);
            vectors[j] -= v_i * proj;
            history.push(vectors.clone());
        }
    }
    history
}



/// The main function is the entry point of the Rust program.
/// The `-> Result<(), Box<dyn std::error::Error>>` part is the return type.
/// It indicates that the function can return either an empty tuple `()` on success,
/// or a boxed error that can be of any type implementing the `Error` trait on failure.
/// This is a common way to handle errors in Rust.
fn main() -> Result<(), Box<dyn std::error::Error>> {
    // --- Wait for Gateway to start ---
    println!("Simulation service started. Waiting 3 seconds for gateway to be ready...");
    thread::sleep(Duration::from_secs(3));

    // --- Network Setup ---
    let socket = UdpSocket::bind("0.0.0.0:0")?;
    socket.connect("gateway:8000")?;
    println!("Simulation started, sending Gram-Schmidt steps to Gateway via UDP");

    // --- Simulation Loop ---
    loop {
        // Define the initial set of vectors for this iteration.
        let mut vecs = vec![
            Vector3::new(2.0, 1.0, 0.0),
            Vector3::new(1.0, 2.0, 0.0),
            Vector3::new(1.0, 1.0, 1.5),
        ];

        // Calculate the history of the Gram-Schmidt process.
        let history = modified_gram_schmidt_history(&mut vecs);

        // Send each step of the history to the frontend for visualization.
        for vectors in history {
            let payload = serde_json::to_string(&vectors)?;
            socket.send(payload.as_bytes())?;
            // Pause between steps to make the visualization viewable.
            thread::sleep(Duration::from_millis(500));
        }

        // Pause before repeating the animation.
        thread::sleep(Duration::from_secs(3));
    }
}
