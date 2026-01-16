import React from "react";
import Sidebar from "../components/Sidebar.jsx";
import Chatbox from "../components/Chatbox.jsx";
import { useMsgStore } from "../store/useMsgStore.js";

const HomePage = () => {
  const { selectedUser } = useMsgStore();
  return (
    <div className="flex-1 flex h-screen overflow-auto">
      <Sidebar />
      {selectedUser ? (
        <Chatbox />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="p-4 space-y-4">
            <h1 className="text-3xl font-bold">Welcome to ChatUp</h1>
            <p>
              <span role="img" aria-label="speech bubble">
                {" "}
              </span>{" "}
              A full-stack chat application built with React, Node.js, Express and MongoDB.
              For Deployment used Docker, Kubernetes, Nginx.
            </p>
            <p>
              <span role="img" aria-label="rocket">
                {" "}
              </span>{" "}
              It supports real-time messaging, online status, and file sharing
              via{" "}
              <a
                href="https://cloudinary.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Cloudinary
              </a>
              .
            </p>
            <p>
              <span role="img" aria-label="desktop computer">
                {" "}
              </span>{" "}
              It uses{" "}
              <a
                href="https://github.com/pmndrs/zustand"
                target="_blank"
                rel="noopener noreferrer"
              >
                Zustand
              </a>{" "}
              for state management and{" "}
              <a
                href="https://socket.io/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Socket.IO
              </a>{" "}
              for real-time communication.
            </p>
            <p>
              <span role="img" aria-label="heart">
                {" "}
              </span>{" "}
              It's open source and free to use.
            </p>
            <p>
              <span role="img" aria-label="github">
                {" "}
              </span>{" "}
              Check out the source code on{" "}
              <a
                href="https://github.com/avinash7r/full-chatApp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500"
              >
                GitHub
              </a>
              .
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
