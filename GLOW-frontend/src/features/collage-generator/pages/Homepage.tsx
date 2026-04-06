import React, { useEffect, useState } from 'react';
import GlowLogo from '../../../assets/GlowLogo.png';
import './css/HomePage.css'; 
import { getStatus, getDBTime } from '../../../shared/services/api';
import type { StatusResponse, DBTimeResponse } from '../../../shared/services/api';  // Use type-only import

const HomePage: React.FC = () => {
  const [status, setStatus] = useState<string>("");
  const [dbTime, setDbTime] = useState<string>("");

  useEffect(() => {
    getStatus().then((data: StatusResponse) => setStatus(data.status));
    getDBTime().then((data: DBTimeResponse) => setDbTime(data.time));
  }, []);

  return (
    <div className="HomePage">
      <header className="HomePage-header">
        <img src={GlowLogo} alt="GLOW Eindhoven Logo" className="HomePage-logo" />
        <h1>7 and 1 Nights: 1001 Stories</h1>
        <h2>Theme: Connect (Collective Storytelling)</h2>
        <h3>Core Value: The power of the unfinished story</h3>
      </header>

      <main className="HomePage-main">
        <section>
          <h2>The Philosophy: The Magic of the Cliffhanger</h2>
          <p>
            Just like Scheherazade in the tales of 1001 Nights, the children of Eindhoven and surrounding areas tell an endless story that spans 7 and 1 nights.
          </p>
          <ul>
            <li><strong>Endless Stories:</strong> Children create shadow puppets and tell collective stories in the classroom.</li>
            <li><strong>Magic Lanterns:</strong> Paper lanterns are decorated and projected during GLOW events.</li>
            <li><strong>GLOW Exhibition:</strong> Lanterns and projections are displayed at Catharinakerk and other locations.</li>
          </ul>
        </section>

        <section>
          <h2>The Three Meanings of "7 and 1"</h2>
          <ol>
            <li>The 1st Night at school – creating the first cliffhanger.</li>
            <li>The 8 Nights of GLOW Eindhoven.</li>
            <li>The city and 7 surrounding municipalities participating.</li>
            <li>Connection: 8 sides of the lantern craft kit.</li>
          </ol>
        </section>

        <section>
          <h2>Implementation: The "Invisible Magic Lamp"</h2>
          <p>
            In the Classroom: Children cut figures from black paper and project them, creating "Stories with Open Endings".
          </p>
          <p>
            The App digitizes these cutouts into a massive moving tapestry, ensuring stories flow seamlessly across classes and schools.
          </p>
          <p>
            In the Catharinakerk: Visitors are surrounded by the 360° endless story projection.
          </p>
        </section>

        <section>
          <h2>Digital App Description</h2>
          <p>
            From Shadow Silhouette to Digital Light Art. The app vectorizes children's paper cutouts, merges them into a digital tapestry, inverts colors, and animates them as a continuous montage.
          </p>
          <p>
            Local & Central Exhibition: Teachers can project in the classroom or upload for city-wide GLOW exhibitions.
          </p>
          <p>
            Online Presentation: Names of schools and classes are displayed, allowing children to find their own artwork online.
          </p>
        </section>

        <section>
          <h2>Project Team</h2>
          <ul>
            <li>Jordi Blaas</li>
            <li>Tony Genev</li>
            <li>Mirela Gîrleanu</li>
            <li>Katerina Borisova</li>
          </ul>
        </section>

        <section>
          <h2>System Status</h2>
          <p><strong>API Status:</strong> {status}</p>
          <p><strong>Database Time:</strong> {dbTime}</p>
        </section>
      </main>

      <footer className="HomePage-footer">
        <p>© GLOW Eindhoven 2026</p>
      </footer>
    </div>
  );
};

export default HomePage;