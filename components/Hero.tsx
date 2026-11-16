import Terminal from "@/components/Terminal";

export default function Hero() {
  return (
    <section className="hero" id="about">
      <div className="hero-intro">
        <div className="hero-identity">
          <span className="hero-status-dot" />
          <span>UNDERGRADUATE · YUNNAN UNIVERSITY</span>
        </div>

        <h1 className="hero-heading">
          Hi, I&apos;m
          <br />
          <span>LittBox.</span>
        </h1>

        <p className="hero-subheading">
          Exploring intelligence,
          <br />
          building with curiosity.
        </p>

        <p className="hero-description">
          I&apos;m an undergraduate student at Yunnan University, interested in
          artificial intelligence, brain-computer interfaces, and intelligent
          systems.
        </p>

        <p className="hero-description hero-description-secondary">
          This is my little corner of the internet — a place to share research,
          projects, and moments captured through my lens.
        </p>

        <div className="hero-actions">
          <a href="#work" className="hero-button hero-button-primary">
            Explore my work
            <span aria-hidden="true">↗</span>
          </a>

          <a
            href="https://github.com/LittBox"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-button hero-button-secondary"
          >
            GitHub
            <span aria-hidden="true">↗</span>
          </a>
        </div>

        <div className="hero-bottom-note">
          <span className="hero-bottom-line" />
          <span>RESEARCH · CODE · PHOTOGRAPHY</span>
        </div>
      </div>

      <div className="hero-terminal">
        <Terminal />
      </div>
    </section>
  );
}
