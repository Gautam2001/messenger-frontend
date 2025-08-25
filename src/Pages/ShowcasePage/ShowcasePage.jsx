import React from "react";
import {
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaFileDownload,
} from "react-icons/fa";
import { LuMessagesSquare } from "react-icons/lu";
import "./ShowcasePage.css";

const ShowcasePage = () => {
  return (
    <div className="showcase-wrapper">
      <div className="showcase-content">
        <div className="logo" title="Messenger">
          <LuMessagesSquare size={84} cursor="pointer" color="#007bff" />
        </div>
        <h1 className="showcase-title">Messengers</h1>
        <p className="showcase-subtitle">
          Connect. Chat. Share moments instantly.
        </p>
        <p className="showcase-builtby">Built by Gautam Singhal</p>

        <div className="showcase-links">
          <a
            href="mailto:singhal.gautam.gs@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="showcase-icon"
            title="Email"
          >
            <FaEnvelope />
          </a>
          <a
            href="https://github.com/Gautam2001"
            target="_blank"
            rel="noopener noreferrer"
            className="showcase-icon"
            title="GitHub"
          >
            <FaGithub />
          </a>
          <a
            href="https://www.linkedin.com/in/gautam-singhal-b87813226/"
            target="_blank"
            rel="noopener noreferrer"
            className="showcase-icon"
            title="LinkedIn"
          >
            <FaLinkedin />
          </a>
          <a
            href="https://drive.google.com/file/d/12H7y1snb15QF0t8YQLjJnmW4k-t-RPuC/view?usp=drive_link"
            target="_blank"
            rel="noopener noreferrer"
            className="showcase-icon"
            title="Download Resume"
          >
            <FaFileDownload />
          </a>
        </div>

        <div className="showcase-cta">
          <p>Start a conversation by selecting a contact on the left.</p>
        </div>
      </div>

      <div className="showcase-secondary-project">
        <h2>Explore More Projects</h2>
        <p className="secondary-description">
          Check out <strong>Wrap & Wow</strong> — a fun and personalized way to
          send messages.
        </p>
        <a
          href="https://wrap-and-wow.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="join-cta-button"
          title="Join Wrap & Wow"
        >
          Visit Wrap & Wow
        </a>
      </div>
      <div className="showcase-footer">
        © {new Date().getFullYear()} Messengers · All rights reserved.
      </div>
    </div>
  );
};

export default ShowcasePage;
