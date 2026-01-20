// The `use` keyword imports modules from the Rust standard library (`std`).
// This allows us to use items defined in those modules, like `UdpSocket`.
use std::net::UdpSocket; // For UDP (User Datagram Protocol) networking.
use std::{thread, time}; // For pausing the execution thread and handling time durations.

/// The main function is the entry point of the Rust program.
/// The `-> Result<(), Box<dyn std::error::Error>>` part is the return type.
/// It indicates that the function can return either an empty tuple `()` on success,
/// or a boxed error that can be of any type implementing the `Error` trait on failure.
/// This is a common way to handle errors in Rust.
fn main() -> Result<(), Box<dyn std::error::Error>> {
    // --- Network Setup ---

    // Bind a UDP socket to an available port on any network interface.
    // `UdpSocket::bind` attempts to create a new UDP socket.
    // "0.0.0.0:0" means "listen on all available network interfaces on a random, available port".
    // SYNTAX: `let` declares a variable. Variables are immutable by default in Rust.
    // The `?` at the end is the "try" or "question mark" operator. It's for error handling.
    // If the expression before it (`UdpSocket::bind(...)`) returns an `Err`, the function
    // will immediately return that `Err`. If it's `Ok`, it will unwrap the value and assign it to `socket`.
    let socket = UdpSocket::bind("0.0.0.0:0")?;

    // Connect the UDP socket to the gateway's address.
    // "gateway:8000" works because Docker's networking will resolve the service name "gateway"
    // to the correct container IP address. Port 8000 is what the Go gateway is listening on for UDP.
    // Note: `connect` on a UDP socket doesn't establish a persistent connection like TCP. It just
    // sets the default destination for `send` calls, so we don't have to specify it every time.
    socket.connect("gateway:8000")?;

    // `println!` is a macro that prints a line to the console.
    println!("Simulation started, sending data to Gateway via UDP");

    // --- Simulation Loop ---

    // Declare a mutable variable `x` and initialize it to 0.0.
    // SYNTAX: `mut` makes a variable mutable, meaning its value can be changed later.
    let mut x = 0.0;

    // `loop` creates an infinite loop. The code inside will run forever until the program is stopped.
    loop {
        // Increment the value of `x`.
        x += 1.0;

        // --- Create JSON Data ---

        // Create a JSON string with the robot's simulated position.
        // `format!` is a macro that creates a `String` from a template.
        // SYNTAX: `r#"{...}"#` is a "raw string". It allows you to write strings
        // that contain special characters like `"` without needing to escape them.
        // `{:.2}` is a format specifier that formats the `x` variable as a floating-point
        // number with two decimal places.
        let json_data = format!(r#"{{"id": "robot_1", "x": {:.2}, "y": 0.5}}"#, x);

        // --- Send Data ---

        // Send the JSON data as a byte slice over the UDP socket.
        // `.as_bytes()` converts the `String` into a `&[u8]` (a byte slice).
        // The `?` operator handles any potential error from the `send` operation.
        socket.send(json_data.as_bytes())?;

        // --- Control Loop Speed ---

        // Pause the current thread for 16 milliseconds.
        // This creates a loop that runs at approximately 60 frames per second (1000ms / 16ms ≈ 62.5 FPS).
        // SYNTAX: `::` is the path separator, used to access functions, modules, or types
        // within a crate or module (e.g., `thread::sleep`).
        thread::sleep(time::Duration::from_millis(16));
    }
}