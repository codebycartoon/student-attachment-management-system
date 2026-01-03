import React from 'react';
import './HeroTraditional.css';

const HeroTraditional = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Welcome to AttachPro</h1>
        <p>The most advanced student placement platform trusted by leading universities.</p>
        <a href="/register" className="cta-button">Get Started Free</a>
      </div>
      <div className="hero-image">
        <img src="/hero_image.jpg" alt="Student Attachment Management" />
      </div>
    </section>
  );
};

export default HeroTraditional;