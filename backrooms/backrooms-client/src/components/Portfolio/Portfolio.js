import React, { useEffect, useState } from 'react';
import resumeData from '../data/resumeData'

const Portfolio = () => {
  const [displayedSections, setDisplayedSections] = useState([]);
  const [currentContent, setCurrentContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  const sections = [
    { title: 'About Me', content: resumeData.about },
    { title: 'Skills', content: resumeData.skills.join(', ') },
    {
      title: 'Projects',
      content: resumeData.projects
        .map((project, index) => `${index + 1}. ${project.name}: ${project.description}`)
        .join('\n'),
    },
    {
      title: 'Experience',
      content: resumeData.experience
        .map(
          (job) =>
            `${job.role} at ${job.company} (${job.duration})\n- ${job.description.join('\n- ')}`
        )
        .join('\n\n'),
    },
    {
      title: 'Education',
      content: resumeData.education
        .map((edu) => `${edu.degree} from ${edu.institution} (${edu.year})`)
        .join('\n'),
    },
  ];

  useEffect(() => {
    if (currentIndex < sections.length) {
      if (charIndex < sections[currentIndex].content.length) {
        const timer = setTimeout(() => {
          setCurrentContent((prev) => prev + sections[currentIndex].content[charIndex]);
          setCharIndex((prev) => prev + 1);
        }, 10); // Faster typing speed
        return () => clearTimeout(timer);
      } else {
        // Add the current section to displayedSections once fully typed
        const timer = setTimeout(() => {
          setDisplayedSections((prev) => [
            ...prev,
            { title: sections[currentIndex].title, content: currentContent },
          ]);
          setCurrentIndex((prev) => prev + 1);
          setCurrentContent('');
          setCharIndex(0);
        }, 500); // Shorter delay between sections
        return () => clearTimeout(timer);
      }
    }
  }, [charIndex, currentIndex, currentContent]);

  return (
    <div className="portfolio-container">
      {displayedSections.map((section, index) => (
        <div key={index} className="portfolio-section">
          <h2 className="portfolio-section-title">{section.title}</h2>
          <p className="portfolio-content">{section.content}</p>
        </div>
      ))}
      {currentIndex < sections.length && (
        <div className="portfolio-section">
          <h2 className="portfolio-section-title">{sections[currentIndex].title}</h2>
          <p className="portfolio-content">{currentContent}</p>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
