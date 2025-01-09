import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} IAMIS. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
